import { useBilling } from "@/hooks/useAccount";
import { AppSeo } from "@/components/seo";
import { PageHeader } from "@/components/ui/page-header";
import { BillingNotice } from "@/components/overview/billing-notice";
import { QueryError } from "@/components/overview/query-error";
import { RecentDevicesCard } from "@/components/overview/recent-devices-card";
import { SetupCard } from "@/components/overview/setup-card";
import { SummaryCards, SummaryCardsSkeleton } from "@/components/overview/summary-cards";
import { YourAgentsCard } from "@/components/overview/your-agents-card";

export default function Dashboard() {
  const billing = useBilling();
  const connected = billing.data ? billing.data.usage.deviceCount > 0 : null;

  return (
    <>
      <AppSeo title="Overview" />
      <div className="flex flex-col gap-8">
        <PageHeader title="Overview" description="Your plan, connected devices, and agents." />

        {billing.data ? (
          <>
            <BillingNotice billing={billing.data} />
            <SummaryCards billing={billing.data} />
          </>
        ) : billing.isError ? (
          <QueryError
            title="Could not load your plan and usage"
            error={billing.error}
            onRetry={() => void billing.refetch()}
            retrying={billing.isFetching}
          />
        ) : (
          <SummaryCardsSkeleton />
        )}

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <SetupCard connected={connected} loading={billing.isPending} />
          <div className="flex flex-col gap-6">
            <RecentDevicesCard />
            <YourAgentsCard />
          </div>
        </div>
      </div>
    </>
  );
}
