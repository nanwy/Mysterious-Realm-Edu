# Migration Progress

Last updated: 2026-04-09
Source project: `/Users/nanfugongmeiying/Desktop/project/student-front-master`
Source router: `/Users/nanfugongmeiying/Desktop/project/student-front-master/src/router/index.js`
Source graph: `/Users/nanfugongmeiying/Desktop/project/student-front-master/graphify-out/graph.json`
Target project: `/Users/nanfugongmeiying/Desktop/project/Mysterious-Realm-Edu`

## Status Legend

- `[x]` 已迁移：目标路由和主要页面壳层已经存在，且不是纯占位。
- `[-]` 部分迁移：目标路由存在，但仍是承接页、说明页或关键业务链路未接完。
- `[ ]` 未迁移：当前仓库中没有对应目标页面或只剩全局 404 承接。

## Executive Summary

- `[x]` 平台首页、资讯、问卷、课程列表、考试列表、成绩查询已进入可用状态。
- `[-]` 课程学习工作台、个人中心主链路、登录、全局壳层仍处于“可承接但未闭环”状态。
- `[ ]` 注册、在线考试、在线练习结果、商城支付链路、个人中心大部分业务子页仍未迁移。
- `graphify` 对“旧站功能域盘点、页面覆盖检查、横切模块识别”有帮助；对“直接回答迁移实现方案”帮助有限，仍需回到源码核实。

## Graphify-Derived Source Map

### 首页门户簇

旧站图谱命中的核心文件：

- `src/views/home/Index.vue`
- `src/components/Header.vue`
- `src/components/course/index/HotCourse.vue`
- `src/components/news/NewsHome.vue`
- `src/components/news/HotNews.vue`
- `src/components/exam/LastestExam.vue`
- `src/components/questionnaire/QuestionnaireHome.vue`
- `src/api/banner.ts`
- `src/api/course.ts`
- `src/api/news.ts`
- `src/api/exam.ts`
- `src/api/questionnaire.ts`

迁移判断：

- 这些旧站首页模块已经基本映射到当前首页和二级承接页：
  - 首页封面：[`apps/web/src/app/(marketing)/page.tsx`](/Users/nanfugongmeiying/Desktop/project/Mysterious-Realm-Edu/apps/web/src/app/(marketing)/page.tsx)
  - 首页组件：[`apps/web/src/components/home/home-page.tsx`](/Users/nanfugongmeiying/Desktop/project/Mysterious-Realm-Edu/apps/web/src/components/home/home-page.tsx)
  - 资讯承接：[`apps/web/src/app/(student)/news/page.tsx`](/Users/nanfugongmeiying/Desktop/project/Mysterious-Realm-Edu/apps/web/src/app/(student)/news/page.tsx)
  - 资讯详情：[`apps/web/src/app/(student)/news/detail/[id]/page.tsx`](/Users/nanfugongmeiying/Desktop/project/Mysterious-Realm-Edu/apps/web/src/app/(student)/news/detail/[id]/page.tsx)
  - 问卷承接：[`apps/web/src/app/(student)/questionnaire/page.tsx`](/Users/nanfugongmeiying/Desktop/project/Mysterious-Realm-Edu/apps/web/src/app/(student)/questionnaire/page.tsx)

### 个人中心簇

旧站图谱命中的核心文件：

- `src/views/user/Index.vue`
- `src/views/user/BaseSetting.vue`
- `src/views/user/AccountSetting.vue`
- `src/views/user/MyCourse.vue`
- `src/views/user/MyExam.vue`
- `src/views/user/CourseStudyRecord.vue`
- `src/views/user/CourseStudyProcess.vue`
- `src/views/user/PracticeRecord.vue`
- `src/views/user/ExamScore.vue`
- `src/views/user/UserExamResult.vue`
- `src/views/user/MyPurchaseGoods.vue`
- `src/views/mall/ordercenter/MyOrder.vue`
- `src/api/user.ts`
- `src/api/course.ts`
- `src/api/exam.ts`
- `src/api/order.ts`
- `src/api/certificate.ts`

迁移判断：

- 当前新站已经承接了个人中心壳层、资料、安全、消息、证书。
- 旧站个人中心里“我的考试 / 已购商品 / 练习记录 / 学习记录 / 学习进度 / 我的订单”仍未在新站落地。

