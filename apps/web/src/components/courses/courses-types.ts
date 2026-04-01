export const COURSE_PAGE_SIZE = 9;

export interface CourseQueryState {
  page: number;
  keyword?: string;
  orderByType?: string | null;
  categoryId?: string | null;
}

export interface CourseCategoryOption {
  value: string;
  label: string;
}

export interface CourseListItem {
  id: string;
  title: string;
  teacherName: string;
  categoryName: string;
  priceLabel: string;
  statusLabel: string;
  progressLabel: string;
  lessonCountLabel: string;
  coverLabel: string;
}

export interface CourseListResult {
  items: CourseListItem[];
  total: number;
  categories: CourseCategoryOption[];
}

