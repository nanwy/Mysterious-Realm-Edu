# Migration Progress

Last updated: 2026-04-07
Source router: /Users/nanfugongmeiying/Desktop/project/student-front-master/src/router/index.js
Target project: /Users/nanfugongmeiying/Desktop/project/Mysterious-Realm-Edu

## Summary
- [-] 登录/注册/404 迁移中
- [-] 首页与学习主链路迁移中
- [-] 个人中心迁移中
- [ ] 商城/支付链路待迁移

## Global Routes
- [-] /login 登录
- [ ] /register 用户注册
- [ ] /404 / NotFound

## Root Layout
- [x] /home 首页
- [-] 全局壳层导航/页头/页脚与旧站风格对齐

## Course
- [-] /course 课程学习
- [-] /course/courseList 课程列表（已重构首屏层次、筛选区节奏与结果卡信息表达，待继续补齐详情页与联动链路）
- [-] /course/onlineStudy/:id 在线学习（已重构为学习工作台，补齐课程详情/进度/最近任务/异常态；待继续接入播放器、目录树与学习计时链路）
- [ ] /course/comment/:courseId 课程评价
- [ ] /course/myCollect/:searchType 我的收藏
- [ ] /course/footprint/:searchType 我的足迹

## Practice
- [x] /practice 题库练习
- [x] /practice/practiceMode/:id 练习模式
- [ ] /practice/onlinePractice/:id 在线练习
- [ ] /practice/userPracticeResult/:id 练习结果

## Exam
- [x] /exam 考试列表
- [x] /exam/preview/:id 考试预览
- [ ] /exam/onlineExam/:id 在线考试
- [ ] /exam/userExamResult/examDetail/:id 考试结果明细

## Questionnaire
- [x] /questionnaire 问卷调查（已重构为任务导向问卷面板，补齐首屏状态摘要、横向筛选节奏与结果卡层级）

## News
- [x] /news 新闻资讯
- [x] /news/detail/:id 资讯详情

## AI
- [ ] /ai 智能助手

## User Center
- [x] /userCenter 个人中心壳层
- [x] /userCenter/baseSetting 个人信息
- [x] /userCenter/accountSetting 账号安全
- [x] /userCenter/myCourse 我的课程
- [ ] /userCenter/myExam 我的考试
- [ ] /userCenter/myPurchaseGoods 已购商品
- [ ] /userCenter/practice/record 练习记录
- [x] /userCenter/exam/examScore 考试成绩
- [x] /userCenter/exam/examScore/userExamResult/:id 用户考试列表
- [ ] /userCenter/course/studyRecord 课程学习记录
- [ ] /userCenter/course/studyProcess 课程学习进度
- [ ] /userCenter/myOrder 我的订单
- [ ] /userCenter/myOrder/orderDetail/:orderSn 订单详情
- [ ] /userCenter/myOrder/refund/:orderSn 订单退款
- [ ] /userCenter/myOrder/addEval/:orderSn/:orderGoodsId 订单商品评价
- [x] /userCenter/certificate 我的证书
- [x] /userCenter/message 消息中心（已重构为双频道收件箱工作台，强化首屏状态层级、阅读卡片与移动端扫读节奏）

## Mall / Payment
- [ ] /mall/cart 购物车
- [ ] /mall/pay 结算
- [ ] /mall/thirdPay/:orderSn 支付方式
- [ ] /mall/qrPay/:orderSn 扫码付款
- [ ] /mall/payDone 支付成功

## Shared Capabilities
- [-] 公共分页组件收敛
- [-] 表单组件向 shadcn / packages/ui 收敛
- [-] 主题语义 token 替换
- [-] API 模块已接入，但 base URL / 环境联通仍待稳定
- [!] Review handoff / Verifier 流程仍需依赖固定 comment 格式
- [!] Motion + Next.js 返回历史页时 whileInView 恢复存在问题

## Current Focus
- [x] /exam 考试列表页
- [-] 个人中心子页补齐
- [-] 共享组件继续收敛

## Blockers
- [!] 浏览器后退后部分 motion 区块停留在 opacity 0
- [!] Verifier 必须基于开发 agent comment 中的 head/base/compare ref 验收
- [ ] 其余阻塞项待补充
