import { AppSeo } from "@/components/seo";
import { PageHeader } from "@/components/ui/page-header";
import { AgentCatalog } from "@/components/agents/agent-catalog";
import { InlineCode } from "@/components/agents/inline-code";
import { InstallRow } from "@/components/agents/install-row";
import { PacksSection } from "@/components/agents/packs-section";

export default function Agents() {
  return (
    <>
      <AppSeo title="Agents" />
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-5">
          <PageHeader
            title="Agents"
            description={
              <>
                Agents and curated packs on your plan.{" "}
                <InlineCode className="text-13">sm install</InlineCode> adds everything;{" "}
                <InlineCode className="text-13">sm install --pack &lt;slug&gt;</InlineCode> installs one pack.
              </>
            }
          />
          <InstallRow />
        </div>
        <AgentCatalog />
        <PacksSection />
      </div>
    </>
  );
}
