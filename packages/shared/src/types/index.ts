export interface AppMetric {
  label: string;
  value: string;
  hint: string;
}

export interface ApiEnvelope<T> {
  code: number;
  message: string;
  result?: T;
  data?: T;
}

export interface NavItem {
  href: string;
  label: string;
}

