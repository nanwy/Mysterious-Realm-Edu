import type {
  UserCurrentDeptResponse,
  UserDepartment,
  UserProfileResponse,
} from "@workspace/api";

export type StudentProfileErrorType =
  | "config_missing"
  | "unauthorized"
  | "request_failed"
  | null;

export interface StudentProfileResult {
  profile: UserProfileResponse | null;
  currentDept: UserCurrentDeptResponse | null;
  departs: UserDepartment[];
  error: string | null;
  errorType: StudentProfileErrorType;
}
