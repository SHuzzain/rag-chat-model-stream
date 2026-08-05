import { createCRMLeadTool } from "./crm-lead"
import { createFSMTicketTool } from "./fsm-ticket"
import { createSearchKnowledgeBaseTool } from "./search-knowledge-base"

export function createAllTools() {
  return {
    searchKnowledgeBase: createSearchKnowledgeBaseTool({ topK: 5 }),

    // TODO: Uncomment when FSM API is configured
    fsmTicket: createFSMTicketTool(),

    // TODO: Uncomment when CRM API is configured
    crmLead: createCRMLeadTool(),
  }
}
