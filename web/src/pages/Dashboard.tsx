import { useUser } from "@clerk/clerk-react";

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName || user?.primaryEmailAddress?.emailAddress}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="font-medium text-lg mb-4">Install CLI</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Install the SkillManager CLI to bring AI agents directly to your terminal.
          </p>
          <div className="bg-background rounded-md p-3 font-mono text-sm border border-border flex justify-between items-center">
            <span className="text-primary">npm i -g @skillmanager/cli</span>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              Copy
            </button>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="font-medium text-lg mb-4">Your Subscription</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            You are currently on the <span className="font-bold text-primary">FREE</span> plan.
          </p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}
