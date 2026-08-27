import { KnowledgeFilesView } from "@/feature/knowledge/components/knowledge-files-view";
import { listOrganizationDocuments } from "@/feature/knowledge/actions/knowledge.actions";
import { getMembershipRole } from "@/feature/org/actions/org.actions";
import { canEditChatbots } from "@/lib/permissions";

export default async function KnowledgePage() {
  const documents = await listOrganizationDocuments();
  const role = await getMembershipRole();

  return (
    <KnowledgeFilesView documents={documents} canEdit={canEditChatbots(role)} />
  );
}
