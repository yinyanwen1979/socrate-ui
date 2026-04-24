# Socrate UI

> 苏格拉底式 AI 教学系统 — 通过追问激发深度理解

AI 驱动的交互式教学平台，基于 Socratic Method（苏格拉底式教学法），帮助学习者通过结构化课程大纲、AI 生成备课和智能进度追踪实现深度学习。

![Academic Luxe 风格](https://img.shields.io/badge/style-Academic%20Luxe-warm-gold)
![React 18](https://img.shields.io/badge/React-18-blue)
![Express.js](https://img.shields.io/badge/Express-4-green)
![Vite](https://img.shields.io/badge/Vite-5-purple)

---

## 🎯 功能特性

### 核心功能

| 模块 | 功能 |
|------|------|
| **课程大纲** | 从主题描述自动生成 UB-EQ-SWBAT 结构化大纲，支持章节编辑 |
| **苏格拉底备课** | 基于 KP（知识点）生成含核心问题、误解分析的高质量备课 |
| **知识测验** | 自动生成选择题/简答题/判断题，支持答案对照 |
| **进度追踪** | 知识点依赖图 + 章节进度 + 薄弱点分析 |
| **质量检查** | 覆盖率分析 + 问题建议 + 改进优先级 |

### 设计风格

- **Academic Luxe 学院古典风** — 暖羊皮纸色调 + Cormorant Garamond 衬线字体 + 暖金色点缀
- 全中文界面，学术氛围浓厚

---

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18
- npm ≥ 9

### 安装 & 启动

```bash
# 1. 克隆仓库
git clone https://github.com/yinyanwen1979/socrate-ui.git
cd socrate-ui

# 2. 安装依赖
npm install
cd frontend && npm install && cd ..

# 3. 初始化教学数据（可选）
npm run setup-data

# 4. 启动开发服务器
npm start
```

启动后访问：**http://localhost:5173**

- 前端：`http://localhost:5173`（React + Vite）
- 后端：`http://localhost:3001`（Express API）

### 目录结构

```
socrate-ui/
├── frontend/               # React 18 前端
│   └── src/
│       ├── pages/          # 7 个页面组件
│       │   ├── Dashboard      # 学习台首页
│       │   ├── NewOutline     # 新建大纲
│       │   ├── OutlineDetail  # 大纲详情
│       │   ├── LessonViewer  # 备课查看器
│       │   ├── QuizViewer    # 知识测验
│       │   ├── Progress      # 学习进度
│       │   └── QualityCheck  # 质量检查
│       ├── components/     # 公共组件（Layout 导航）
│       ├── api/            # API 调用层
│       └── styles/         # CSS 样式
├── server/                 # Express 后端
│   ├── routes/            # API 路由
│   └── index.js           # 服务器入口
├── socrate-data/          # Markdown 教学数据
│   ├── outlines/          # 课程大纲（.md）
│   ├── lessons/          # 备课内容（.md）
│   ├── quizzes/           # 测验题目（.json）
│   └── progress.json      # 学习进度数据
└── package.json          # 并发启动配置
```

---

## 📖 数据格式

### 大纲文件（outlines/*.md）

```markdown
---
title: AI Agent 开发入门
slug: ai-agent-outline
difficulty: medium
targetAudience: 希望了解 AI Agent 基础概念的开发者和学习者
estimatedHours: 8
prerequisites: 了解 API 调用基础
---

# AI Agent 开发入门

## 第一章：基础概念
### KP-1.1.1: Agent vs Assistant 区别
- **UB (Enduring Understanding)**: ...
- **EQ (Essential Question)**: ...
- **SWBAT**: ...
```

### 备课文件（lessons/*.md）

```markdown
---
kpId: KP-1.1.1
outlineSlug: ai-agent-outline
title: Agent vs Assistant 区别
difficulty: medium
estimatedMinutes: 45
---

# 备课：Agent vs Assistant 区别

## 核心问题
...
```

---

## 🔧 API 路由

| 方法 | 路由 | 功能 |
|------|------|------|
| GET | `/api/outlines` | 获取所有大纲列表 |
| GET | `/api/outlines/:slug` | 获取单个大纲详情 |
| POST | `/api/outlines` | 创建新大纲 |
| GET | `/api/lessons/:kpId` | 获取指定 KP 的备课 |
| POST | `/api/lessons/generate/:kpId` | AI 生成备课 |
| GET | `/api/progress` | 获取学习进度 |
| POST | `/api/quiz/generate` | 生成知识测验 |
| GET | `/api/quiz/:outlineSlug` | 获取大纲的测验 |

---

## 🎨 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + React Router v6 |
| 构建工具 | Vite 5 |
| UI 组件 | Lucide React（图标） |
| 后端框架 | Express.js 4 |
| 数据格式 | Markdown（gray-matter）|
| 开发工具 | Concurrently（并发启动） |

---

## 📂 相关项目

- [Socrate](https://github.com/yinyanwen1979/Socrate) — AI Agent 学习课程（OpenClaw Skill）
- [socrate-teaching](https://github.com/yinyanwen1979/skills/socrate-teaching) — OpenClaw 命令行集成

---

## 📄 许可证

MIT License
