# 云学考 Monorepo Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建可运行的云学考 Next.js Monorepo 基础工程，并落首期学员端与移动端骨架。

**Architecture:** 使用 pnpm workspace 组织两个 Next.js App Router 应用和三个共享包。`apps/web` 承接旧 Vue 学员端迁移，`apps/mobile-web` 建立移动端骨架，`packages/api`、`packages/shared`、`packages/ui` 提供跨端复用。

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Zustand, pnpm workspace, Vercel

---

### Task 1: 初始化仓库与 workspace

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `README.md`
- Create: `.editorconfig`
- Create: `.npmrc`

- [ ] **Step 1: 初始化 Git 仓库**

Run: `git init`
Expected: 输出初始化仓库信息，生成 `.git`

- [ ] **Step 2: 创建 workspace 根配置**

创建根 `package.json`、`pnpm-workspace.yaml`、基础忽略文件与 README。

- [ ] **Step 3: 安装工作区依赖**

Run: `pnpm install`
Expected: 工作区 lockfile 与根依赖安装完成

### Task 2: 创建两个 Next.js 应用

**Files:**
- Create: `apps/web/**`
- Create: `apps/mobile-web/**`

- [ ] **Step 1: 创建 `apps/web`**

Run: `pnpm create next-app apps/web --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm`
Expected: 生成可运行的 App Router 工程

- [ ] **Step 2: 创建 `apps/mobile-web`**

Run: `pnpm create next-app apps/mobile-web --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm`
Expected: 生成第二个 App Router 工程

- [ ] **Step 3: 统一脚本与目录**

调整两个应用的 `package.json`、路径别名、基础目录，使其更适合 Monorepo 结构。

### Task 3: 创建共享包

**Files:**
- Create: `packages/api/package.json`
- Create: `packages/api/src/**`
- Create: `packages/shared/package.json`
- Create: `packages/shared/src/**`
- Create: `packages/ui/package.json`
- Create: `packages/ui/src/**`

- [ ] **Step 1: 创建共享包 package 配置**

为三个包建立 `package.json`、`tsconfig.json` 和导出入口。

- [ ] **Step 2: 搭建共享类型、常量与工具**

在 `packages/shared` 中放置品牌信息、路由常量、类型定义、工具函数。

- [ ] **Step 3: 搭建 API 客户端**

在 `packages/api` 中实现基础 HTTP client、错误对象、token 读取辅助和业务域接口映射。

- [ ] **Step 4: 搭建 UI 基础层**

在 `packages/ui` 中实现主题变量、布局组件、空态/错态/loading 组件与基础 shell。

### Task 4: 应用基础设施与主题

**Files:**
- Modify: `apps/web/src/app/**`
- Modify: `apps/mobile-web/src/app/**`
- Create: `apps/web/src/store/**`
- Create: `apps/mobile-web/src/store/**`
- Create: `.env.example`

- [ ] **Step 1: 配置全局样式与主题变量**

统一 Tailwind 样式入口与 CSS Variables，形成清新教育平台风格。

- [ ] **Step 2: 配置 Zustand**

在两个应用中创建本地交互 store，避免服务端数据进入全局状态。

- [ ] **Step 3: 配置请求层接入**

让两个应用通过 `packages/api` 使用统一请求能力。

- [ ] **Step 4: 配置环境变量样例**

补齐 `.env.example`，预留 API 基地址、站点名称、资源域名等。

### Task 5: 搭建页面骨架

**Files:**
- Modify/Create: `apps/web/src/app/(auth)/**`
- Modify/Create: `apps/web/src/app/(marketing)/**`
- Modify/Create: `apps/web/src/app/(student)/**`
- Modify/Create: `apps/mobile-web/src/app/**`

- [ ] **Step 1: `apps/web` 门户与登录骨架**

建立首页、登录页与通用站点头部。

