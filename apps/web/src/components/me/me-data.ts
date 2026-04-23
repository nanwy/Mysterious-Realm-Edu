import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  ClipboardList,
  FileCheck2,
  LayoutGrid,
  Medal,
  Package,
  ReceiptText,
  ScrollText,
  Settings2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export interface MeEntryItem {
  title: string;
  description: string;
  href: string;
  routeLabel: string;
}

export interface MeEntryGroup {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  items: MeEntryItem[];
}

export const ME_ENTRY_GROUPS: MeEntryGroup[] = [
  {
    id: "basic-settings",
    title: "账户与安全",
    description: "管理资料、密码、设备和账号安全状态。",
    icon: Settings2,
    items: [
      {
        title: "个人信息",
        description: "更新头像、姓名、联系方式和基础学员资料。",
        href: "/me/profile",
        routeLabel: "/me/profile",
      },
      {
        title: "账号安全",
        description: "查看密码、设备和异常登录提醒。",
        href: "/me/security",
        routeLabel: "/me/security",
      },
    ],
  },
  {
    id: "my-courses",
    title: "课程学习",
    description: "继续学习、查看课程状态和进入主线课程。",
    icon: BookOpen,
    items: [
      {
        title: "我的课程",
        description: "查看课程列表、当前学习状态和继续入口。",
        href: "/courses",
        routeLabel: "/courses",
      },
    ],
  },
  {
    id: "my-exams",
    title: "考试安排",
    description: "查看待参加考试、考试状态和入口。",
    icon: ClipboardList,
    items: [
      {
        title: "我的考试",
        description: "查看考试安排、当前状态和进入考试。",
        href: "/me/exams",
        routeLabel: "/me/exams",
      },
    ],
  },
  {
    id: "my-orders",
    title: "订单中心",
    description: "跟踪订单状态、支付信息和售后进度。",
    icon: ReceiptText,
    items: [
      {
        title: "我的订单",
        description: "查看订单记录、付款状态和售后进度。",
        href: "/me/orders",
        routeLabel: "/me/orders",
      },
    ],
  },
  {
    id: "purchased-goods",
    title: "已购内容",
    description: "查看已购课程、资料包和交付内容。",
    icon: Package,
    items: [
      {
        title: "已购商品",
        description: "查看已购买课程、资料包和交付信息。",
        href: "/me/purchases",
        routeLabel: "/me/purchases",
      },
    ],
  },
  {
    id: "course-study",
    title: "学习轨迹",
    description: "查看学习进度和最近学习记录。",
    icon: LayoutGrid,
    items: [
      {
        title: "学习进度",
        description: "按课程查看完成度和待完成章节。",
        href: "/me/study-progress",
        routeLabel: "/me/study-progress",
      },
      {
        title: "学习记录",
        description: "回看最近学习行为、学习时间和课程轨迹。",
        href: "/me/study-records",
        routeLabel: "/me/study-records",
      },
    ],
  },
  {
    id: "practice-records",
    title: "练习记录",
    description: "查看题库训练、错题与最近练习轨迹。",
    icon: ScrollText,
    items: [
      {
        title: "练习记录",
        description: "查看练习次数、最近训练和错题回顾。",
        href: "/practice",
        routeLabel: "/practice",
      },
    ],
  },
  {
    id: "exam-scores",
    title: "考试成绩",
    description: "查看成绩结果、通过状态和最近成绩。",
    icon: FileCheck2,
    items: [
      {
        title: "考试成绩",
        description: "查看成绩结果、通过状态和最近考试记录。",
        href: "/scores",
        routeLabel: "/scores",
      },
    ],
  },
  {
    id: "certificates",
    title: "证书资产",
    description: "查看电子证书、获取状态和下载记录。",
    icon: Medal,
    items: [
      {
        title: "我的证书",
        description: "查看证书发放状态、下载记录和证书说明。",
        href: "/me/certificates",
        routeLabel: "/me/certificates",
      },
    ],
  },
  {
    id: "message-center",
    title: "消息中心",
    description: "集中查看系统通知、课程消息和待处理提醒。",
    icon: Bell,
    items: [
      {
        title: "消息中心",
        description: "查看系统通知、学习提醒和服务消息。",
        href: "/me/messages",
        routeLabel: "/me/messages",
      },
    ],
  },
];

export const ME_OVERVIEW_STATS = [
  {
    label: "学习入口",
    value: "3",
    description: "课程、考试和练习会优先出现在你的主工作区。",
    icon: LayoutGrid,
  },
  {
    label: "核心入口",
    value: String(ME_ENTRY_GROUPS.reduce((sum, group) => sum + group.items.length, 0)),
    description: "资料、学习、订单、证书和消息都会在这里汇合。",
    icon: UserRound,
  },
  {
    label: "今日状态",
    value: "在线",
    description: "你的个人空间已准备好，随时可以继续处理今天的学习任务。",
    icon: ShieldCheck,
  },
] as const;
