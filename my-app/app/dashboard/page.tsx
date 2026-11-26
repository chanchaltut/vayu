import { redirect } from "next/navigation";

// The dashboard lives in the Detect / Act sections of the home page.
export default function DashboardPage() {
  redirect("/#detect");
}
