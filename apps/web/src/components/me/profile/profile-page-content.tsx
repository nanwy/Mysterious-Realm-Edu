import {
  type StudentProfileErrorType,
  type StudentProfileResult,
  getStudentProfile,
} from "@/lib/student-profile";
import { resolveMediaUrl } from "@/lib/media";
import { ProfilePageShell, type ProfilePageShellProps } from "./profile-page-shell";

function toRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickText(
  source: Record<string, unknown> | null,
  keys: string[],
  fallback = ""
) {
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

function formatGender(value: unknown) {
  if (value === 1 || value === "1" || value === "male" || value === "男") {
    return "男";
  }

  if (value === 2 || value === "2" || value === "female" || value === "女") {
    return "女";
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return "未填写";
}

function withFallback(value: string, fallback = "未填写") {
  return value || fallback;
}

function getDepartmentNames(result: StudentProfileResult) {
  return result.departs
    .map((item) => pickText(item, ["deptName", "departName", "departmentName", "orgName"]))
    .filter(Boolean);
}

function hasProfileContent(
  profile: Record<string, unknown> | null,
  currentDept: Record<string, unknown> | null,
  result: StudentProfileResult
) {
  const profileFields = [
    pickText(profile, ["realName", "realname", "name", "nickName", "nickname", "userName"]),
    pickText(profile, ["avatar", "avatarUrl", "headImg", "headimg", "photo"]),
    pickText(profile, ["birthday", "birthDay", "birth"]),
    pickText(profile, ["sex", "gender"]),
    pickText(profile, ["integral", "score", "points"]),
    pickText(profile, ["email", "mail"]),
    pickText(profile, ["phone", "mobile", "mobilePhone", "tel"]),
    pickText(profile, ["wechat", "weChat", "wxCode"]),
    pickText(profile, ["qq"]),
  ];

  if (profileFields.some(Boolean)) {
    return true;
  }

  const currentDeptFields = [
    pickText(currentDept, ["deptName", "departName", "departmentName", "orgName"]),
    pickText(currentDept, ["deptId", "departId", "departmentId", "id"]),
    pickText(currentDept, ["companyName", "tenantName", "schoolName"]),
  ];

  if (currentDeptFields.some(Boolean)) {
    return true;
  }

  return result.departs.some((item) =>
    Boolean(pickText(item, ["deptName", "departName", "departmentName", "orgName"]))
  );
}

function toShellState(result: StudentProfileResult): ProfilePageShellProps {
  if (result.errorType) {
    return {
      state: "error",
      errorType: result.errorType as Exclude<StudentProfileErrorType, null>,
      errorMessage: result.error,
    };
  }

  const profile = toRecord(result.profile);
  const currentDept = toRecord(result.currentDept);
  const name = withFallback(
    pickText(profile, ["realName", "realname", "name", "nickName", "nickname", "userName"]),
    "未命名学员"
  );
  const currentDeptName = withFallback(
    pickText(currentDept, ["deptName", "departName", "departmentName", "orgName"]),
    "暂无当前部门"
  );
  const departmentNames = getDepartmentNames(result);
  const loginIdentity = withFallback(
    pickText(profile, ["userName", "username", "studentNo", "studentNumber", "userId"]),
    "暂无学员编号"
  );
  const summary = {
    name,
    subtitle: currentDeptName,
    secondaryLine: `账号标识：${loginIdentity}`,
    avatarUrl: resolveMediaUrl(
      pickText(profile, ["avatar", "avatarUrl", "headImg", "headimg", "photo"], "")
    ),
  };
  const sections = [
    {
      title: "详细资料",
      description: "聚合展示学员基础身份字段，保持只读结构并统一缺失值表达。",
      testId: "profile-details-section",
      items: [
        {
          label: "生日",
          value: withFallback(pickText(profile, ["birthday", "birthDay", "birth"])),
        },
        {
          label: "性别",
          value: formatGender(profile?.sex ?? profile?.gender),
        },
        {
          label: "积分",
          value: `${pickText(profile, ["integral", "score", "points"], "0")} 分`,
        },
        {
          label: "昵称",
          value: withFallback(pickText(profile, ["nickName", "nickname", "userNickName"])),
        },
      ],
    },
    {
      title: "联系信息",
      description: "统一展示当前可用的联系渠道，便于快速确认资料完整度。",
      testId: "profile-contact-section",
      items: [
        {
          label: "邮箱",
          value: withFallback(pickText(profile, ["email", "mail"])),
        },
        {
          label: "手机",
          value: withFallback(pickText(profile, ["phone", "mobile", "mobilePhone", "tel"])),
        },
        {
          label: "微信",
          value: withFallback(pickText(profile, ["wechat", "weChat", "wxCode"])),
        },
        {
          label: "QQ",
          value: withFallback(pickText(profile, ["qq"])),
        },
      ],
    },
    {
      title: "当前部门",
      description: "梳理当前组织归属与可见部门范围，处理多部门和长名称场景。",
      testId: "profile-department-section",
      items: [
        {
          label: "当前部门",
          value: currentDeptName,
        },
        {
          label: "部门编码",
          value: withFallback(
            pickText(currentDept, ["deptId", "departId", "departmentId", "id"]),
            "暂无"
          ),
        },
        {
          label: "所属组织",
          value: withFallback(
            pickText(currentDept, ["orgName", "companyName", "tenantName", "schoolName"]),
            "暂无"
          ),
        },
        {
          label: "可见部门",
          value: departmentNames.length > 0 ? departmentNames.join("\n") : "暂无",
        },
      ],
    },
  ] as const;

  const readyState = {
    summary,
    sections: [...sections],
  };

  if (!hasProfileContent(profile, currentDept, result)) {
    return {
      state: "empty",
    };
  }

  return {
    state: "ready",
    ...readyState,
  };
}

export async function ProfilePageContent() {
  const result = await getStudentProfile();

  return <ProfilePageShell {...toShellState(result)} />;
}
