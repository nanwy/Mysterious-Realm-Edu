import {
  type StudentProfileErrorType,
  getStudentProfile,
} from "@/lib/student-profile";
import { toRecord } from "@/lib/normalize";
import { SecurityPageShell, type SecurityPageShellProps } from "./security-page-shell";

function pickText(source: Record<string, unknown> | null, keys: string[], fallback = "") {
  if (!source) {
    return fallback;
  }

  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return fallback;
}

function withFallback(value: string, fallback = "未填写") {
  return value || fallback;
}

function maskPhone(value: string) {
  const digits = value.replace(/\s+/g, "");

  if (digits.length < 7) {
    return digits || "未绑定";
  }

  return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
}

function maskEmail(value: string) {
  const [name, domain] = value.split("@");

  if (!name || !domain) {
    return value || "未绑定";
  }

  if (name.length <= 2) {
    return `${name.slice(0, 1)}*@${domain}`;
  }

  return `${name.slice(0, 2)}***@${domain}`;
}

function hasSecurityContent(profile: Record<string, unknown> | null) {
  if (!profile) {
    return false;
  }

  const values = [
    pickText(profile, ["phone", "mobile", "mobilePhone", "tel"]),
    pickText(profile, ["email", "mail"]),
    pickText(profile, ["userName", "username", "studentNo", "studentNumber", "userId"]),
    pickText(profile, ["realName", "realname", "name", "nickName", "nickname"]),
  ];

  return values.some(Boolean);
}

function toShellState(result: Awaited<ReturnType<typeof getStudentProfile>>): SecurityPageShellProps {
  if (result.errorType) {
    return {
      state: "error",
      errorType: result.errorType as Exclude<StudentProfileErrorType, null>,
      errorMessage: result.error,
    };
  }

  const profile = toRecord(result.profile);

  if (!hasSecurityContent(profile)) {
    return {
      state: "empty",
    };
  }

  const rawPhone = pickText(profile, ["phone", "mobile", "mobilePhone", "tel"]);
  const rawEmail = pickText(profile, ["email", "mail"]);
  const identity = withFallback(
    pickText(profile, ["userName", "username", "studentNo", "studentNumber", "userId"]),
    "暂无账号标识"
  );
  const displayName = withFallback(
    pickText(profile, ["realName", "realname", "name", "nickName", "nickname"]),
    "当前学员"
  );

  return {
    state: "ready",
    summary: {
      title: displayName,
      description: `账号标识：${identity}`,
      detail:
        rawPhone || rawEmail
          ? "已聚合现有联系方式，当前页面仅承接只读安全概览。"
          : "当前尚未绑定完整联系方式，后续安全能力会在此页继续承接。",
    },
    sections: [
      {
        title: "手机号",
        description: "沿用旧版手机号展示层级，当前只做安全概览和后续换绑说明。",
        testId: "security-phone-section",
        value: rawPhone ? maskPhone(rawPhone) : "未绑定手机号",
        status: rawPhone ? "已绑定" : "待补充",
        helper:
          "真实换绑流程暂未接入。后续会在此承接短信校验、风险确认和新号码绑定。",
      },
      {
        title: "邮箱",
        description: "承接旧版邮箱展示与修改入口位置，当前保持只读和状态说明。",
        testId: "security-email-section",
        value: rawEmail ? maskEmail(rawEmail) : "未绑定邮箱",
        status: rawEmail ? "已绑定" : "待补充",
        helper: "真实邮箱修改暂未开放。后续会补齐验证码校验与安全确认步骤。",
      },
      {
        title: "密码",
        description: "保留旧版密码修改入口语义，但不在本 issue 内开放提交能力。",
        testId: "security-password-section",
        value: "出于安全原因，当前不展示密码内容。",
        status: "只读占位",
        helper:
          "后续会承接原密码、新密码、确认密码三段式流程，并保留 8-20 位字母数字组合的提示。",
      },
    ],
  };
}

export async function SecurityPageContent() {
  const result = await getStudentProfile();

  return <SecurityPageShell {...toShellState(result)} />;
}
