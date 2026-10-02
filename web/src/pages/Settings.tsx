import { UserProfile } from "@clerk/clerk-react";
import { AppSeo } from "@/components/seo";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

function ProfileSkeleton() {
  return (
    <div className="grid min-h-[520px] gap-6 rounded-xl border border-border bg-surface p-6 md:grid-cols-[12rem_minmax(0,1fr)]" aria-hidden>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-2/3" />
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <div className="flex flex-col gap-8">
      <AppSeo title="Settings" />
      <PageHeader title="Settings" description="Your profile, email addresses, password, and the sessions signed in to your account." />
      {/* Path routing renders Clerk's sub-pages (security, etc.) under /settings/*. */}
      <UserProfile
        path="/settings"
        fallback={<ProfileSkeleton />}
        appearance={{
          elements: {
            rootBox: { width: "100%" },
            cardBox: { width: "100%", maxWidth: "none", boxShadow: "var(--elevation-xs)" },
          },
        }}
      />
    </div>
  );
}
