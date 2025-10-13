import DashboardPageClient from "@/components/dashboard/dashboard-page";

export default async function DashboardPage() {
  // Data fetching is now handled on the client-side in DashboardPageClient
  return <DashboardPageClient initialTemplates={[]} />;
}
