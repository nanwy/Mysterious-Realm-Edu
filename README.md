# 云学考系统 Monorepo

云学考系统前端重构仓库。首期基于已有 Vue 学员端项目迁移到 Next.js Monorepo，当前规划包含：

- `apps/web`：学员 PC 端
- `apps/mobile-web`：移动端
- `packages/ui`：共享 UI 层
- `packages/shared`：共享类型、常量与工具
- `packages/api`：统一请求层

## 当前状态

- 已完成 Git 初始化与 `pnpm workspace` 搭建
- 已创建 `apps/web` 与 `apps/mobile-web` 两个 Next.js App Router 应用
- 已补齐共享包、主题变量、统一请求层骨架、Zustand 本地状态示例
- 已复用旧项目 Logo，并落下首页、登录、课程、练习、考试、成绩、个人中心与移动端四个骨架页

## 运行方式

```bash
pnpm install
pnpm dev:web
pnpm dev:mobile
pnpm build
pnpm lint
```

## 目录说明

```text
apps/
  web/          # 学员 PC 端
  mobile-web/   # 移动端
packages/
  api/          # 统一请求层
  shared/       # 常量、类型、工具
  ui/           # 共享布局与反馈组件
docs/
  superpowers/
    specs/      # 设计说明
    plans/      # 实施计划
```

## 迁移来源

旧 Vue 项目路径：

`/Users/nanfugongmeiying/Desktop/project/student-front-master`

当前新仓库重点保留以下业务主链路：

- 首页与登录
- 课程学习
- 题库练习
- 在线考试
- 成绩中心
- 个人中心

## 下一步建议

1. 初始化 shadcn/ui 并将基础卡片、表单、弹窗、表格逐步切入共享 UI 层。
2. 从旧项目迁移登录、课程列表、课程学习、练习列表、考试列表的真实接口与页面逻辑。
3. 将 WebSocket、监考、人脸模型、支付等重交互能力按 client boundary 分阶段迁入。
