import { ChatbotsListView } from "@/feature/chatbots/components/chatbots-list-view";
import { listChatbots } from "@/feature/chatbots/queries/chatbots.queries";

export default async function ChatbotsPage() {
  const chatbots = await listChatbots();
  return <ChatbotsListView chatbots={chatbots} />;
}
