#!/usr/bin/env python3
import os
import subprocess
import sys
import tempfile
import time

def run_git_command(args, **kwargs):
    """运行Git命令并处理可能的错误"""
    try:
        return subprocess.run(["git"] + args, capture_output=True, text=True,
                             encoding="utf-8", **kwargs)
    except subprocess.CalledProcessError as e:
        if "dubious ownership" in e.stderr:
            print("检测到Git仓库所有权问题...")
            # 尝试自动添加safe.directory
            repo_path = os.getcwd()
            print(f"正在将 {repo_path} 添加为安全目录...")
            try:
                subprocess.run(
                    ["git", "config", "--global", "--add", "safe.directory", repo_path],
                    check=True
                )
                # 重试原始命令
                return subprocess.run(["git"] + args, capture_output=True, text=True,
                                     encoding="utf-8", **kwargs)
            except Exception as ex:
                print(f"无法自动解决所有权问题。请手动运行以下命令：")
                print(f"git config --global --add safe.directory \"{repo_path}\"")
                raise ex
        else:
            raise e

def main():
    # 定义要修改的提交及其新的消息格式
    commits = {
        "4b53a2f": "chore(version): 更新版本号至2.0.0，提升功能和兼容性",
        "5db2840": "ci(workflow): 更新GitHub Actions工作流，添加对标签的支持，优化版本信息提取和变更日志生成",
        "c7b6d9a": "chore(version): 更新版本号至1.1.3",
        "046fa2c": "ci(workflow): 更新GitHub Actions工作流，添加对标签的支持并明确写入权限\ndocs(readme): 改善功能描述和安装说明",
        "c9fe63d": "chore(version): 更新到版本1.1.2",
        "5ebd3bb": "chore(version): 更新版本号至1.1.1",
        "56c3ee3": "chore(version): 更新版本号至1.1.0",
        "872b418": "ci(deps): 更新GitHub Actions工作流，升级依赖至最新版本",
        "6969bf4": "ci(workflow): 添加GitHub Actions工作流以打包Chrome扩展",
        "c540dae": "chore(version): 更新版本号至1.0.2",
        "0cbe372": "feat(ui): 添加可展开/收起功能以优化数据展示",
        "62eb84f": "feat(ui): 添加长文本截断功能，优化显示并增加展开/收起按钮",
        "fec6c76": "style(ui): 优化复制按钮样式，增加最小宽度、文本对齐和边距",
        "c0e8336": "docs: 更新描述信息，增加数据复制功能和视图切换选项",
        "67e0342": "chore(version): 更新版本号至1.0.1",
        "86f4c7a": "feat: 初始提交：添加Chrome扩展程序以提取Cookies和Storage数据"
    }

    print("尝试解决可能的Git仓库所有权问题...")
    # 首先尝试添加当前目录为安全目录
    repo_path = os.getcwd()
    try:
        subprocess.run(
            ["git", "config", "--global", "--add", "safe.directory", repo_path],
            check=True
        )
        print(f"已将 {repo_path} 添加为安全目录")
    except Exception as e:
        print(f"注意：无法自动添加安全目录: {str(e)}")
        print("如果稍后遇到所有权问题，请手动运行以下命令：")
        print(f"git config --global --add safe.directory \"{repo_path}\"")

    # 检查是否有未提交的修改
    status = run_git_command(["status", "--porcelain"])
    if status.stdout.strip():
        print("错误：本地有未提交的修改。请先提交或储藏(stash)这些修改。")
        sys.exit(1)

    # 创建备份分支
    current_branch = run_git_command(
        ["rev-parse", "--abbrev-ref", "HEAD"]
    ).stdout.strip()

    # 使用Python的time模块生成时间戳
    backup_branch = f"{current_branch}_backup_{int(time.time())}"
    run_git_command(["branch", backup_branch], check=True)
    print(f"已创建备份分支: {backup_branch}")

    # 开始修改提交信息
    print("开始修改提交信息...")

    # 检查是否找到了所有提交
    for commit_hash in commits.keys():
        try:
            run_git_command(
                ["rev-parse", "--verify", commit_hash],
                check=True
            )
        except subprocess.CalledProcessError:
            print(f"错误：找不到提交 {commit_hash}")
            sys.exit(1)

    # 使用简单方法逐个修改提交
    print("将使用逐个提交的方式进行修改...")

    # 排序提交，确保从最早的提交开始处理
    sorted_commits = []
    try:
        # 获取所有提交的顺序列表
        log_output = run_git_command(
            ["log", "--format=%H", "--reverse"],
            check=True
        ).stdout.strip().split('\n')

        # 按照提交历史排序
        for full_hash in log_output:
            short_hash = full_hash[:7]
            if short_hash in commits:
                sorted_commits.append((short_hash, commits[short_hash]))
    except Exception as e:
        print(f"获取提交历史时出错: {str(e)}")
        sys.exit(1)

    if not sorted_commits:
        print("没有找到匹配的提交需要修改")
        sys.exit(0)

    print(f"找到 {len(sorted_commits)} 个提交需要修改")

    # 使用Git Filter-Branch方法修改提交信息
    try:
        for commit_hash, new_message in sorted_commits:
            # 创建一个临时文件来存储新的提交信息
            with tempfile.NamedTemporaryFile(mode='w', delete=False, encoding='utf-8') as msg_file:
                msg_file.write(new_message)
                msg_file_path = msg_file.name

            # 构建一个过滤器脚本
            filter_script = f'''
if [ "$GIT_COMMIT" = $(git rev-parse {commit_hash}) ]
then
    cat {msg_file_path}
else
    cat
fi
'''
            # 创建临时脚本文件
            with tempfile.NamedTemporaryFile(mode='w', delete=False, encoding='utf-8') as script_file:
                script_file.write(filter_script)
                script_path = script_file.name

            # 使用filter-branch修改提交信息
            try:
                subprocess.run(
                    ["git", "filter-branch", "-f", "--msg-filter", f"bash {script_path}",
                     f"{commit_hash}^..{commit_hash}"],
                    check=True,
                    capture_output=True,
                    encoding="utf-8"
                )
                print(f"已修改提交: {commit_hash} -> {new_message.splitlines()[0]}")
            except subprocess.CalledProcessError as e:
                print(f"修改提交 {commit_hash} 时出错: {e.stderr}")
                raise e
            finally:
                # 清理临时文件
                os.unlink(msg_file_path)
                os.unlink(script_path)

    except Exception as e:
        print(f"发生错误: {str(e)}")
        print("正在恢复到备份分支...")
        subprocess.run(["git", "reset", "--hard", backup_branch], check=True)
        sys.exit(1)

    print("\n所有提交已成功修改！")
    print(f"原始分支备份在: {backup_branch}")
    print("注意：这是一个强制性的历史修改。如果这是一个共享仓库，请确保与团队成员协调好。")
    print("使用以下命令推送修改后的历史:")
    print(f"  git push --force-with-lease origin {current_branch}")

if __name__ == "__main__":
    main()