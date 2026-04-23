# AGENT.md

## 项目定位（仅前端）

本仓库是云学考系统前端 Monorepo，目标是把旧 Vue 学员端迁移到 Next.js 体系，并持续对齐 `.impeccable.md` 的视觉与交互规范。

## 目录边界

- `apps/web`：学员 PC 端（Next.js App Router）
- `apps/mobile-web`：移动端（Next.js App Router）
- `packages/ui`：共享 UI 组件（无业务逻辑）
- `packages/motion`：共享动效能力
- `packages/shared`：共享类型、常量、工具函数
- `packages/api`：统一请求层

## 架构决策（前端）

- 共享包源码直接被应用编译，优先保持“改完即热更新”的开发体验。
- 依赖方向保持单向：页面/业务消费共享能力，不反向耦合应用层。
- 路由与平台能力放在应用层，通用页面与通用逻辑放在 `packages/*`。

## 每轮开始前必读

- `/Users/nanfugongmeiying/Desktop/project/Mysterious-Realm-Edu/.impeccable.md`
- `/Users/nanfugongmeiying/Desktop/project/Mysterious-Realm-Edu/docs/migration-progress.md`

## 核心工作方式

1. 先读现有实现与路由结构，再改代码。
2. 一次只推进一个明确页面或一个清晰能力点。
3. 优先复用共享包能力，不在页面里重复造通用工具。
4. 改动完成后给出可验证结果（至少最小测试或手动验证路径）。

## State Management（保留原规则）

- **React Query** 管理所有服务端状态（接口数据、列表、详情、分页数据）。
- **Zustand** 只管理客户端交互状态（筛选条件、面板开关、草稿、临时 UI 状态）。
- 不把接口返回数据复制到 Zustand，避免双数据源。
- 页面数据刷新优先走 Query invalidation，不在本地 store 手工“同步一份服务端真相”。

## Package Boundary（硬约束）

- `packages/ui`：纯展示与交互组件，不依赖业务请求层。
- `packages/api`：请求封装与数据访问，不掺入页面展示逻辑。
- `packages/shared`：通用类型/常量/helper，不引入页面框架耦合。
- `apps/web` / `apps/mobile-web`：仅放路由承接、页面组装与平台特有接线。
- 避免跨层反向依赖与循环依赖。

## 复用与去重规则

- 同一逻辑若同时出现在 `web` 与 `mobile-web`，优先抽到 `packages/shared`、`packages/ui` 或 `packages/api`。
- 禁止在多个页面重复定义 `toXxx`、`normalizeXxx`、`parseXxx` 这类通用函数。
- 新增通用能力前先全局搜索，存在即复用，不存在再补到共享层。
- 抽取共享时优先“抽逻辑不抽样式”，避免造成大范围回归。

## 前端实现规则

- 保持 App Router 约定，不破坏现有路由结构。
- 视觉必须使用语义 token，避免新增硬编码颜色类。
- 保持 light/dark 两套可读性，不允许只顾单主题。
- 优先复用 `packages/ui`、`packages/motion`、`packages/api`、`packages/shared`。
- 通用解析/转换函数应放共享层（`packages/shared/src`），不要在多个页面重复定义 `toXxx`。
- 页面文件只保留业务语义转换，不保留通用 helper。
- 不做无关重构，不改任务范围外文件。

## 跨端开发规则

- 新页面优先沉淀为可复用页面壳或区块组件，再在 `apps/web` 与 `apps/mobile-web` 分别接路由。
- 平台特有差异通过 props/slot 注入，不复制整份页面逻辑。
- 若某功能仅单端可用，要在提交说明里明确“单端特性”边界，避免误复用。

## CSS 与 Design Token 规则

- 优先使用语义 token（如 `bg-background`、`text-foreground`、`border-border`）。
- 禁止新增一次性硬编码色值类（如 `text-red-500`、`bg-gray-100`）作为常态方案。
- 共享样式放到共享层，避免在多个应用重复维护同类基础样式。
- 动效保持克制，避免把动画绑定在不稳定的大容器上。

## 迁移约束

- 迁移目标是“业务结构迁移 + 视觉升级”，不是 1:1 复制旧 Vue 页面外观。
- 新页面必须有完整状态：loading / empty / error。
- 保持页面信息层级清晰，避免“白卡片拼盘”和“后台系统感”。
- 若接口不可用，必须保留可读兜底并在结果里写明阻塞点。

## UI/UX 质量规则

- 默认复用现有组件体系，避免重复造轮子。
- 关注长文本溢出、容器滚动、对齐与间距一致性。
- 页面必须可读、可操作、可恢复（失败态有明确下一步）。
- 不允许“功能可用但视觉仍是骨架态”的交付。

## 进度文件规则

- 只更新：`/Users/nanfugongmeiying/Desktop/project/Mysterious-Realm-Edu/docs/migration-progress.md`
- 不创建新的进度文件。
- 不改模板整体结构，只改勾选状态与必要说明。
- 勾选状态仅允许：`[x]` / `[ ]` / `[-]` / `[!]`

## 常用命令

```bash
pnpm install
pnpm dev:web
pnpm dev:mobile
pnpm build
pnpm lint
pnpm test:web
```

单测示例（按需）：

```bash
node --test --experimental-strip-types apps/web/src/components/**/**.test.mts
```

## 测试规则（前端）

- 测试跟随代码归属：共享逻辑测共享层，页面接线测应用层。
- 共享层测试避免引入平台路由 mock；平台特有行为再放应用层测。
- 改动完成至少给出一种验证：
  - 最小单测（推荐）
  - 或可复现的手动验证路径（路由 + 场景 + 预期结果）
- 若跳过测试，必须写明未测项与风险。

## 提交流程规则

- 变更描述必须包含：目标、范围、关键改动、验证结果。
- Review handoff 必须包含：PR、head/base、compare ref、expected file scope。
- 无真实 PR 或无远端分支时，不进入 In Review。

## 交付要求

- 必须有真实文件改动。
- 必须列出修改文件和改动目的。
- 必须说明验证方式与结果。
- 无法完成时明确失败原因，不要标记“已完成”。