### 路由 / 守卫 / 状态横切簇

旧站图谱明确命中的横切模块：

- `src/router/index.js`
- `src/router/guard/index.ts`
- `src/store/index.ts`
- `src/store/modules/leaveExam.ts`

迁移判断：

- 新站页面路由已经迁到 App Router。
- 旧站的权限守卫、考试离开态、全局 store 级导航控制，还没有形成与旧站等价的新实现。
- 这类横切能力不应被误记为“页面已迁移”。

## Current Route Coverage

### Global / Shell

| Old Route | Source | Target | Status | Impeccable | Notes |
| --- | --- | --- | --- | --- | --- |
| `/login` | `src/views/Login.vue` | `/login` | `[-]` | `[ ]` | 登录页存在，但视觉和业务链路仍是首版实现。 |
| `/register` | `src/views/register/Register.vue` | none | `[ ]` | `[ ]` | 当前仓库无注册页。 |
| `404 / fallback` | `src/views/404.vue` | `not-found.tsx` | `[-]` | `[ ]` | 仅有统一承接页，仍是“页面暂未接入”语义。 |
| 全局页头 / 导航 / 页脚 | `src/components/Header.vue` | `packages/ui` + `apps/web` 壳层 | `[-]` | `[-]` | 新壳层已形成，但与旧站导航能力和搜索联动并未等价。 |

### 首页 / 门户

| Old Route | Source | Target | Status | Impeccable | Notes |
| --- | --- | --- | --- | --- | --- |
| `/home` | `src/views/home/Index.vue` | `/` | `[x]` | `[x]` | 首页已重构为平台封面，承接课程、考试、资讯、问卷、热点信号。 |
| 首页课程区 | `src/components/course/index/HotCourse.vue` | `home-courses-section.tsx` | `[x]` | `[x]` | 已完成新版学习焦点工作台，不再按旧站模块原样平移。 |
| 首页考试区 | `src/components/exam/LastestExam.vue` | `home-exams-section.tsx` | `[x]` | `[x]` | 已承接为考试时间带。 |
| 首页资讯区 | `src/components/news/NewsHome.vue` | `home-news-section.tsx` | `[x]` | `[x]` | 已承接为主稿 + feed。 |
| 首页热榜 | `src/components/news/HotNews.vue` | `home-hot-news-section.tsx` | `[x]` | `[x]` | 已承接为 signal column。 |
| 首页问卷区 | `src/components/questionnaire/QuestionnaireHome.vue` | `home-questionnaires-section.tsx` | `[x]` | `[x]` | 已承接为 task queue。 |

### Course

| Old Route | Source | Target | Status | Impeccable | Notes |
| --- | --- | --- | --- | --- | --- |
| `/course/courseList` | `src/views/course/CourseList.vue` | `/courses` | `[x]` | `[-]` | 列表、筛选、分页已迁移。 |
| `/course/onlineStudy/:id` | `src/views/course/OnlineStudy.vue` | `/courses/[courseId]` | `[-]` | `[-]` | 工作台已成型，但播放器、目录树、学习计时、防挂机等旧站关键链路未迁完。 |
| `/course/comment/:courseId` | `src/views/course/coursedetail/Comment.vue` | none | `[ ]` | `[ ]` | 未迁移。 |
| `/course/myCollect/:searchType` | 旧站课程收藏 | none | `[ ]` | `[ ]` | 未迁移。 |
| `/course/footprint/:searchType` | 旧站课程足迹 | none | `[ ]` | `[ ]` | 未迁移。 |
| 课程详情其他子区 | `Catalog / Introduce / CourseExam / TeacherDetail` | 内嵌到工作台或独立页 | `[ ]` | `[ ]` | 当前未形成与旧站等价的详情子页面体系。 |

### Practice

| Old Route | Source | Target | Status | Impeccable | Notes |
| --- | --- | --- | --- | --- | --- |
| `/practice` | `src/views/practice/Index.vue` | `/practice` | `[x]` | `[-]` | 题库列表、搜索、分页已迁移。 |
| `/practice/practiceMode/:id` | `src/views/practice/PracticeMode.vue` | `/practice/practiceMode/[id]` | `[x]` | `[ ]` | 模式承接页已迁移。 |
| `/practice/onlinePractice/:id` | `src/views/practice/OnlinePractice.vue` | none | `[ ]` | `[ ]` | 未迁移。 |
| `/practice/userPracticeResult/:id` | `src/views/practice/UserPracticeResult.vue` | none | `[ ]` | `[ ]` | 未迁移。 |

