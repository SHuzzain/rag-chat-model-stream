import { tool } from "ai"
import z from "zod"

/**
 * Tool: Create or query tickets in the FSM (Field Service Management) system.
 *
 * TODO: Implement actual FSM API integration.
 * - Connect to your FSM API endpoint
 * - Add authentication headers
 * - Handle error responses
 *
 * Example future usage:
 *   - "Create a ticket for broken AC unit"
 *   - "What's the status of ticket #12345?"
 */

export function createFSMTicketTool() {
  return tool({
    description:
      "Create a new service ticket or check the status of an existing ticket in the FSM system. Use when the user asks about service tickets, job status, or field service requests.",
    inputSchema: z.object({
      action: z.enum(["create", "status"]).describe("Whether to create a new ticket or check status"),
      ticketId: z.string().optional().describe("Ticket ID to check status (required for 'status' action)"),
      subject: z.string().optional().describe("Subject/title for a new ticket (required for 'create' action)"),
      description: z.string().optional().describe("Description of the issue (for 'create' action)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      ticketId: z.string().optional(),
      status: z.string().optional(),
    }),
    execute: async ({ action, ticketId, subject, description }) => {
      // TODO: Replace with actual FSM API call
      // Example:
      //   const response = await fetch(`${FSM_API_URL}/tickets`, {
      //     method: action === "create" ? "POST" : "GET",
      //     headers: { "Authorization": `Bearer ${FSM_API_KEY}` },
      //     body: action === "create" ? JSON.stringify({ subject, description }) : undefined,
      //   })

      return {
        success: false,
        message: "FSM ticket integration is not yet configured. This feature will be available soon.",
        ticketId: ticketId,
        status: undefined,
      }
    },
  })
}
