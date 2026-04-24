export const PRACTICE_PAGE_SIZE = 9;

export const PRACTICE_FREE_ACTIONS = [
  {
    id: "sequence",
    title: "顺序练习",
    description: "按题目原始顺序逐题练习，适合首次通读题库。",
    query: "mode=1",
  },
  {
    id: "random",
    title: "随机练习",
    description: "打散题目顺序，适合查漏补缺和快速复盘。",
    query: "mode=2",
  },
] as const;

export const PRACTICE_QUESTION_TYPES = [
  {
    id: "single-choice",
    type: 1,
    title: "单选题",
    description: "按单选题集中练习，保持基础题型节奏。",
  },
  {
    id: "multiple-choice",
    type: 2,
    title: "多选题",
    description: "集中处理多选题，强化选项辨析能力。",
  },
  {
    id: "judgement",
    type: 3,
    title: "判断题",
    description: "快速回顾知识点，适合做日常短练。",
  },
  {
    id: "fill-blank",
    type: 5,
    title: "填空题",
    description: "聚焦关键词填写，检验记忆与理解程度。",
  },
] as const;

