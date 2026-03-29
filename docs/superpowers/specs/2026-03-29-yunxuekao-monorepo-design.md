# 云学考 Monorepo 重构设计

**日期：** 2026-03-29

## 背景

旧项目位于 `/Users/nanfugongmeiying/Desktop/project/student-front-master`，是一个基于 Vue 3 + Vite + Ant Design Vue 的学员端门户应用，已经覆盖课程学习、在线练习、在线考试、商城支付、资讯、AI 助手、个人中心等业务能力。当前目标不是重新设计一套新业务系统，而是将现有前端迁移到适合长期维护的 Next.js 技术栈，并为未来管理端与移动端扩展预留工程结构。

## 旧项目分析摘要

### 页面与路由

- 主入口布局：`src/views/Index.vue` + `src/components/Header.vue`
- 一级路由：`/home`、`/course`、`/practice`、`/exam`、`/questionnaire`、`/news`、`/ai`、`/userCenter`
- 独立页：`/login`、`/register`、`/exam/onlineExam/:id`、支付页、考试结果页、404
- 当前仓库未发现管理端页面，现有资产明确是学员端/门户端

### 接口结构

- 业务域 API 已按文件拆分：`src/api/login.ts`、`course.ts`、`practice.ts`、`exam.ts`、`user.ts`、`order.ts`、`pay.ts`、`invigilate.ts` 等
- 统一请求层位于 `src/utils/request.js`
- 已有能力：token 注入、401 跳转登录、错误提示、blob 下载兼容
- 接口协议继续沿用，不在本次重构中重新设计

### 状态与交互

- Pinia store 很轻，主要管理登录态、用户信息、本地 UI 状态、考试离屏状态
- 说明旧项目并未把服务端数据重度塞入全局状态，适合在 Next.js 中延续“服务端数据归请求层，本地交互归 Zustand”的策略

### 样式与品牌

- 已有品牌资产和 Logo：`public/logo.png`、`src/assets/img/index/logo.png`
- 现有视觉为教育平台门户风格，偏轻量、偏亲和，不适合迁移成厚重政务后台
- 存在全局 CSS/LESS/SCSS 和较多业务组件样式，适合迁移为 Tailwind + CSS Variables 驱动的主题系统

## 架构决策

### 结论

采用 **Monorepo 多应用结构**。

### 原因

1. 当前仅拿到学员端旧项目，但需求明确包含未来管理端、考生 PC 端、移动端扩展。
2. 学员 PC 与移动端未来在页面结构、交互密度、学习/考试流程上很可能逐渐分化，单应用长期会让路由和组件职责变混。
3. 共享 UI、类型、请求层、常量与领域模型的价值很高，Monorepo 可以在保持端独立演进的同时最大化复用。
4. Vercel 对多应用仓库支持成熟，便于后续分别部署。

## 首期范围

### 本期要做

- 初始化 `pnpm workspace` Monorepo
- 创建 `apps/web`：承接旧 Vue 学员端核心迁移
- 创建 `apps/mobile-web`：建立移动端首页/学习/考试/我的骨架
- 创建 `packages/ui`、`packages/shared`、`packages/api`
- 搭建 Tailwind、shadcn/ui、Zustand、请求层、主题系统、布局系统
- 迁移首批代表性页面壳层与路由骨架

### 本期不做

- 管理端完整业务实现
- 移动端全量业务迁移
- 对现有后端接口进行协议级重构
- 支付、人脸核验、视频上传等复杂能力的完整交互闭环

## 目录设计

```text
apps/
  web/
    src/
      app/
      components/
      features/
      store/
      lib/
  mobile-web/
    src/
      app/
      components/
      features/
packages/
  api/
    src/
      auth/
      course/
      exam/
      practice/
      order/
      user/
      invigilate/
  shared/
    src/
      constants/
      types/
      utils/
      config/
  ui/
    src/
      components/
      layout/
      feedback/
      data-display/
```

## 路由组织

### `apps/web`

- `(marketing)`：门户首页、资讯等公开页
- `(auth)`：登录、注册
- `(student)`：课程、练习、考试、个人中心等主业务页

### `apps/mobile-web`

- `/`
- `/learn`
- `/exam`
- `/me`

移动端首期先保留独立应用和基础导航，不强行与 PC 共用同一路由树。

## 请求层设计

- `packages/api` 提供按业务域拆分的请求函数
- 抽出统一 `createApiClient()`，支持：
  - `baseURL`
  - `X-exam-Token`
  - 通用错误格式处理
  - 文件上传
  - blob/stream 预留
- 区分：
  - server-safe 数据读取接口
  - browser client 交互接口
- 登录态优先由 cookie/token 读取工具管理，不把服务端拉取的数据塞进 Zustand

## 状态层设计

Zustand 仅用于：

- 筛选条件
- 弹窗与抽屉状态
- 答题过程的客户端状态
- 播放器 UI 状态
- 少量持久化用户偏好
- 移动端导航状态

不用于：

- 课程列表、考试列表、用户资料等服务端主数据缓存

## UI 体系设计

- 基于 shadcn/ui 作为基础组件源代码
- 使用 Tailwind + CSS Variables 建立主题令牌
- 统一：
  - 色板
  - 字号层级
  - 圆角体系
  - 阴影
  - 表单/卡片/表格风格
