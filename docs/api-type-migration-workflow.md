# API Type Migration Workflow

这份文档说明如何从 Java 后端静态提取 TypeScript 草稿，并把它整理成前端可用的 `@workspace/api` 契约类型。目标是让页面和组件不再自己猜接口字段，也不直接依赖草稿文件。

## 适用场景

- 迁移旧 Vue 页面时，需要确认某个 domain 的接口字段、枚举、注释。
- `apps/web/src/core/<domain>` 里出现了 `unknown`、`Record<string, unknown>`、宽泛 union、手写 payload 类型。
- React 组件里出现了业务接口类型，且这些类型没有来自 `@workspace/api`。
- 后端已经有 Java entity、DTO、VO、enum，但 OpenAPI 类型生成链路暂时不可用。

不适用场景：

- 纯 UI 组件 props。
- 页面 view model，例如卡片标题、按钮文案、状态色。
- React Query controller 或 Zustand store 的客户端状态类型。

这些类型不属于 Java 接口契约，不要塞进 `packages/api`。

## 目录约定

- Java 后端目录：`/Users/nanfugongmeiying/Desktop/project/exam-backend-master`
- 静态提取脚本：`packages/api/scripts/extract-java-types.mjs`
- 草稿输出目录：`packages/api/generated/`
- 正式接口类型：`packages/api/src/types/<domain>.ts`
- endpoint access：`packages/api/src/modules/<domain>.ts`
- Web domain 逻辑：`apps/web/src/core/<domain>/`
- 页面组件：`apps/web/src/components/<domain>/`

## 1. 生成 Java 类型草稿

在仓库根目录执行：

```bash
pnpm --filter @workspace/api extract:java-types -- --domain exam --out packages/api/generated/java-exam-types.draft.ts
```

课程 domain 示例：

```bash
pnpm --filter @workspace/api extract:java-types -- --domain course --out packages/api/generated/java-course-types.draft.ts
```

如果后端目录不在默认位置，显式传入：

```bash
pnpm --filter @workspace/api extract:java-types -- --domain exam --backend /absolute/path/to/exam-backend-master --out packages/api/generated/java-exam-types.draft.ts
```

脚本会扫描后端 `web/src/main/java/com/ynfy/buss/<domain>` 下的 `entity`、`dto`、`vo`、`enums`、`enmus` 文件，并额外补充部分 app API DTO。输出文件是草稿，不是正式接口。

## 2. 审核草稿

先按字段来源审核，不要直接复制整份草稿。

必须确认：

- 字段是否真实来自 Java 文件。
- 注释是否来自 Java 注释、`@Schema`、`@Dict`、`@JsonFormat`。
- endpoint 实际返回类型是否与 controller 方法一致。
- endpoint 路径和 HTTP method 必须对照旧前端 API 文件或 Java controller；迁移类型不能顺手改接口行为。
- `Object` 被脚本生成为 `unknown` 时，是否能从使用点或 Java service 继续收窄。
- `IPage<T>` 是否应落为 `PageResponse<T>`，不要为了兼容猜测成 `T[] | PageResponse<T>`。
- 枚举数字或字符串是否有 Java enum、dict、注释支撑。

常用核查命令：

```bash
rg -n "class ExamDTO|class CourseDTO|enum .*Type|@GetMapping|@PostMapping" /Users/nanfugongmeiying/Desktop/project/exam-backend-master/web/src/main/java
```

如果草稿里出现前端已有但 Java 找不到的字段，不能默认保留。要么找到 controller/service 的真实来源，要么从正式类型里删掉。

## 3. 写入 `@workspace/api` 契约类型

把审核后的 Java 契约写进：

```text
packages/api/src/types/<domain>.ts
```

原则：

- 保留 Java 注释，尤其是业务字段、`@Schema`、`@Dict`、时间格式。
- Java enum 和字典码要语义化成 `enum` 或 named constant，不要让组件散落 `1`、`2`、`"0"`。
- endpoint request/response 类型放在 `packages/api`，例如 `ExamSubmitRequest`、`CoursePageResponse<T>`。
- view model 不放在 `packages/api`，例如 `CourseListItem`、`CourseStudyResult` 这类 UI 投影应放在 Web domain。
- 不要为了“兼容可能返回”写宽泛 union。先确认 Java controller 和 service。
- `Record<string, unknown>` 只能作为 Java `Object` 的过渡表达；如果 Java 字段明确，就写明确 interface。
- 类型接口不要只为了改名而复制字段。后端契约类型保持 Java 字段名；页面展示名、按钮文案、状态色等 UI 投影留在 Web domain。

示例：

```ts
export enum INVIGILATE_USER_TYPE {
  EXAMINEE = 2,
}

export interface InvigilateWebrtcRequest {
  /** 考试 id */
  examId?: string;
  /** 用户类型：2 考生 */
  userType?: INVIGILATE_USER_TYPE;
  /** 用户考试 id */
  userExamId?: string;
}
```

## 4. 更新 endpoint access

endpoint access 写在：

```text
packages/api/src/modules/<domain>.ts
```

要求：

- 使用 `createXxxApi(client)` factory。
- request 和 response 类型从 `packages/api/src/types/<domain>.ts` 引入。
- endpoint path 和 method 必须保持旧前端已验证的调用方式，除非 Java controller 和任务要求明确证明需要变更。
- 不在 endpoint module 里 import React、Next、Zustand、Web domain。
- 不在 page/component 里直接拼 URL 或调用 `fetch`。
- 不要在 endpoint access 外面再包一层只转发参数和返回值的函数。
- 不要把明确的后端 response 包成额外的前端返回结构，除非调用方确实需要一个更深的模块接口。
- 如果 `api.<domain>.<method>()` 已经能直接返回 typed envelope，就不要再导出 `getXxx/listXxx/createXxxModule` 这类默认实例包装。保留 `createXxxApi(client)` 作为 endpoint access 的唯一接口。

