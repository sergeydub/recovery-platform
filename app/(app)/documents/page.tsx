import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { requireOrg } from "@/lib/auth";

export const metadata: Metadata = { title: "Documents" };

export default async function DocumentsPage() {
  await requireOrg();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title="Documents"
        description="Photos, reports and evidence for insurance claims"
      />
      <EmptyState
        icon={FileText}
        title="Documents are coming soon"
        description="Document storage for insurance evidence arrives with the first domain features."
      />
    </div>
  );
}
