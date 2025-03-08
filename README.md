# [WinAutoShutdown](https://github.com/CurtisYan/winautoshutdown)
一个美观、现代的Windows自动关机应用程序，使用Rust + Tauri构建。

![WinAutoShutdown](https://curtisyan.oss-cn-shenzhen.aliyuncs.com/img/no_important/202503090211108.png)

## 功能特点

- 🕒 定时关机：设置倒计时，到时自动关闭电脑
- 📅 定点关机：设置特定时间点自动关机
- 🔔 关机前提醒：在关机前提供通知提醒
- ✨ 美观的UI：现代化设计，流畅的动画效果
- 🔄 实时倒计时：直观显示剩余时间
- 🛑 随时取消：一键取消已设置的关机计划

## 开发技术

- **前端**：React + TypeScript + TailwindCSS + Framer Motion
- **后端**：Rust + Tauri
- **构建**：Vite

## 安装使用

1. 下载最新版本的安装包：[点击下载(密码1234)](https://curtisyan.lanzn.com/ioLsy2q0kw9a)
2. 运行安装程序，按照提示完成安装
3. 启动应用程序，设置关机计划

## 开发指南

### 环境要求

- [Node.js](https://nodejs.org/) (v16+)
- [Rust](https://www.rust-lang.org/tools/install) (最新稳定版)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### 本地开发
（请参考BUILD_INSTRUCTIONS.md文件）

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run tauri dev

# 构建生产版本
npm run tauri build
```

## 打包为EXE文件

本项目使用Tauri的构建系统自动生成可执行文件。要生成独立的EXE文件：

1. 确保已安装所有依赖
2. 运行构建命令：`npm run tauri build`
3. 构建完成后，可执行文件将位于 `src-tauri/target/release/` 目录下

## 许可证

MIT

## 贡献
联系：[asiay.asia](https://asiay.asia/)


欢迎提交问题和贡献代码！ 