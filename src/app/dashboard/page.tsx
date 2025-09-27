import DashboardPageClient from "@/components/dashboard/dashboard-page";
import { getJobTemplates } from "@/lib/db/actions";


export default async function DashboardPage() {
  const templates = await getJobTemplates();
  return <DashboardPageClient initialTemplates={templates} />;
}
