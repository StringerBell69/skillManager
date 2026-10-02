import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button-variants";
import { Seo } from "@/components/seo";
import { SITE_NAME } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Seo title={`Page not found | ${SITE_NAME}`} noindex />
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
        <Link to="/" aria-label="SkillManager home">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-24">
        <div className="max-w-sm text-center">
          <p className="font-mono text-[13px] text-muted-foreground">404</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">This page does not exist</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The link may be broken, or the page may have moved.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/" className={buttonVariants({ variant: "secondary" })}>
              <ArrowLeft aria-hidden />
              Back to home
            </Link>
            <Link to="/dashboard" className={buttonVariants({ variant: "primary" })}>
              Open dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