### Exam

| Old Route | Source | Target | Status | Impeccable | Notes |
| --- | --- | --- | --- | --- | --- |
| `/exam` | `src/views/exam/Index.vue` | `/exams` | `[x]` | `[-]` | 考试列表、筛选、分页已迁移。 |
| `/exam/preview/:id` | `src/views/exam/ExamPreview.vue` | `/exams/[examId]/preview` | `[x]` | `[ ]` | 预览页已迁移。 |
| `/exam/onlineExam/:id` | `src/views/exam/OnlineExam.vue` | none | `[ ]` | `[ ]` | 在线考试主链路未迁移。 |
| `/userCenter/exam/examScore/userExamResult/:id` | `src/views/user/UserExamResult.vue` | `/scores/[examId]` | `[x]` | `[ ]` | 成绩明细已落地。 |

### News / Questionnaire / Scores

| Old Route | Source | Target | Status | Impeccable | Notes |
| --- | --- | --- | --- | --- | --- |
| `/news` | `src/views/news/Index.vue` | `/news` | `[x]` | `[-]` | 资讯主页已迁移。 |
| `/news/detail/:id` | `src/views/news/NewsDetail.vue` | `/news/detail/[id]` | `[x]` | `[-]` | 资讯详情已迁移。 |
| `/questionnaire` | `src/views/questionnaire/Index.vue` | `/questionnaire` | `[x]` | `[-]` | 问卷列表页已迁移。 |
| `/userCenter/exam/examScore` | `src/views/user/ExamScore.vue` | `/scores` | `[x]` | `[x]` | 成绩列表已重构为筛选优先的成绩复盘工作台。 |

### User Center

| Old Route | Source | Target | Status | Impeccable | Notes |
| --- | --- | --- | --- | --- | --- |
| `/userCenter` | `src/views/user/Index.vue` | `/me` | `[x]` | `[x]` | 个人中心首页已重构为学习状态 + 账户管理混合空间。 |
| `/userCenter/baseSetting` | `src/views/user/BaseSetting.vue` | `/me/profile` | `[-]` | `[x]` | 已有资料页，但编辑与提交仍是占位承接。 |
| `/userCenter/accountSetting` | `src/views/user/AccountSetting.vue` | `/me/security` | `[-]` | `[x]` | 已有安全页，但真实提交和设备/安全链路未迁移。 |
| `/userCenter/message` | `src/views/message/Message.vue` | `/me/messages` | `[x]` | `[-]` | 消息中心已迁移为双频道工作台。 |
| `/userCenter/certificate` | `src/views/certificate/Certificate.vue` | `/me/certificates` | `[x]` | `[ ]` | 分类、列表、预览/下载承接已完成。 |
| `/userCenter/myCourse` | `src/views/user/MyCourse.vue` | `/courses` | `[x]` | `[-]` | 旧站“我的课程”已并入新站课程中心。 |
| `/userCenter/myExam` | `src/views/user/MyExam.vue` | none | `[ ]` | `[ ]` | 未迁移。 |
| `/userCenter/myPurchaseGoods` | `src/views/user/MyPurchaseGoods.vue` | `/me/purchases` | `[x]` | `[-]` | 已迁移到已购内容工作台，承接课程/考试切换、分页、时间信息与可达入口说明。 |
| `/userCenter/practice/record` | `src/views/user/PracticeRecord.vue` | none | `[ ]` | `[ ]` | 未迁移。 |
| `/userCenter/course/studyRecord` | `src/views/user/CourseStudyRecord.vue` | none | `[ ]` | `[ ]` | 未迁移。 |
| `/userCenter/course/studyProcess` | `src/views/user/CourseStudyProcess.vue` | none | `[ ]` | `[ ]` | 未迁移。 |
| `/userCenter/myOrder` | `src/views/mall/ordercenter/MyOrder.vue` | none | `[ ]` | `[ ]` | 未迁移。 |

