# Production Plan: Multi-Tenant Chatbot Builder Platform

Your idea is a **chatbot SaaS platform** where a customer can:

1. Create a chatbot.
2. Configure its system prompt and model.
3. Upload knowledge for RAG.
4. connect APIs or MCP servers.
5. Add reusable skills and workflows.
6. Customize the chatbot UI.
7. Publish it.
8. Receive a URL or embed script.
9. Track conversations, tokens, cost, users, leads, tool calls, and errors.

A published chatbot could be embedded like this:

```html
<script
  src="https://cdn.yourplatform.com/chatbot.js"
  data-bot-id="bot_xxxxxxxxx"
></script>
```

Or opened directly:

```text
https://chat.yourplatform.com/b/bot_xxxxxxxxx
```

---

# 1. Main Product Modules

## A. Organization and tenant management

Make the platform multi-tenant from the beginning.

Each customer should have:

* Organization
* Workspaces
* Team members
* Roles and permissions
* Subscription
* Usage limits
* Multiple chatbots
* Separate API keys and integrations

Recommended roles:

```text
OWNER
ADMIN
DEVELOPER
ANALYST
VIEWER
```

Never identify the tenant only from a client-provided `organizationId`. Resolve it from the authenticated user, API key, chatbot publish key, or verified domain.

---

## B. Chatbot builder

Each chatbot should contain:

```ts
interface ChatbotConfig {
  id: string;
  organizationId: string;
  name: string;
  description?: string;

  systemPrompt: string;
  modelProvider: string;
  modelName: string;

  temperature: number;
  maxOutputTokens: number;

  knowledgeBaseIds: string[];
  mcpServerIds: string[];
  toolIds: string[];
  skillIds: string[];

  welcomeMessage?: string;
  suggestedQuestions?: string[];

  isPublished: boolean;
  publishedVersion?: number;
}
```

The builder should have separate sections:

* General
* Instructions
* Model
* Knowledge
* Tools
* MCP servers
* Skills
* Guardrails
* Appearance
* Leads
* Deployment
* Analytics
* Testing
* Versions

Do not save everything as one unstructured JSON object. Store important configuration in normalized tables and use JSON only for provider-specific settings.

---

# 2. Prompt Management

A production chatbot should not have only one large system prompt.

Use multiple prompt layers:

```text
Platform security instructions
        ↓
Organization instructions
        ↓
Chatbot system prompt
        ↓
Selected skill instructions
        ↓
Retrieved knowledge
        ↓
Conversation history
        ↓
Current user message
```

Recommended prompt features:

* Draft and published versions
* Prompt version history
* Restore previous version
* Variables such as `{{user_name}}`
* Environment-specific prompts
* Prompt testing
* Side-by-side model testing
* Prompt approval before publishing
* Injection-resistant instruction boundaries

Example:

```ts
const finalSystemPrompt = `
<platform_rules>
${platformRules}
</platform_rules>

<bot_instructions>
${bot.systemPrompt}
</bot_instructions>

<active_skill>
${skillInstructions ?? "No active skill"}
</active_skill>

<knowledge_context>
${retrievedContext}
</knowledge_context>
`;
```

Never directly concatenate untrusted document content into privileged system instructions. Clearly mark retrieved content as reference material, not instructions.

---

# 3. Knowledge Base and RAG

## Knowledge sources

Support:

* PDF
* DOCX
* TXT
* Markdown
* CSV
* Website crawling
* Sitemap import
* FAQ entry
* Manual text
* API-based data synchronization
* Google Drive or similar connectors later

## Ingestion pipeline

```text
Upload
  ↓
Virus and file validation
  ↓
Text extraction
  ↓
Cleaning
  ↓
Chunking
  ↓
Metadata generation
  ↓
Embedding
  ↓
Vector storage
  ↓
Index ready
```

Store metadata with every chunk:

```ts
interface KnowledgeChunk {
  id: string;
  organizationId: string;
  knowledgeBaseId: string;
  documentId: string;

  content: string;
  embedding: number[];

  sourceName: string;
  sourceUrl?: string;
  pageNumber?: number;
  section?: string;

  version: number;
  checksum: string;
  createdAt: Date;
}
```

