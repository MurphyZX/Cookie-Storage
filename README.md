# Cookie和Storage提取器

一个简单实用的Chrome扩展，用于提取当前网站的Cookie、Local Storage和Session Storage数据。

## 功能特点

- 一键提取当前网站的Cookie数据
- 一键提取当前网站的Local Storage数据
- 一键提取当前网站的Session Storage数据
- 支持以列表或原始格式查看数据
- 支持单独复制每条数据（键、值或键值对）
- 支持复制所有数据到剪贴板
- 支持点击展开/收起长内容

## 安装方法

### 从Chrome网上应用店安装
1. 访问[Chrome网上应用店](https://chromewebstore.google.com/detail/glomgihfckpdpjgidnfkcmaemljkimgk?utm_source=item-share-cb)
2. 搜索"Cookie和Storage提取器"
3. 点击"添加到Chrome"按钮

### 手动安装
1. 下载最新版本：[Releases](https://github.com/MurphyZX/Cookie-Storage/releases)
2. 在Chrome中打开扩展管理页面 (chrome://extensions/)
3. 启用"开发者模式"
4. 点击"加载已解压的扩展"
5. 选择解压后的扩展文件夹

## 使用方法

1. 点击Chrome工具栏中的扩展图标
2. 在弹出窗口中选择要查看的数据类型（Cookie、Local Storage或Session Storage）
3. 点击"获取XXX"按钮获取数据
4. 数据会以列表形式显示，可以单独复制每一项
5. 对于较长的内容，点击键值可以展开/收起完整内容
6. 也可以点击"复制全部到剪贴板"按钮复制所有数据

## 隐私声明

本扩展只在用户点击时读取当前网站的数据，不会自动收集或发送任何数据到任何服务器。所有操作都在本地完成，确保您的数据安全。

## 开发者信息

### 项目结构
```
cookie-storage-extractor/
├── .github/workflows/    # GitHub Actions自动化配置
├── images/               # 扩展图标和图片
├── popup.html            # 弹出窗口HTML
├── popup.js              # 弹出窗口JavaScript
├── manifest.json         # 扩展配置文件
└── README.md             # 项目说明
```

## 贡献指南

欢迎提交Pull Request或Issues来改进这个扩展！ 
