import type { RedirectType } from "next/navigation";
import { redirect } from "next/navigation";

export const navigateTo = (route: string, type: "push" | "replace" = "push") => {
  const redirectType = type as RedirectType;
  redirect(route, redirectType);
};