## Retrieval pipeline

```text
User question
   ↓
Query classification
   ↓
Query rewriting
   ↓
Metadata filters
   ↓
Vector search
   ↓
Keyword search
   ↓
Hybrid result merge
   ↓
Reranking
   ↓
Context-size filtering
   ↓
Model response with citations
```

Do not send the top vector results directly to the model without filtering.

Add:

* Hybrid search
* Reranking
* Minimum relevance score
* Duplicate removal
* Tenant filtering
* Document permission filtering
* Citation generation
* “No reliable answer found” behaviour
* Retrieval evaluation

Each answer should preserve source information:

```json
{
  "answer": "The refund period is 14 days.",
  "citations": [
    {
      "documentId": "doc_123",
      "documentName": "Refund Policy",
      "page": 3,
      "chunkId": "chunk_987"
    }
  ]
}
```

OpenAI provides retrieval-related tools and embedding capabilities, while a self-managed architecture can use PostgreSQL with `pgvector`, Qdrant, Pinecone, Weaviate, or another vector database. Provider-managed retrieval is easier initially; self-managed retrieval gives you greater control over filtering, portability, and cost.

---

# 4. Tools, MCP and Skills

These are related but should be different platform concepts.

## Tool

A tool performs one specific operation:

```text
get_user
create_ticket
search_courses
generate_report
send_email
```

A tool requires:

* Name
* Description
* Input schema
* Output schema
* Authentication
* Timeout
* Retry policy
* Permission level
* Confirmation requirement

## MCP server

An MCP server exposes one or more tools, resources, or prompts through a standardized protocol. MCP tools can interact with databases, external APIs, computations, and other systems. ([Model Context Protocol][1])

MCP configuration:

```ts
interface MCPServerConfig {
  id: string;
  organizationId: string;

  name: string;
  transport: "HTTP" | "SSE" | "STDIO";
  serverUrl?: string;

  authenticationType:
    | "NONE"
    | "API_KEY"
    | "BEARER"
    | "OAUTH";

  encryptedCredentials?: string;

  allowedTools: string[];
  requiresConfirmation: string[];
  status: "CONNECTED" | "ERROR" | "DISABLED";
}
```

For remote MCP servers, implement proper authorization rather than storing reusable user credentials in plaintext. The MCP specification includes authorization support for HTTP-based transports and documents OAuth-based protection for restricted resources. ([Model Context Protocol][2])

## Skill

A skill is a reusable behaviour or workflow built from:

* Instructions
* Tool permissions
* Knowledge sources
* Output format
* Validation
* Multi-step execution rules

Example:

```text
Skill: Create support ticket

1. Collect customer email.
2. Ask for the issue.
3. Search existing solutions.
4. Confirm before creating a ticket.
5. Call create_support_ticket.
6. Return the ticket number.
```

Suggested skill schema:

```ts
interface Skill {
  id: string;
  organizationId: string;

  name: string;
  description: string;
  instructions: string;

  triggerExamples: string[];
  requiredToolIds: string[];
  knowledgeBaseIds: string[];

  inputSchema?: object;
  outputSchema?: object;

  requiresUserConfirmation: boolean;
  maxSteps: number;

  status: "DRAFT" | "PUBLISHED" | "DISABLED";
  version: number;
}
```

---

# 5. Tool Safety Layer

Do not allow the model to execute every available tool automatically.

Classify tools:

```text
READ_ONLY
LOW_RISK_WRITE
SENSITIVE_WRITE
DESTRUCTIVE
```

Examples:

```text
search_courses     → READ_ONLY
create_ticket      → LOW_RISK_WRITE
send_payment       → SENSITIVE_WRITE
delete_account     → DESTRUCTIVE
```

Execution policy:

```ts
if (tool.risk === "READ_ONLY") {
  return executeTool();
}

if (tool.risk === "LOW_RISK_WRITE") {
  return executeAfterValidation();
}

if (
  tool.risk === "SENSITIVE_WRITE" ||
  tool.risk === "DESTRUCTIVE"
) {
  return requestHumanConfirmation();
}
```

