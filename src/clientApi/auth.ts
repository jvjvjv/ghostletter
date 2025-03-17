import type { GhostFormResponse } from "@/components/GhostForm/GhostForm";
import { sleep } from "@/lib/utils";

export const authenticate = async (
  username: FormDataEntryValue,
  password: FormDataEntryValue,
): Promise<GhostFormResponse> => {
  await sleep(Math.random() * 4000 + 500);
  if (!username) {
    return {
      success: false,
      message: "Username is required",
      fields: { username },
    };
  }
  if (!password) {
    return {
      success: false,
      message: "Password is required",
      fields: { password },
    };
  }
  const success = username == "demo01" && password == "demo01";
  if (success) {
    return {
      success: true,
      message: "Authenticated",
    };
  }
  return {
    success: false,
    message: "Invalid credentials",
    fields: { username },
  };
};