当前进展：
- 已完成首页首轮迁移，接入 Banner、公告、热门课程、最新考试、问卷调查、文章资讯接口。
- 已完成首页视觉重设计，当前方向已调整为“年轻科技教育首页”。
- 已将首页内容重组为产品化 Hero、数据面板、课程推荐、考试快讯、问卷清单、资讯热榜，继续保留真实接口数据源。
- 已把首页当前配色同步到 `packages/ui/src/styles/globals.css` 的 shadcn 主题 token，后续共享组件将默认沿用这套蓝色系统。
- 已将首页大文件拆分为 `home-hero`、`home-sidebar`、`home-courses-section`、`home-exams-section`、`home-questionnaires-section`、`home-news-section` 等小组件，并同步重排页面栅格。
- 已修复首页首屏根栅格设置错误造成的右侧整块空白问题，并收紧 Hero 内部列宽比例。
- 已新增 `packages/motion` 共享动画层，并将首页接入参考 `vibe-hand-off` 的分层 motion 节奏；底层实现已切换到 `motion/react`。
- 已新增夜间模式切换基础设施，并修复首页主 CTA 文字颜色与 Hero 内部卡片布局留白问题。
- 已补齐首页主要业务卡片的 dark 模式样式，包括课程、问卷、考试快讯和文章资讯模块。
- 已继续修正夜间模式下考试快讯指标区和热度追踪面板的布局与层级问题。
- 已修正首页中段布局，将考试快讯从“课程 + 侧栏”组合中拆出为独立整行模块。
- 已微调考试卡片标题区对齐和问卷/考试状态标签内边距。
- 已修复头部 Logo 文案在 dark 模式下的颜色适配问题。
- 已将首页底部区域调整为三列结构，并统一标题区高度以修复问卷、资讯、热度排行的标题错位。
- 已优化区块头部“查看更多”按钮的横向尺寸与排版，修复文字被压成竖排的问题。
- 已补齐右下角“热度追踪”在 light 模式下的主题样式。
- 已按新的参考风格重构首页整体布局：头部加入轻量搜索框，首屏改为双栏 Hero，中文文案统一切回教育平台语境。
- 已将首页主内容重组为学习总览、教务通知、考试安排、问卷资讯和底部 CTA 五个层级，保留关键概览与其他页面入口。
- 已继续压缩首屏文案和主标题体量，修正右侧学习总览卡的边框与悬浮信息位置。
- 已重新排布第二屏与第三屏：第二屏为“课程主卡 + 教务侧栏”，第三屏为“资讯主区 + 热点/问卷侧栏”。
- 已将最后一屏右侧的问卷模块改为紧凑任务面板，并同步收紧热点模块标题与容器尺寸。
- 已完成登录页真实登录接口接入。

- [ ] **Step 2: `apps/web` 学员主链路骨架**

建立我的课程、课程学习、在线练习、在线考试、成绩、个人中心页。

- [ ] **Step 3: `apps/mobile-web` 四个骨架页**

建立首页、学习、考试、我的页面和底部导航。

- [ ] **Step 4: 错误页与 loading**

为关键分区补齐 `loading.tsx`、`error.tsx`、`not-found.tsx`。

### Task 6: 引入 shadcn/ui 与工程规范

**Files:**
- Create/Modify: `components.json`
- Modify: `apps/*/package.json`
- Create/Modify: `packages/ui/src/components/**`
- Create: `.prettierrc`

- [ ] **Step 1: 初始化 shadcn/ui**

在 Monorepo 场景下为可复用 UI 层生成配置和基础组件。

- [ ] **Step 2: 添加基础组件**

至少引入 Button、Card、Input、Table、Badge、Sheet、Dialog、Skeleton 等基础组件。

- [ ] **Step 3: 补齐格式化与 lint 约束**

统一 Prettier、ESLint 脚本和常用命令。

### Task 7: 验证

**Files:**
- Modify as needed from previous tasks

- [ ] **Step 1: 安装全部依赖**

Run: `pnpm install`
Expected: 所有 workspace 依赖安装完成

- [ ] **Step 2: 运行构建**

Run: `pnpm build`
Expected: 两个应用与共享包构建通过

- [ ] **Step 3: 运行 lint**

Run: `pnpm lint`
Expected: 无阻塞错误

- [ ] **Step 4: 更新 README**

写明运行方式、目录说明、迁移来源和下一阶段建议