Every tool execution should store:

* Tool-call ID
* User
* Chatbot
* Input
* Sanitized output
* Started time
* Duration
* Status
* Error
* Confirmation record
* Credential used
* Idempotency key

AI SDK supports tool calling and passes tool-call identifiers through the execution lifecycle, which is useful for correlating streamed calls, execution records, and UI state. ([AI SDK][3])

---

# 6. Chat Runtime Architecture

Recommended request flow:

```text
Embedded widget
     ↓
Chat API gateway
     ↓
Domain and publish-key validation
     ↓
Rate limiting
     ↓
Session resolution
     ↓
Input moderation and injection checks
     ↓
Chatbot configuration loader
     ↓
Skill/router selection
     ↓
RAG retrieval
     ↓
Model orchestration
     ↓
Tool or MCP execution
     ↓
Response validation
     ↓
Streaming response
     ↓
Usage and trace storage
```

Use streaming for the user experience. AI SDK’s `streamText()` is intended for interactive applications such as chatbots, and its UI layer supports real-time chatbot streaming and tool-call presentation. ([AI SDK][4])

## Runtime services

Avoid putting the entire system into one route handler.

Recommended services:

```text
API Gateway
Authentication Service
Chat Orchestrator
Prompt Service
Retrieval Service
Knowledge Ingestion Worker
Tool Execution Service
MCP Gateway
Usage and Billing Service
Analytics Service
Notification Service
Moderation Service
```

Start as a **modular monolith**, not microservices.

Use modules with clean boundaries. Extract services only after traffic, scaling, or security requirements justify it.

---

# 7. Chat Widget and Deployment

Provide three deployment options.

## Hosted chatbot

```text
https://chat.example.com/b/{publicBotId}
```

## JavaScript widget

```html
<script>
  window.ChatbotConfig = {
    botId: "bot_public_123",
    position: "bottom-right",
    theme: "light"
  };
</script>

<script
  async
  src="https://cdn.example.com/widget/v1/chatbot.js"
></script>
```

## React package

```tsx
import { ChatbotWidget } from "@your-company/chatbot-react";

export function App() {
  return <ChatbotWidget botId="bot_public_123" />;
}
```

Widget capabilities:

* Shadow DOM or iframe isolation
* Theme customization
* Mobile responsive design
* Streaming
* Markdown
* Code blocks
* File upload
* Voice input later
* Suggested questions
* Source citations
* Feedback buttons
* Human handoff
* Conversation history
* Tool confirmation UI
* Retry and regenerate
* Accessibility
* Localization

For the first release, an **iframe widget is safer and easier** because the customer website’s CSS and JavaScript cannot easily break your chatbot UI.

---

# 8. Domain and Embed Security

Each published chatbot should have:

```ts
interface ChatbotDeployment {
  chatbotId: string;
  publicKey: string;

  allowedDomains: string[];
  requireSignedUser: boolean;

  rateLimitPerMinute: number;
  dailyMessageLimit?: number;

  status: "ACTIVE" | "DISABLED";
}
```

Validate:

* `Origin`
* `Referer` where available
* Public chatbot key
* Bot status
* Allowed domain
* Request rate
* Session signature
* File-upload constraints

Do not place provider API keys inside the widget.

The widget only receives a public bot identifier. All model and MCP communication must pass through your backend.

For authenticated customer users, support signed identity:

```ts
const userToken = sign({
  externalUserId: currentUser.id,
  email: currentUser.email,
  botId,
  exp: Math.floor(Date.now() / 1000) + 300
});
```

The customer’s backend generates the token. Your chatbot backend verifies it.

---

# 9. Token, Cost and Usage Tracking

Track usage at every model request—not only at conversation level.

