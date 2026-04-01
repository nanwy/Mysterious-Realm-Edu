import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  FileBadge2,
  FileClock,
  GraduationCap,
  LayoutGrid,
  ReceiptText,
  ScrollText,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Trophy,
  UserRound,
} from "lucide-react";

export type MeNavigationGroup = {
  id: string;
  title: string;
  description: string;
  items: {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
  }[];
};

export const meNavigationGroups: MeNavigationGroup[] = [
  {
    id: "settings",
    title: "账户设置",
    description: "承接旧个人中心中的基本设置分组，先集中放置资料与账号安全入口。",
    items: [
      {
        title: "个人信息",
        description: "查看头像、昵称、联系方式等基础资料。",
        href: "/me/profile",
        icon: UserRound,
      },
      {
        title: "账号安全",
        description: "管理密码、绑定信息与登录安全设置。",
        href: "/me/security",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "learning",
    title: "学习与考试",
    description: "聚合课程、考试、学习过程与结果查询，延续旧侧栏的核心学习路径。",
    items: [
      {
        title: "我的课程",
        description: "进入课程列表，继续后续课内学习与回顾。",
        href: "/me/courses",
        icon: BookOpen,
      },
      {
        title: "我的考试",
        description: "查看个人可参与与历史参加的考试安排。",
        href: "/me/exams",
        icon: GraduationCap,
      },
      {
        title: "学习进度",
        description: "承接旧版课程学习进度入口，后续用于展示阶段完成度。",
        href: "/me/study-progress",
        icon: LayoutGrid,
      },
      {
        title: "学习记录",
        description: "查看已学内容、最近访问与历史学习轨迹。",
        href: "/me/study-records",
        icon: FileClock,
      },
      {
        title: "练习记录",
        description: "承接题库练习结果与错题复盘入口。",
        href: "/me/practice-records",
        icon: ScrollText,
      },
      {
        title: "考试成绩",
        description: "集中查看考试结果、通过状态与历史成绩。",
        href: "/me/scores",
        icon: Trophy,
      },
    ],
  },
  {
    id: "orders",
    title: "订单与服务",
    description: "延续旧版订单、已购商品等交易信息入口，便于后续拆分服务页。",
    items: [
      {
        title: "我的订单",
        description: "管理购买记录、订单状态与售后流程。",
        href: "/me/orders",
        icon: ReceiptText,
      },
      {
        title: "已购商品",
        description: "查看已购买课程或服务的访问入口。",
        href: "/me/purchases",
        icon: ShoppingBag,
      },
    ],
  },
  {
    id: "services",
    title: "证书与消息",
    description: "保留证书与消息中心入口，作为学习结果与通知的统一收口。",
    items: [
      {
        title: "我的证书",
        description: "后续承接证书列表、下载与核验记录。",
        href: "/me/certificates",
        icon: FileBadge2,
      },
      {
        title: "消息中心",
        description: "汇总系统通知、课程提醒与考试消息。",
        href: "/me/messages",
        icon: Bell,
      },
    ],
  },
];

export const meOverviewStats = [
  { label: "导航分组", value: "4 组" },
  { label: "核心入口", value: "12 项" },
  { label: "承接方式", value: "子路由壳层" },
];

export const meOverviewHighlights = [
  "保留旧个人中心的信息层级，但改为适合移动端与桌面的入口卡片布局。",
  "所有导航继续使用 Student Shell 的语义 token，light / dark 下都保持清晰层级。",
  "后续子页面可直接承接 /me 下的新地址，不需要再次调整首页入口结构。",
];

export const meOverviewBadge = {
  label: "Student Center",
  title: "个人中心入口导航",
  description:
    "把旧 Vue 个人中心的侧栏信息架构迁移为 Next.js 学员端入口页，先完成清晰的导航壳层，再逐步展开子路由内容。",
  icon: Settings2,
};
