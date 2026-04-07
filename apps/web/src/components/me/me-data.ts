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
    title: "基本设置",
    description: "对应旧站的资料维护与账号安全入口。",
    icon: Settings2,
    items: [
      {
        title: "个人信息",
        description: "维护头像、姓名、联系方式等基础学员资料。",
        href: "/me/profile",
        routeLabel: "/me/profile",
      },
      {
        title: "账号安全",
        description: "管理密码、登录设备与账号安全提醒。",
        href: "/me/security",
        routeLabel: "/me/security",
      },
    ],
  },
  {
    id: "my-courses",
    title: "我的课程",
    description: "汇总已加入课程与继续学习入口。",
    icon: BookOpen,
    items: [
      {
        title: "我的课程",
        description: "查看课程列表、学习状态与进入课程的快捷入口。",
        href: "/courses",
        routeLabel: "/courses",
      },
    ],
  },
  {
    id: "my-exams",
    title: "我的考试",
    description: "聚合待参加与历史考试入口。",
    icon: ClipboardList,
    items: [
      {
        title: "我的考试",
        description: "查看考试安排、考试状态与考试入口。",
        href: "/exams",
        routeLabel: "/exams",
      },
    ],
  },
  {
    id: "my-orders",
    title: "我的订单",
    description: "跟踪订单状态、支付信息与售后处理。",
    icon: ReceiptText,
    items: [
      {
        title: "我的订单",
        description: "统一查看订单记录、付款状态与售后进度。",
        href: "/me/orders",
        routeLabel: "/me/orders",
      },
    ],
  },
  {
    id: "purchased-goods",
    title: "已购商品",
    description: "承接旧站已购课程与考试内容查看入口。",
    icon: Package,
    items: [
      {
        title: "已购商品",
        description: "查看已购买课程、考试与对应的后续入口说明。",
        href: "/me/purchases",
        routeLabel: "/me/purchases",
      },
    ],
  },
  {
    id: "course-study",
    title: "课程学习",
    description: "保留学习进度与学习记录两类子入口。",
    icon: LayoutGrid,
    items: [
      {
        title: "学习进度",
        description: "按课程查看阶段完成度与待完成章节。",
        href: "/me/study-progress",
        routeLabel: "/me/study-progress",
      },
      {
        title: "学习记录",
        description: "回看最近学习行为、学习时间与课程轨迹。",
        href: "/me/study-records",
        routeLabel: "/me/study-records",
      },
    ],
  },
  {
    id: "practice-records",
    title: "练习记录",
    description: "承接题库练习明细、错题与练习轨迹。",
    icon: ScrollText,
    items: [
      {
        title: "练习记录",
        description: "查看练习次数、最近训练与错题回顾入口。",
        href: "/practice",
        routeLabel: "/practice",
      },
    ],
  },
  {
    id: "exam-scores",
    title: "考试成绩",
    description: "延续旧站考试成绩查询与成绩明细入口。",
    icon: FileCheck2,
    items: [
      {
        title: "考试成绩",
        description: "查看成绩结果、通过状态与最近考试记录。",
        href: "/scores",
        routeLabel: "/scores",
      },
    ],
  },
  {
    id: "certificates",
    title: "我的证书",
    description: "汇总电子证书与获取进度说明。",
    icon: Medal,
    items: [
      {
        title: "我的证书",
        description: "查看证书发放状态、下载记录与证书说明。",
        href: "/me/certificates",
        routeLabel: "/me/certificates",
      },
    ],
  },
  {
    id: "message-center",
    title: "消息中心",
    description: "保留系统通知、课程消息与待处理提醒入口。",
    icon: Bell,
    items: [
      {
        title: "消息中心",
        description: "查看系统通知、学习提醒与服务消息。",
        href: "/me/messages",
        routeLabel: "/me/messages",
      },
    ],
  },
];

export const ME_OVERVIEW_STATS = [
  {
    label: "导航分组",
    value: String(ME_ENTRY_GROUPS.length),
    description: "完整保留旧版个人中心的一级分组结构。",
    icon: LayoutGrid,
  },
  {
    label: "核心入口",
    value: String(ME_ENTRY_GROUPS.reduce((sum, group) => sum + group.items.length, 0)),
    description: "包含资料、学习、订单、证书、消息等全部主入口。",
    icon: UserRound,
  },
  {
    label: "迁移状态",
    value: "静态预览",
    description: "本页只迁移结构，不接真实接口，后续逐项补子路由。",
    icon: ShieldCheck,
  },
] as const;
