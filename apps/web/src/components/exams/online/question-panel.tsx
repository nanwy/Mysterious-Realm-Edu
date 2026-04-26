import { Badge, Button, Input, Textarea } from "@workspace/ui";
import { cn } from "@workspace/ui/lib/utils";
import { Send, ShieldCheck } from "lucide-react";
import {
  type ExamOnlineAnswerDraft,
  type ExamOnlineQuestion,
  parseBlankAnswer,
  SELECT_QUESTION_TYPES,
} from "@/core/exams";

interface OnlineQuestionPanelNavigation {
  currentIndex: number;
  questionTotal: number;
  onPrevious: () => void;
  onNext: () => void;
}

interface OnlineQuestionPanelAnswerActions {
  onToggleOption: (optionId: string, optionIndex: number) => void;
  onUpdateSubjectiveAnswer: (value: string) => void;
  onUpdateBlankAnswer: (tag: string, value: string) => void;
}

interface OnlineQuestionPanelSubmitAction {
  pending: boolean;
  onSubmit: () => void;
}

interface OnlineQuestionPanelProps {
  question: ExamOnlineQuestion;
  answer: ExamOnlineAnswerDraft | null | undefined;
  navigation: OnlineQuestionPanelNavigation;
  answerActions: OnlineQuestionPanelAnswerActions;
  submitAction: OnlineQuestionPanelSubmitAction;
}

export const OnlineQuestionPanel = ({
  question,
  answer,
  navigation,
  answerActions,
  submitAction,
}: OnlineQuestionPanelProps) => (
  <main className="grid gap-5 rounded-[32px] border border-border bg-card/90 p-5 shadow-sm sm:p-6">
    <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{question.typeName}</Badge>
          <span className="text-sm text-muted-foreground">
            第 {question.index} 题 / {question.score} 分
          </span>
        </div>
        <h3 className="text-2xl font-semibold leading-snug text-foreground">
          {question.title}
        </h3>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-border bg-muted/35 px-3 py-2 text-sm text-muted-foreground">
        <ShieldCheck className="size-4" />
        自动缓存
      </div>
    </div>

    {SELECT_QUESTION_TYPES.has(question.type) ? (
      <div className="grid gap-3">
        {question.options.map((option, optionIndex) => {
          const selected = answer?.answers?.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              className={cn(
                "grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-3 rounded-[24px] border p-4 text-left transition",
                selected
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border bg-background/65 text-foreground hover:border-primary/40"
              )}
              onClick={() =>
                answerActions.onToggleOption(option.id, optionIndex)
              }
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border text-sm font-semibold",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                {option.tag}
              </span>
              <span className="pt-1 text-sm leading-7">{option.content}</span>
            </button>
          );
        })}
      </div>
    ) : question.type === 5 ? (
      <div className="grid gap-3">
        {(question.options.length
          ? question.options
          : [{ id: "blank", tag: "1", content: "填空" }]
        ).map((option) => {
          const blankMap = parseBlankAnswer(answer?.blankAnswer);
          return (
            <label
              key={option.id}
              className="grid gap-2 rounded-[22px] border border-border bg-background/65 p-4"
            >
              <span className="text-sm font-medium text-foreground">
                空 {option.tag}
              </span>
              <Input
                value={blankMap[option.tag] ?? ""}
                onChange={(event) =>
                  answerActions.onUpdateBlankAnswer(
                    option.tag,
                    event.target.value
                  )
                }
                placeholder="输入答案"
              />
            </label>
          );
        })}
      </div>
    ) : question.type === 6 ? (
      <div className="rounded-[24px] border border-border bg-muted/30 p-5">
        <p className="text-sm leading-7 text-muted-foreground">
          组合题的子题结构已读取到 {question.subQuestions.length} 小题。
          请先确认题干与其他题目，组合题的精细作答控件会在服务返回完整子题结构后开放。
        </p>
      </div>
    ) : (
      <Textarea
        minLength={0}
        value={answer?.subjectiveAnswer ?? ""}
        onChange={(event) =>
          answerActions.onUpdateSubjectiveAnswer(event.target.value)
        }
        placeholder="输入本题答案"
      />
    )}

    <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        variant="outline"
        disabled={navigation.currentIndex === 0}
        onClick={navigation.onPrevious}
      >
        上一题
      </Button>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          disabled={navigation.currentIndex >= navigation.questionTotal - 1}
          onClick={navigation.onNext}
        >
          下一题
        </Button>
        <Button
          type="button"
          disabled={submitAction.pending}
          onClick={submitAction.onSubmit}
        >
          <Send className="size-4" />
          提交试卷
        </Button>
      </div>
    </div>
  </main>
);
