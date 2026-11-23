import { requireAuth } from "@/features/auth/api/getServerAuth";
import { DashboardContent } from "@/features/dashboard/components/DashboardContent";

export default async function DashboardPage() {
  await requireAuth();

  return <DashboardContent />;
}