```ts
interface ModelUsageEvent {
  id: string;
  organizationId: string;
  chatbotId: string;
  conversationId: string;
  messageId: string;

  provider: string;
  model: string;

  inputTokens: number;
  outputTokens: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
  totalTokens: number;

  embeddingTokens?: number;

  providerCost: number;
  customerCost: number;
  currency: string;

  latencyMs: number;
  status: "SUCCESS" | "FAILED";
  createdAt: Date;
}
```

Also track:

* Embedding usage
* Reranking usage
* Speech-to-text usage
* Text-to-speech usage
* Image generation
* Tool execution cost
* Vector database operations
* Storage
* Bandwidth
* Crawled pages

Never calculate final billing only from estimated token counts. Capture provider-returned usage when available and reconcile it against your internal estimate.

## Customer usage dashboard

Show:

```text
Total messages
Unique users
Active conversations
Input tokens
Output tokens
Embedding tokens
Model cost
Customer charge
Average response time
Tool success rate
RAG hit rate
Positive feedback rate
Escalation rate
Error rate
```

## Limits

Support:

* Messages per month
* Token budget
* Spending cap
* Knowledge storage
* Number of chatbots
* Number of team members
* MCP connections
* Tool executions
* File-upload size
* Conversation retention

Limit behaviour:

```text
80% usage → dashboard warning
90% usage → email warning
100% usage → block, downgrade model, or allow overage
```

Make the behaviour configurable by plan.

---

# 10. Analytics You Are Missing

Token tracking alone is insufficient.

Add these analytics.

## Conversation analytics

* Total conversations
* Completion rate
* Abandonment rate
* Average messages per conversation
* Average conversation duration
* Returning users
* Peak usage hours

## AI quality analytics

* Unanswered questions
* Low-confidence retrievals
* Hallucination reports
* Citation coverage
* Negative feedback
* Regenerated answers
* Escalations to humans
* Prompt version performance

## Knowledge analytics

* Most-used documents
* Questions with no matching source
* Stale documents
* Failed indexing
* Crawl errors
* Duplicate content
* Source-level accuracy

## Tool analytics

* Calls by tool
* Tool success rate
* Confirmation rejection rate
* Average tool latency
* Common validation failures
* MCP connection failures

## Business analytics

* Leads collected
* Conversion events
* Qualified conversations
* Support tickets avoided
* Human handoffs
* Cost per resolved conversation

---

# 11. Observability and Debugging

Create one trace for every user message.

```text
Trace
 ├── Authentication
 ├── Prompt building
 ├── Query rewriting
 ├── Vector retrieval
 ├── Reranking
 ├── Model generation
 ├── Tool call
 ├── MCP request
 └── Response streaming
```

Store:

* Trace ID
* Request ID
* Prompt version
* Model
* Retrieval chunks
* Token usage
* Latency
* Tool calls
* Errors
* Final response
* User feedback

AI SDK provides telemetry hooks for generation lifecycle events and supports observability integrations that map model calls, tool calls, embeddings, reranking, and traces. ([AI SDK][5])

Important privacy rule: do not expose full prompts, tool credentials, or sensitive customer data to all organization users. Use permission-controlled trace views and redact secrets.

---

# 12. Human Handoff

This is an important missing feature.

Trigger handoff when:

* User explicitly asks for a person
* Model cannot answer
* Negative sentiment is detected
* Sensitive action requires approval
* High-value lead is identified
* Tool repeatedly fails

Handoff integrations can include:

* Email
* Slack
* Microsoft Teams
* Zendesk
* Freshdesk
* Intercom
* Custom webhook

Pass:

```json
{
  "conversationId": "conv_123",
  "chatbotId": "bot_123",
  "user": {
    "name": "Customer",
    "email": "customer@example.com"
  },
  "summary": "Customer needs help with subscription cancellation.",
  "transcriptUrl": "https://dashboard.example.com/conversations/conv_123"
}
```

---

# 13. Lead Collection

Allow chatbot owners to configure:

* Ask for name
* Ask for email
* Ask for phone
* Ask before chat
* Ask after several messages
* Ask only when user shows purchase intent
* Custom fields
* Consent checkbox
* Webhook or CRM destination

