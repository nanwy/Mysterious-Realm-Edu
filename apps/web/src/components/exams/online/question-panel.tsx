import { Badge, Button, Input, Textarea } from "@workspace/ui";
import { cn } from "@workspace/ui/lib/utils";
import { Send, ShieldCheck } from "lucide-react";
import {
  parseBlankAnswer,
  SELECT_QUESTION_TYPES,
  type ExamOnlineAnswerDraft,
  type ExamOnlineQuestion,
} from "@/core/exams";

export const OnlineQuestionPanel = ({
  currentQuestion,
  answerForCurrent,
  currentIndex,
  questionTotal,
  submitPending,
  onToggleOption,
  onUpdateSubjectiveAnswer,
  onUpdateBlankAnswer,
  onPrevious,
  onNext,
  onSubmit,
}: {
  currentQuestion: ExamOnlineQuestion;
  answerForCurrent: ExamOnlineAnswerDraft | null | undefined;
  currentIndex: number;
  questionTotal: number;
  submitPending: boolean;
  onToggleOption: (optionId: string, optionIndex: number) => void;
  onUpdateSubjectiveAnswer: (value: string) => void;
  onUpdateBlankAnswer: (tag: string, value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) => (
  <main className="grid gap-5 rounded-[32px] border border-border bg-card/90 p-5 shadow-sm sm:p-6">
    <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{currentQuestion.typeName}</Badge>
          <span className="text-sm text-muted-foreground">
            第 {currentQuestion.index} 题 / {currentQuestion.score} 分
          </span>
        </div>
        <h3 className="text-2xl font-semibold leading-snug text-foreground">
          {currentQuestion.title}
        </h3>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-border bg-muted/35 px-3 py-2 text-sm text-muted-foreground">
        <ShieldCheck className="size-4" />
        自动缓存
      </div>
    </div>

    {SELECT_QUESTION_TYPES.has(currentQuestion.type) ? (
      <div className="grid gap-3">
        {currentQuestion.options.map((option, optionIndex) => {
          const selected = answerForCurrent?.answers?.includes(option.id);
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
              onClick={() => onToggleOption(option.id, optionIndex)}
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
    ) : currentQuestion.type === 5 ? (
      <div className="grid gap-3">
        {(currentQuestion.options.length
          ? currentQuestion.options
          : [{ id: "blank", tag: "1", content: "填空" }]
        ).map((option) => {
          const blankMap = parseBlankAnswer(answerForCurrent?.blankAnswer);
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
                  onUpdateBlankAnswer(option.tag, event.target.value)
                }
                placeholder="输入答案"
              />
            </label>
          );
        })}
      </div>
    ) : currentQuestion.type === 6 ? (
      <div className="rounded-[24px] border border-border bg-muted/30 p-5">
        <p className="text-sm leading-7 text-muted-foreground">
          组合题的子题结构已读取到 {currentQuestion.subQuestions.length} 小题。
          请先确认题干与其他题目，组合题的精细作答控件会在服务返回完整子题结构后开放。
        </p>
      </div>
    ) : (
      <Textarea
        minLength={0}
        value={answerForCurrent?.subjectiveAnswer ?? ""}
        onChange={(event) => onUpdateSubjectiveAnswer(event.target.value)}
        placeholder="输入本题答案"
      />
    )}

    <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        variant="outline"
        disabled={currentIndex === 0}
        onClick={onPrevious}
      >
        上一题
      </Button>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          disabled={currentIndex >= questionTotal - 1}
          onClick={onNext}
        >
          下一题
        </Button>
        <Button type="button" disabled={submitPending} onClick={onSubmit}>
          <Send className="size-4" />
          提交试卷
        </Button>
      </div>
    </div>
  </main>
);