- 首期优先建设：
  - 顶部导航
  - 侧边导航
  - 页面容器
  - 数据表格外壳
  - 搜索筛选区
  - Empty/Error/Loading 状态

## Vue -> Next.js 模块映射

- `src/views/home/Index.vue` -> `apps/web/src/app/(marketing)/page.tsx`
- `src/views/Login.vue` -> `apps/web/src/app/(auth)/login/page.tsx`
- `src/views/course/*` -> `apps/web/src/app/(student)/courses/**`
- `src/views/practice/*` -> `apps/web/src/app/(student)/practice/**`
- `src/views/exam/*` -> `apps/web/src/app/(student)/exams/**`
- `src/views/user/*` -> `apps/web/src/app/(student)/me/**`
- `src/components/Header.vue` -> `packages/ui/src/layout/site-header.tsx`
- `src/components/public/EmptyData.vue` -> `packages/ui/src/feedback/empty-state.tsx`
- `src/api/*` -> `packages/api/src/*`
- `src/store/*` -> `apps/web/src/store/*` 与 `apps/mobile-web/src/store/*`

## 首批迁移页面

### `apps/web`

- 登录页
- 首页
- 我的课程
- 课程学习页
- 在线练习页
- 在线考试页
- 成绩页
- 个人中心页
- 首页主模块已按旧 Vue 首页完成首轮迁移：Banner、公告、热门课程、最新考试、问卷调查、文章资讯
- 首页视觉方向当前已切换为“年轻科技教育风”，采用浅蓝渐变背景、轻玻璃卡片、状态数据面板和更强的产品化信息层级
- 首页继续保留旧数据结构，但表达方式更接近学习平台与考试产品首页，而不是刊物式内容页
- 已将首页使用的浅蓝品牌色、主按钮蓝、浅天青次级色和蓝灰边框同步沉淀到 `packages/ui` 的 shadcn 主题变量中，供后续组件统一复用
- 首页布局已进一步重构为三段式结构：首屏 Hero、第二屏“课程/考试 + 公告/快捷入口”、第三屏“问卷 + 资讯”，并按 Vercel/Next 最佳实践拆分为多个小型 Server Components
- 已修正首页首屏外层误用双列栅格导致的大面积右侧留白问题，Hero 现为满宽容器，推荐卡只占内部列宽
- 参考 `Justineo/vibe-hand-off` 的动效组织方式，首页新增了“顺序入场 + 滚动 reveal + 轻微浮动”三类 motion；动画基础能力已下沉到 `packages/motion`，底层依赖使用 `motion` 并从 `motion/react` 导入
- 已新增共享夜间模式能力：根布局接入主题提供器、头部加入浅色/深色切换，并同步修复首页 Hero CTA 文本对比度与首屏下方留白布局问题
- 已补齐首页课程卡片、问卷卡片、考试快讯卡片、文章资讯卡片的 dark 模式适配，确保学员端首页主要内容区在夜间模式下视觉一致
- 已针对夜间模式下的两个细节问题做定向优化：考试快讯卡片的指标块不再因窄宽度出现竖排感，热度追踪面板的边框与层级更柔和
- 已将首页中段结构进一步拆分为“课程 + 侧栏”与“考试快讯独立整行”，避免考试区与右侧辅助卡片语义串联
- 已继续微调考试卡片标题对齐和状态标签尺寸，并为问卷“调查”标签补充更稳定的胶囊内边距
- 已修复头部 Logo 文案在 dark 模式下的颜色适配，品牌名与副标题在夜间主题下保持可读性
- 已将首页底部内容区重构为真正的三列结构：问卷调查、文章资讯、热度排行，并通过统一标题容器高度解决三列标题基线不齐问题
- 已优化首页区块头部的“查看更多”按钮尺寸与横向排版，避免在窄列场景下出现按钮文本被挤成竖排的问题
- 已为右下角“热度追踪”面板补齐 light 模式视觉，当前采用浅色玻璃面板与 dark 模式深色面板的双主题适配
- 课程管理/题库管理/考试管理的“预留型骨架页”先不在首期 web 实做，因为旧仓库不含管理端资产

### `apps/mobile-web`

- 首页骨架
- 学习页骨架
- 考试页骨架
- 我的页骨架

## 分阶段实施

1. 工程初始化：Git、workspace、Next.js、Tailwind、TypeScript、ESLint、Prettier
2. 共享层建设：`packages/api`、`packages/shared`、`packages/ui`
3. 主题与布局：导航、容器、空态、加载态、错误态
4. 学员端主链路骨架：登录、首页、课程、练习、考试、个人中心
5. 移动端基础壳层：底部导航 + 四个骨架页
6. 验证与文档：README、`.env.example`、Vercel 部署说明

## 风险与注意事项

- 旧项目当前不是 Git 仓库副本，迁移仓需要从零建立版本控制
- 旧项目存在一些浏览器强依赖能力，如 `localStorage`、WebSocket、人脸模型文件、考试监考流程，需要在 App Router 中严格划分 client/server 边界
- 管理端缺少旧资产，首期不应假装完成管理端业务迁移，只做扩展位说明