### Mall / Payment

| Old Route | Source | Target | Status | Impeccable | Notes |
| --- | --- | --- | --- | --- | --- |
| `/mall/cart` | `src/views/mall/Cart.vue` | none | `[ ]` | `[ ]` | 未迁移。 |
| `/mall/pay` | `src/views/mall/Pay.vue` | none | `[ ]` | `[ ]` | 未迁移。 |
| `/mall/thirdPay/:orderSn` | `src/views/mall/ThirdPay.vue` | none | `[ ]` | `[ ]` | 未迁移。 |
| `/mall/qrPay/:orderSn` | `src/views/mall/QrPay.vue` | none | `[ ]` | `[ ]` | 未迁移。 |
| `/mall/payDone` | `src/views/mall/PayDone.vue` | none | `[ ]` | `[ ]` | 未迁移。 |
| `/mall/ordercenter/orderDetail/:orderSn` | `src/views/mall/ordercenter/OrderDetail.vue` | none | `[ ]` | `[ ]` | 未迁移。 |
| `/mall/ordercenter/refund/:orderSn` | `src/views/mall/ordercenter/Refund.vue` | none | `[ ]` | `[ ]` | 未迁移。 |
| `/mall/evaluation/addEval/:orderSn/:orderGoodsId` | `src/views/mall/evaluation/AddEval.vue` | none | `[ ]` | `[ ]` | 未迁移。 |

## Shared Capabilities

| Capability | Status | Notes |
| --- | --- | --- |
| 首页平台封面体系 | `[x]` | 首页已脱离旧站模块堆叠，进入新版平台封面语义。 |
| 登录壳层 / 认证入口 | `[-]` | 登录页存在，但注册缺失，完整认证链路未形成。 |
| 公共分页 / 列表结果模式 | `[-]` | 课程、考试、练习、资讯、问卷、成绩已各自成型，但还没完全收敛成统一抽象。 |
| 表单体系向 `packages/ui` 收敛 | `[-]` | 已有 StudentShell 和部分 UI 包沉淀，但业务表单仍多处自行实现。 |
| 主题 token / light-dark 语义体系 | `[-]` | 首页和核心页已明显推进，仍未覆盖所有历史页面。 |
| API 承接 | `[-]` | 首页、课程、考试、资讯、问卷、成绩、消息、证书已接入或具备错误兜底；商城、在线考试、在线练习未接。 |
| 路由守卫 / leave-exam 行为等价迁移 | `[ ]` | 旧站 guard/store 横切能力尚未在新站补齐。 |

## Current Focus

- `[-]` 个人中心剩余业务子页：`myExam / practiceRecord / studyRecord / studyProcess / myOrder`
- `[-]` 课程学习主链路：播放器、目录树、学习计时、防挂机
- `[ ]` 在线考试与在线练习执行链路
- `[ ]` 商城 / 支付 / 订单后链路
- `[ ]` 旧站 guard/store 横切能力迁移

## Recommended Next Migration Order

1. 在线考试主链路
   - 旧站集中在 `src/views/exam/OnlineExam.vue`
   - 原因：它依赖路由守卫、离开考试状态、计时、提交流程，是当前最大横切缺口
2. 课程学习真实链路
   - 旧站集中在 `src/views/course/OnlineStudy.vue`
   - 原因：当前工作台已完成结构迁移，继续补播放器与计时收益最高
3. 个人中心剩余记录与订单域
   - `MyExam / PracticeRecord / CourseStudyRecord / CourseStudyProcess / MyOrder / MyPurchaseGoods`
   - 原因：这些页面图谱边界清晰，适合批量迁移
4. 商城 / 支付
   - `Cart / Pay / ThirdPay / QrPay / PayDone / OrderDetail / Refund / AddEval`
   - 原因：业务完整但相对独立，适合单独拆成一组迁移任务

## Notes

- 本文件以当前仓库中实际存在的 `apps/web/src/app` 路由和组件为准，不再沿用过时的“旧站路由已迁移但新站路径未更新”写法。
- `graphify` 在本项目里的主要价值是“结构盘点”和“漏项检查”。涉及真实迁移实现时，仍需直接核对旧站源码与当前页面逻辑。
