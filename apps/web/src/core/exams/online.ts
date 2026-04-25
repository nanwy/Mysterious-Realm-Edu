import type { ExamOnlineAnswerDraft, ExamOnlineQuestion } from "./types";

export const SELECT_QUESTION_TYPES = new Set([1, 2, 3]);

export const formatExamSeconds = (value: number | null) => {
  if (value === null) {
    return "以考试详情为准";
  }

  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;

  return [hours, minutes, seconds]
    .map((item) => String(item).padStart(2, "0"))
    .join(":");
};

export const parseBlankAnswer = (value: string | undefined) => {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return {};
    }

    return parsed.reduce<Record<string, string>>((acc, item) => {
      if (item && typeof item === "object" && "tag" in item) {
        acc[String(item.tag)] =
          "content" in item && typeof item.content === "string"
            ? item.content
            : "";
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
};

export const makeAnswerKey = (index: number | string) => String(index);

export const isQuestionAnswered = (
  question: ExamOnlineQuestion,
  answers: ExamOnlineAnswerDraft[]
) => {
  if (question.type === 6) {
    return answers.some((answer) =>
      makeAnswerKey(answer.index).startsWith(`${question.index}.`)
    );
  }

  return answers.some(
    (answer) => makeAnswerKey(answer.index) === String(question.index)
  );
};

export const getAnswerForQuestion = (
  question: ExamOnlineQuestion,
  answers: ExamOnlineAnswerDraft[]
) =>
  answers.find(
    (answer) => makeAnswerKey(answer.index) === String(question.index)
  );
