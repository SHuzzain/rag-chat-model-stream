import { ChatbotsListView } from "@/feature/chatbots/components/chatbots-list-view";
import { listChatbots } from "@/feature/chatbots/actions/chatbots.actions";

export default async function ChatbotsPage() {
  const chatbots = await listChatbots();
  return <ChatbotsListView chatbots={chatbots} />;
}