Do not let the model invent collected data. Validate email, phone, and required consent in application code.

---

# 14. Data Model

Core tables:

```text
organizations
organization_members
subscriptions
plans
usage_limits

chatbots
chatbot_versions
chatbot_deployments
chatbot_domains
chatbot_themes

prompt_versions
skills
skill_versions
chatbot_skills

knowledge_bases
documents
document_versions
document_chunks
ingestion_jobs
crawl_sources

tools
tool_versions
chatbot_tools
tool_executions

mcp_servers
mcp_server_tools
mcp_credentials
mcp_connections

conversations
conversation_participants
messages
message_citations
message_feedback

model_requests
usage_events
billing_events

leads
handoffs

api_keys
webhooks
webhook_deliveries

audit_logs
security_events
```

Every tenant-owned table should include:

```text
organization_id
created_at
updated_at
created_by
```

Use PostgreSQL row-level security as an additional defence, but do not rely on it as the only tenant boundary.

---

# 15. Suggested Technology Stack

Since you already work with Node.js and TypeScript:

## Frontend

```text
Next.js or TanStack Start
React
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query
```

## Backend

```text
NestJS
REST API initially
WebSocket or SSE for streaming
Zod for runtime schemas
BullMQ for background jobs
```

## Data

```text
PostgreSQL
Drizzle ORM or Prisma
pgvector initially
Redis
S3-compatible object storage
```

## AI orchestration

```text
AI SDK
Provider abstraction
OpenAI / Anthropic / Google / OpenRouter adapters
Custom MCP client gateway
```

AI SDK is designed as a TypeScript toolkit for AI applications across React, Next.js, Node.js and other frameworks, and includes chat, streaming and tool-calling facilities. ([AI SDK][6])

## Infrastructure

```text
Docker
AWS ECS/EKS, DigitalOcean, or a managed container service
CloudFront or Cloudflare CDN
AWS RDS PostgreSQL
ElastiCache Redis
S3
Sentry
OpenTelemetry
Grafana
```

For a first production release, avoid Kubernetes unless your team already has operational experience with it.

---

# 16. Recommended Repository Structure

```text
apps/
  dashboard/
  api/
  widget/
  hosted-chat/
  worker/

packages/
  ai-runtime/
  rag/
  mcp-client/
  tool-runtime/
  skill-engine/
  database/
  auth/
  billing/
  analytics/
  observability/
  security/
  shared-types/
  ui/

infrastructure/
  docker/
  terraform/
  monitoring/
```

Key runtime separation:

```text
dashboard
    Customer configuration UI

api
    Authentication and management APIs

chat-runtime
    Public high-traffic chatbot execution

worker
    Document processing, crawling and embeddings

widget
    Lightweight customer embed bundle
```

Do not serve public chatbot traffic through the same route group used by the admin dashboard.

---

# 17. API Design

Example management routes:

```http
POST   /v1/chatbots
GET    /v1/chatbots/:id
PATCH  /v1/chatbots/:id
POST   /v1/chatbots/:id/publish
POST   /v1/chatbots/:id/duplicate

POST   /v1/knowledge-bases
POST   /v1/knowledge-bases/:id/documents
POST   /v1/documents/:id/reindex

POST   /v1/mcp-servers
POST   /v1/mcp-servers/:id/test
GET    /v1/mcp-servers/:id/tools

POST   /v1/skills
POST   /v1/skills/:id/publish

GET    /v1/analytics/usage
GET    /v1/analytics/conversations
GET    /v1/analytics/quality
```

Public runtime routes:

```http
POST /chat/v1/session
POST /chat/v1/messages
GET  /chat/v1/conversations/:id/stream
POST /chat/v1/tool-confirmations/:id
POST /chat/v1/messages/:id/feedback
```

Use a versioned API from the beginning.

---

# 18. Security Requirements

Production minimum:

* Encrypt integration credentials
* Secret manager
* API-key hashing
* Short-lived widget session tokens
* Domain allowlist
* Rate limiting
* Bot-level quotas
* Organization-level quotas
* File malware scanning
* MIME validation
* Upload size limits
* SSRF protection for website crawling
* SSRF protection for MCP URLs
* SQL injection protection
* Prompt injection detection
* Output sanitization
* Markdown and HTML sanitization
* Audit logs
* Data deletion workflow
* Backup and restore
* Credential rotation
* Dependency scanning
* Content Security Policy
* Webhook signatures
* Idempotency keys

For MCP and custom API tools, block access to:

```text
localhost
127.0.0.0/8
private network ranges
cloud metadata endpoints
internal DNS names
file:// URLs
```

Otherwise, a customer-created MCP connection or crawler can become an SSRF path into your infrastructure.

---

# 19. Testing Studio

Before publishing, the customer should be able to test the chatbot.

Testing screen:

```text
Test message
Selected model
Final prompt
Retrieved chunks
Relevance scores
Selected skill
Tool calls
Tool inputs
Tool outputs
Tokens
Estimated cost
Latency
Warnings
```

Add test cases:

```ts
interface ChatbotTestCase {
  input: string;
  expectedBehaviour: string;
  requiredCitation?: boolean;
  allowedTools?: string[];
  forbiddenTools?: string[];
  expectedKeywords?: string[];
}
```

Run tests automatically when:

* System prompt changes
* Knowledge changes
* Tool schema changes
* Model changes
* Skill changes
* Chatbot is published

---

# 20. Publishing and Versioning

A published chatbot must use an immutable snapshot.

```text
Draft chatbot
     ↓
Validation
     ↓
Evaluation tests
     ↓
Publish
     ↓
Version 12 snapshot
     ↓
Production runtime
```

The runtime should not read partially edited draft settings.

Store published configuration:

```ts
interface PublishedChatbotSnapshot {
  chatbotId: string;
  version: number;
  configuration: object;
  checksum: string;
  publishedBy: string;
  publishedAt: Date;
}
```

Support:

* Draft
* Preview
* Publish
* Rollback
* Duplicate
* Environment promotion
* Version comparison

---

# 21. Billing Model

Possible pricing dimensions:

```text
Base monthly subscription
+ included messages
+ included tokens
+ knowledge storage
+ team seats
+ MCP connections
+ premium models
+ overage
```

Example plans:

```text
Starter
- 1 chatbot
- 2,000 messages
- 1 knowledge base
- Basic analytics

Professional
- 10 chatbots
- 25,000 messages
- MCP and custom tools
- Lead collection
- Advanced analytics

Enterprise
- Custom limits
- SSO
- Audit logs
- Private deployment
- Data residency
- SLA
```

Internally maintain both:

```text
provider_cost
customer_charge
```

This allows you to calculate margin accurately.

---

# 22. Build Phases

## Phase 1 — Foundation

Build:

* Authentication
* Organizations
* Team roles
* Chatbot CRUD
* System prompt
* Model configuration
* Hosted chatbot
* Basic widget
* Conversation persistence
* Token usage
* Basic analytics
* Publish and rollback

## Phase 2 — RAG

Build:

* Knowledge bases
* File uploads
* Background processing
* Embeddings
* Vector search
* Citations
* Website crawler
* Reindexing
* Retrieval debugger

## Phase 3 — Tools and MCP

Build:

* Internal tools
* HTTP API tools
* Tool schemas
* MCP connection manager
* Tool approval UI
* Tool execution logs
* Credential encryption
* Retry, timeout and idempotency handling

## Phase 4 — Skills

Build:

* Skill builder
* Skill triggers
* Multi-step execution
* Skill versions
* Structured output
* Skill test cases
* Human confirmation steps

## Phase 5 — Commercial features

Build:

* Stripe or Razorpay subscriptions
* Plan limits
* Usage alerts
* Overage
* Leads
* Human handoff
* Webhooks
* White-label domains
* Email reports

## Phase 6 — Enterprise

Build:

* SSO/SAML
* SCIM
* Audit exports
* Data retention
* Regional deployment
* Private networking
* Customer-managed keys
* Approval workflow
* SLA monitoring

---

