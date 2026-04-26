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

export const replaceOnlineAnswer = (
  answers: ExamOnlineAnswerDraft[],
  index: number | string,
  nextAnswer: ExamOnlineAnswerDraft | null
) => {
  const withoutCurrent = answers.filter(
    (answer) => makeAnswerKey(answer.index) !== String(index)
  );

  return nextAnswer ? [...withoutCurrent, nextAnswer] : withoutCurrent;
};

export const buildOptionAnswerDraft = (
  question: ExamOnlineQuestion,
  currentAnswer: ExamOnlineAnswerDraft | undefined,
  optionId: string,
  optionIndex: number
): ExamOnlineAnswerDraft | null => {
  const currentIds = currentAnswer?.answers ?? [];
  const currentIndexes = currentAnswer?.answerIndex ?? [];
  const isSelected = currentIds.includes(optionId);
  const isSingle = question.type === 1 || question.type === 3;
  const nextIds = isSelected
    ? currentIds.filter((item) => item !== optionId)
    : isSingle
      ? [optionId]
      : [...currentIds, optionId];
  const nextIndexes = isSelected
    ? currentIndexes.filter((item) => item !== optionIndex)
    : isSingle
      ? [optionIndex]
      : [...currentIndexes, optionIndex];

  return nextIds.length
    ? {
        index: question.index,
        questionType: question.type,
        answers: nextIds,
        answerIndex: nextIndexes,
      }
    : null;
};

export const buildSubjectiveAnswerDraft = (
  question: ExamOnlineQuestion,
  value: string
): ExamOnlineAnswerDraft | null =>
  value.trim()
    ? {
        index: question.index,
        questionType: question.type,
        subjectiveAnswer: value,
      }
    : null;

export const buildBlankAnswerDraft = (
  question: ExamOnlineQuestion,
  currentAnswer: ExamOnlineAnswerDraft | undefined,
  tag: string,
  value: string
): ExamOnlineAnswerDraft | null => {
  const blankMap = parseBlankAnswer(currentAnswer?.blankAnswer);
  blankMap[tag] = value;
  const filled = Object.entries(blankMap)
    .filter(([, content]) => content.trim())
    .map(([itemTag, content]) => ({ tag: itemTag, content: content.trim() }));

  return filled.length
    ? {
        index: question.index,
        questionType: question.type,
        blankAnswer: JSON.stringify(filled),
      }
    : null;
};

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
