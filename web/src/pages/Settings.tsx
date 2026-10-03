import type { ReactNode } from "react";
import { UserProfile } from "@clerk/clerk-react";
import { AppSeo } from "@/components/seo";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";

function ProfileSkeleton() {
  return (
    <div className="grid min-h-[520px] gap-6 rounded-xl border border-card-edge bg-surface p-6 shadow-card md:grid-cols-[12rem_minmax(0,1fr)]" aria-hidden>
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

/** Grouped section with a small label above it, as in iOS Settings. */
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2.5">
      <h2 id={id} className="px-1 text-13 font-medium text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Settings() {
  return (
    <div className="flex flex-col gap-8">
      <AppSeo title="Settings" />
      <PageHeader title="Settings" description="Appearance, your profile, email addresses, password, and the sessions signed in to your account." />

      <Section id="settings-appearance" title="Appearance">
        <div className="flex flex-col gap-4 rounded-xl border border-card-edge bg-surface px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Theme</p>
            <p className="mt-0.5 text-13 text-muted-foreground">Follow your device setting, or always use light or dark.</p>
          </div>
          <ThemeToggle withLabels className="self-start sm:self-auto" />
        </div>
      </Section>

      <Section id="settings-account" title="Account">
        {/* Path routing renders Clerk's sub-pages (security, etc.) under /settings/*. */}
        <UserProfile
          routing="path"
          path="/settings"
          fallback={<ProfileSkeleton />}
          appearance={{
            elements: {
              rootBox: { width: "100%" },
              cardBox: { width: "100%", maxWidth: "none", boxShadow: "var(--elevation-card)" },
            },
          }}
        />
      </Section>
    </div>
  );
}