# 23. What to Include in the First Production MVP

Your first sellable version should include:

```text
✓ Multi-tenant organizations
✓ Chatbot builder
✓ System prompt with versions
✓ Multiple model providers
✓ PDF, DOCX, text and website RAG
✓ Citations
✓ Custom HTTP tools
✓ MCP server connections
✓ Basic reusable skills
✓ Hosted chatbot URL
✓ iframe/JavaScript embed
✓ Domain restrictions
✓ Conversation history
✓ Token and cost tracking
✓ Usage limits
✓ Analytics
✓ Tool execution logs
✓ Feedback
✓ Lead capture
✓ Human handoff
✓ Publish and rollback
✓ Audit logs
✓ Rate limiting
✓ Subscription billing
```

Do not include these in the initial MVP unless required by a paying customer:

```text
Complex autonomous agents
Multi-agent orchestration
Voice calls
Marketplace
Native mobile apps
Kubernetes
Self-hosted enterprise edition
Fine-tuning
Visual workflow builder
```

---

# 24. Most Important Architectural Decision

Build the core around a provider-independent request object:

```ts
interface ChatExecutionRequest {
  organizationId: string;
  chatbotId: string;
  conversationId: string;
  userMessage: string;

  identity?: {
    externalUserId?: string;
    name?: string;
    email?: string;
  };

  context?: Record<string, unknown>;
}
```

And return a standard event stream:

```ts
type ChatRuntimeEvent =
  | { type: "message-start"; messageId: string }
  | { type: "text-delta"; value: string }
  | { type: "citation"; citation: Citation }
  | { type: "tool-start"; toolCallId: string; toolName: string }
  | { type: "tool-confirmation"; toolCallId: string; payload: unknown }
  | { type: "tool-result"; toolCallId: string; result: unknown }
  | { type: "usage"; usage: TokenUsage }
  | { type: "error"; code: string; message: string }
  | { type: "message-end"; messageId: string };
```

This prevents your widget, analytics, database and business logic from becoming tightly coupled to one AI provider.

# Recommended Final Architecture

```text
Customer Website
       |
       | iframe / widget SDK
       v
Public Chat Gateway
       |
       +--> Authentication and Domain Validation
       +--> Rate Limiter
       +--> Conversation Service
       |
       v
AI Orchestrator
       |
       +--> Prompt and Skill Engine
       +--> RAG Retrieval Service
       +--> Provider Router
       +--> Tool Runtime
       +--> MCP Gateway
       +--> Safety and Confirmation Layer
       |
       v
Streaming Response
       |
       +--> PostgreSQL
       +--> Vector Store
       +--> Redis
       +--> Object Storage
       +--> Usage and Billing
       +--> Traces and Analytics
```

The strongest first implementation for your background would be:

```text
Dashboard: Next.js or TanStack Start
Backend: NestJS
AI runtime: AI SDK
Database: PostgreSQL + Drizzle
Vector search: pgvector
Queue: BullMQ + Redis
Storage: S3
Widget: React iframe bundle
Observability: OpenTelemetry + Sentry + Langfuse
Deployment: Docker + managed container platform
```

The key missing features from your original idea were **multi-tenancy, publishing versions, domain security, tool approval, credential management, testing, observability, human handoff, lead collection, billing limits, audit logs, quality analytics, and provider independence**. These should be part of the architecture before calling it production-ready.

[1]: https://modelcontextprotocol.io/specification/2025-11-25?utm_source=chatgpt.com "Specification"
[2]: https://modelcontextprotocol.io/specification/draft/basic/authorization?utm_source=chatgpt.com "Authorization"
[3]: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling?utm_source=chatgpt.com "AI SDK Core: Tool Calling"
[4]: https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text?utm_source=chatgpt.com "AI SDK Core: streamText"
[5]: https://ai-sdk.dev/docs/ai-sdk-core/telemetry?utm_source=chatgpt.com "AI SDK Core: Telemetry"
[6]: https://ai-sdk.dev/docs/introduction?utm_source=chatgpt.com "AI SDK by Vercel"
