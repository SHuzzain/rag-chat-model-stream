import { defineRelations } from "drizzle-orm";

import {
  chatbotDeployments,
  chatbotVersions,
  chatbots,
  conversations,
  messages,
  modelUsageEvents,
  organization,
  user,
} from "../schema";

const chatbotRelations = defineRelations(
  {
    chatbots,
    chatbotVersions,
    chatbotDeployments,
    conversations,
    messages,
    modelUsageEvents,
    organization,
    user,
  },
  (r) => ({
    chatbots: {
      organization: r.one.organization({
        from: r.chatbots.organizationId,
        to: r.organization.id,
      }),
      versions: r.many.chatbotVersions({
        from: r.chatbots.id,
        to: r.chatbotVersions.chatbotId,
      }),
      deployment: r.one.chatbotDeployments({
        from: r.chatbots.id,
        to: r.chatbotDeployments.chatbotId,
      }),
      conversations: r.many.conversations({
        from: r.chatbots.id,
        to: r.conversations.chatbotId,
      }),
    },
    chatbotVersions: {
      chatbot: r.one.chatbots({
        from: r.chatbotVersions.chatbotId,
        to: r.chatbots.id,
      }),
    },
    chatbotDeployments: {
      chatbot: r.one.chatbots({
        from: r.chatbotDeployments.chatbotId,
        to: r.chatbots.id,
      }),
    },
    conversations: {
      chatbot: r.one.chatbots({
        from: r.conversations.chatbotId,
        to: r.chatbots.id,
      }),
      messages: r.many.messages({
        from: r.conversations.id,
        to: r.messages.conversationId,
      }),
    },
    messages: {
      conversation: r.one.conversations({
        from: r.messages.conversationId,
        to: r.conversations.id,
      }),
    },
  })
);

export default chatbotRelations;
