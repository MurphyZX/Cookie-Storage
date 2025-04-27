# Cookie和Storage提取器

这是一个Chrome浏览器扩展，可以一键提取当前网站的Cookies、Local Storage和Session Storage数据。

## 功能

- 提取并显示当前网站的Cookies
- 提取并显示当前网站的Local Storage数据
- 提取并显示当前网站的Session Storage数据
- 一键复制数据到剪贴板

## 安装方法

### 开发者模式安装

1. 下载此仓库的所有文件并保存到您的计算机上
2. 打开Chrome浏览器，输入地址：`chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择包含这些文件的文件夹
6. 扩展程序将会被添加到您的Chrome浏览器中

## 使用方法

1. 打开任意网站
2. 点击Chrome工具栏中的扩展图标（Cookie和Storage提取器）
3. 在弹出窗口中选择您希望提取的数据类型：
   - Cookie
   - Local Storage
   - Session Storage
4. 点击相应的"获取"按钮获取数据
5. 可以使用"复制到剪贴板"按钮复制数据

## 权限说明

此扩展需要以下权限：

- `cookies`: 用于读取网站的cookies
- `storage`: 用于访问浏览器的存储功能
- `activeTab`: 用于获取当前活动标签页的信息
- `scripting`: 用于在当前页面执行脚本以读取storage数据
- `clipboardWrite`: 用于将数据复制到剪贴板
- `<all_urls>`: 使扩展程序可以在所有网站上工作

## 隐私说明

- 此扩展程序仅在用户主动点击按钮时读取数据
- 数据仅显示在扩展程序的弹出窗口中，不会被上传到任何服务器
- 所有处理都在本地完成 