示例：

```ts
export const createInvigilateApi = (client: ApiHttpClient) => ({
  userJoin: (payload: InvigilateWebrtcRequest) =>
    client.post<InvigilateMutationResponse>("/invigilate/userJoin", payload),
});
```

## 5. 在 Web domain 中应用类型

页面不要直接消化后端 payload。Web app 的 domain 层负责组合 React Query、mutation、少量 normalization 和 view model。

推荐位置：

```text
apps/web/src/core/<domain>/
  api.ts          # Web-only data composition and normalization
  queries.ts      # React Query options and query keys
  mutations.ts    # mutations and invalidation
  hooks.ts        # domain controller hook
  store.ts        # Zustand client state only
  view-model.ts   # UI projection helpers
```

使用方式：

- endpoint 类型从 `@workspace/api` 引入。
- 不再新建 `apps/web/src/core/<domain>/types.ts` 保存接口投影；接口 request/response/detail/list 类型统一来自 `@workspace/api` 的 Java 契约。
- 组件需要的业务接口类型优先来自 `@workspace/api` 或 `@/core/<domain>`，不要在组件文件顶部手写。
- 后端 payload 到 UI 卡片字段的转换放进 `view-model.ts`，不要放在组件顶部。
- 删除没有增加语义的 `toXxx`、`normalizeXxx`、`formatXxx`、`getXxxRecords` 函数。如果函数只是返回 `payload.records`、`payload.total`、字段兜底、或把字段换名，它不构成模块深度。
- 组件中禁止使用无意义的 `toText` 或同类 `toXxx` 字段读取函数。后端字段已是 Java 契约时直接读取，用 `??`、`.trim()`、显示用局部表达式即可。
- 命名要表达角色：`formatXxx` 只用于真实显示格式化，例如日期、时长、金额；`resolveXxx` 用于决策；`buildXxx` 用于派生对象；`toXxx` 只用于真实协议/类型转换，不用于普通字段读取。
- 保留有价值的转换：枚举语义化、Java `Object` 收窄、时间/布尔值兼容、UI view model、跨接口字段合并、错误消息归一化、资源 URL 解析。
- 当后端返回已经明确时，不要反复尝试 `records/list/rows/data` 等多种形状。先回到 Java controller/service 确认真实结构。
- 如果需要兼容后端 bug 或历史异常，必须在代码旁写明来源和退出条件，不能伪装成通用解析模式。

示例：

```ts
import type { CourseDetailResponse } from "@workspace/api";

export const buildCourseCardView = (course: CourseDetailResponse) => ({
  title: course.title ?? "未命名课程",
  cover: course.coverImage,
});
```

## 6. 组件引用规则

组件层只能引用两类类型：

- `@workspace/api`：Java/API 契约类型，例如 `CourseDetailResponse`、`ExamDetailResponse`。
- `@/core/<domain>`：Web domain controller、view model、store 暴露的类型。

组件层不要：

- 自己定义 API response/request 类型。
- 从 `apps/web/src/core/<domain>/types.ts` 引用接口投影类型。
- 从 `packages/api/generated/*.draft.ts` 引入。
- 为了适配接口写 `Record<string, unknown>`、`any`、大 union。
- 把列表解析、分页兼容、字段兜底函数写在组件上方。

组件如果 props 太多，优先传 domain controller 或 cohesive object，再在组件内解构：

```tsx
<OnlineQuestionPanel onlineExam={onlineExam} />
```

不要拆成一长串重复 props：

```tsx
<OnlineQuestionPanel
  questions={onlineExam.questions}
  answers={onlineExam.answers}
  currentQuestion={onlineExam.currentQuestion}
  answeredCount={onlineExam.answeredCount}
/>
```

## 7. 验证

类型变更后至少执行：

```bash
pnpm --filter @workspace/api exec tsc --noEmit
pnpm --filter web test
git diff --check
```

如果改到了 TSX、React Query、组件 props 或导出类型，补充：

```bash
pnpm --filter web exec tsc --noEmit
```

如果改动超过 500 行、跨 domain、或触碰 lint 敏感文件，补充：

```bash
pnpm --filter web lint
```

失败不能忽略。若失败来自既有无关问题，必须在交付说明里写明具体文件和行号。

## 8. 完整迁移清单

每次迁移接口类型按这个顺序走：

1. 运行 `extract:java-types` 生成或更新草稿。
2. 对照 Java controller/service/entity/DTO/VO/enum 审核草稿。
3. 把真实契约写进 `packages/api/src/types/<domain>.ts`。
4. 更新 `packages/api/src/modules/<domain>.ts` 的 request/response 类型。
5. 对照旧前端 API 文件或 Java controller 确认 path/method 没被迁移过程改掉。
6. 删除组件或 Web domain 里重复的 API 类型，删除对应 `core/<domain>/types.ts`。
7. 删除只转发、只改名、只复制字段的 `toXxx`、`normalizeXxx`、`formatXxx` 和额外返回包装。
8. 把真正有语义的 UI projection/helper 移到 `apps/web/src/core/<domain>`。
9. 组件从 `@workspace/api` 或 `@/core/<domain>` 引用类型。
10. 跑最小验证，并记录失败是否为既有无关问题。

核心规则：草稿只用来辅助定位 Java 契约；正式类型只落在 `@workspace/api`；组件不猜接口。
