import { redirect } from "next/navigation";

import type { RedirectType } from "next/navigation";

export function GET() {
  redirect("/main/camera", "replace" as RedirectType);
}
