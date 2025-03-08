# WinAutoShutdown 构建指南

本文档提供了如何构建和打包 WinAutoShutdown 应用程序的详细说明。

## 前提条件

在开始构建之前，请确保您的系统上已安装以下软件：

1. **Node.js** (v16+) - [下载链接](https://nodejs.org/)
2. **Rust** (最新稳定版) - [安装指南](https://www.rust-lang.org/tools/install)
3. **Tauri 依赖项** - 根据您的操作系统，可能需要安装额外的依赖项：
   - **Windows**: 
     - [Microsoft Visual Studio C++ 构建工具](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
     - [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (Windows 10/11 通常已预装)

## 替换图标文件

在构建应用程序之前，您需要替换 `src-tauri/icons/` 目录中的占位图标文件：

- `icon.ico` - Windows 应用程序图标
- `32x32.png` - 32x32 像素的 PNG 图标
- `128x128.png` - 128x128 像素的 PNG 图标
- `128x128@2x.png` - 256x256 像素的 PNG 图标（用于高 DPI 显示）
- `icon.icns` - macOS 应用程序图标

您可以使用在线工具如 [ConvertICO](https://convertico.com/) 或 [ICOConvert](https://icoconvert.com/) 来创建这些图标文件。

## 构建步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式运行

如果您想在开发模式下测试应用程序：

```bash
npm run tauri dev
```

### 3. 构建生产版本

要构建生产版本的应用程序：

```bash
npm run tauri build
```

构建完成后，可执行文件将位于以下位置：

- **Windows**: `src-tauri/target/release/WinAutoShutdown.exe`
- **Windows 安装程序**: `src-tauri/target/release/bundle/msi/WinAutoShutdown_0.1.0_x64_en-US.msi`

## 常见问题解决

### 构建失败

如果构建过程失败，请检查：

1. 确保所有依赖项都已正确安装
2. 检查 Rust 和 Node.js 是否为最新版本
3. 在 Windows 上，确保已安装 Visual Studio C++ 构建工具

### 图标问题

如果应用程序图标不显示或显示不正确：

1. 确保所有图标文件格式正确
2. 图标文件必须是指定的确切尺寸
3. 重新构建应用程序

## 自定义应用程序

### 修改应用程序名称

要更改应用程序名称，请编辑以下文件：

- `package.json` 中的 `name` 字段
- `src-tauri/tauri.conf.json` 中的 `productName` 字段
- `src-tauri/Cargo.toml` 中的 `name` 字段

### 修改应用程序版本

要更改应用程序版本，请编辑以下文件：

- `package.json` 中的 `version` 字段
- `src-tauri/tauri.conf.json` 中的 `version` 字段
- `src-tauri/Cargo.toml` 中的 `version` 字段

## 发布应用程序

构建完成后，您可以将以下文件分发给用户：

- **独立可执行文件**: `src-tauri/target/release/WinAutoShutdown.exe`
- **Windows 安装程序**: `src-tauri/target/release/bundle/msi/WinAutoShutdown_0.1.0_x64_en-US.msi`

用户只需下载并运行这些文件，无需安装任何额外的依赖项或运行时。 