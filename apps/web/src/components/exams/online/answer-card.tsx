import { cn } from "@workspace/ui/lib/utils";
import {
  isQuestionAnswered,
  type ExamOnlineAnswerDraft,
  type ExamOnlineAnswerGroup,
  type ExamOnlineQuestion,
} from "@/core/exams";

export const OnlineAnswerCard = ({
  groups,
  questions,
  answers,
  currentQuestion,
  answeredCount,
  progress,
  onSelectQuestion,
}: {
  groups: ExamOnlineAnswerGroup[];
  questions: ExamOnlineQuestion[];
  answers: ExamOnlineAnswerDraft[];
  currentQuestion: ExamOnlineQuestion;
  answeredCount: number;
  progress: number;
  onSelectQuestion: (index: number) => void;
}) => (
  <aside className="grid gap-4 rounded-[30px] border border-border bg-card/85 p-4 shadow-sm xl:sticky xl:top-24">
    <div className="space-y-1">
      <p className="text-sm font-semibold text-foreground">答题卡</p>
      <p className="text-sm text-muted-foreground">
        {answeredCount}/{questions.length} 已答，当前进度 {progress}%
      </p>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
    <div className="grid gap-4">
      {groups.map((group) => (
        <div
          key={`${group.typeName}-${group.questionType}`}
          className="grid gap-3"
        >
          <div className="border-b border-border pb-2">
            <p className="text-sm font-semibold text-foreground">
              {group.typeName}
            </p>
            <p className="text-xs text-muted-foreground">
              {group.questionCount} 题 / {group.questionScore} 分
            </p>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {group.indexes.map((index) => {
              const targetQuestion = questions.find(
                (question) => question.index === index
              );
              const active = currentQuestion.index === index;
              const answered = targetQuestion
                ? isQuestionAnswered(targetQuestion, answers)
                : false;

              return (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : answered
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => onSelectQuestion(index)}
                >
                  {index}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </aside>
);
