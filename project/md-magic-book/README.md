# 📖 Markdown 魔法书 (Markdown Magic Book)

> 一个工具 = Markdown 编辑器 + 演示文稿。打开即用，零配置，实时预览，一键切换全屏演示模式。

![AdventureX 2026](https://img.shields.io/badge/AdventureX-2026-orange) ![License](https://img.shields.io/badge/license-MIT-blue) ![Vanilla JS](https://img.shields.io/badge/vanilla-js-yellow)

---

## ✨ 功能特性

### 📝 Markdown 编辑器

- **实时预览** — 分栏 / 仅预览 / 仅编辑三种视图模式，自由切换
- **代码高亮** — 基于 highlight.js，支持多种编程语言语法高亮
- **自动保存** — 内容自动保存到 localStorage，不怕丢失
- **智能状态栏** — 实时显示行数、字数、字符数
- **模板插入** — 内置会议纪要、项目文档、博客文章模板，一键切换
- **Markdown 导入** — 支持打开本地 `.md` 文件

### 🎬 演示模式

- **自动分页** — 按 `#` / `##` 标题或 `---` 分隔符自动拆分为幻灯片
- **流畅动画** — 页面切换带渐入、左推、右推动画效果
- **键盘导航** — 方向键 / 空格键翻页，Esc 退出
- **点击翻页** — 屏幕左右两侧大区域点击翻页
- **页码指示** — 顶部显示当前页 / 总页数

### 📤 导出功能

- **下载 .md** — 导出为纯 Markdown 文件
- **导出 HTML** — 导出为带样式的独立 HTML 文件
- **零依赖导出** — 导出的 HTML 自带完整样式，离线可用

## 🚀 快速开始

1. 在浏览器中打开 `index.html`
2. 开始输入 Markdown，右侧实时预览
3. 点击 **🎬 演示** 进入全屏演示模式
4. 使用方向键翻页，Esc 退出

无需安装、无需构建、无需注册 —— 打开即用。

## 🧰 技术栈

| 组件 | 技术 |
|------|------|
| Markdown 渲染 | [marked.js](https://marked.js.org/) (CDN) |
| 代码高亮 | [highlight.js](https://highlightjs.org/) (CDN) |
| 字体 | Inter + JetBrains Mono (Google Fonts) |
| 存储 | localStorage 自动保存 |
| 架构 | 纯 Vanilla JS，零框架 |

## 📁 项目结构

```
md-magic-book/
├── index.html            # 主页面（编辑器 + 演示 UI）
├── css/
│   └── style.css         # 样式（Swiss Minimalism + Orange）
├── js/
│   ├── main.js           # 入口 & 流程控制 & 导出
│   ├── editor.js         # Markdown 编译器（marked.js 封装）
│   └── presentation.js   # 演示引擎（分页 & 动画）
└── README.md
```

## 🎯 快捷键

| 快捷键 | 功能 |
|--------|------|
| `←` `→` `↓` `↑` `Space` | 演示模式翻页 |
| `Esc` | 退出演示模式 |
| `Ctrl+S` / `⌘S` | 浏览器保存（自动保存始终开启） |

## 🎨 设计理念

- **Swiss Minimalism** — 极简瑞士风格，暖灰底色 + 橙色点缀
- **无干扰写作** — 编辑和预览分栏，内容优先
- **演示即内容** — 同一份 Markdown 既是文档也是 PPT

## 🛠️ 浏览器兼容性

支持所有现代浏览器：Chrome / Firefox / Safari / Edge。

## 📄 License

MIT — 自由使用，欢迎贡献。

---

<p align="center"><i>Made for AdventureX 2026 Hackathon</i></p>
