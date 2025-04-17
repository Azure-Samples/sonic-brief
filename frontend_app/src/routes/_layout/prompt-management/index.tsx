import { createFileRoute } from "@tanstack/react-router";
import { PromptManagementContent } from "@/components/prompt-management/content";
import { PromptManagementHeader } from "@/components/prompt-management/header";
import { PromptManagementProvider } from "@/components/prompt-management/prompt-management-context";

export const Route = createFileRoute("/_layout/prompt-management/")({
  component: PromptManagementPage,
});

function PromptManagementPage() {
  return (
    <PromptManagementProvider>
      <div className="space-y-4 p-4 pt-6 md:p-8">
        <PromptManagementHeader />
        <PromptManagementContent />
      </div>
    </PromptManagementProvider>
  );
}
