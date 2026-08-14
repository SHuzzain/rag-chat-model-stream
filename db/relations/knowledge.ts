import { defineRelations } from "drizzle-orm";

import {
  chatbotKnowledgeBases,
  chatbots,
  documentChunks,
  documents,
  knowledgeBases,
  organization,
} from "../schema";

const knowledgeRelations = defineRelations(
  {
    knowledgeBases,
    chatbotKnowledgeBases,
    documents,
    documentChunks,
    chatbots,
    organization,
  },
  (r) => ({
    knowledgeBases: {
      documents: r.many.documents({
        from: r.knowledgeBases.id,
        to: r.documents.knowledgeBaseId,
      }),
      chatbotLinks: r.many.chatbotKnowledgeBases({
        from: r.knowledgeBases.id,
        to: r.chatbotKnowledgeBases.knowledgeBaseId,
      }),
    },
    chatbotKnowledgeBases: {
      chatbot: r.one.chatbots({
        from: r.chatbotKnowledgeBases.chatbotId,
        to: r.chatbots.id,
      }),
      knowledgeBase: r.one.knowledgeBases({
        from: r.chatbotKnowledgeBases.knowledgeBaseId,
        to: r.knowledgeBases.id,
      }),
    },
    documents: {
      knowledgeBase: r.one.knowledgeBases({
        from: r.documents.knowledgeBaseId,
        to: r.knowledgeBases.id,
      }),
      chunks: r.many.documentChunks({
        from: r.documents.id,
        to: r.documentChunks.documentId,
      }),
    },
    documentChunks: {
      document: r.one.documents({
        from: r.documentChunks.documentId,
        to: r.documents.id,
      }),
    },
  })
);

export default knowledgeRelations;
