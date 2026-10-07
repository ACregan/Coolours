import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createServer } from "../../mcp/src/server";
import type { Route } from "./+types/mcp";

/**
 * The public MCP endpoint: POST https://coolours.perpetualsummer.ltd/mcp
 *
 * Runs the same server as mcp/src/index.ts (stdio), over Streamable HTTP in
 * stateless mode: each request gets a fresh server and transport, there are
 * no sessions, and responses are plain JSON rather than an SSE stream. The
 * tools are pure functions, so nothing needs to survive between requests.
 *
 * Rate limiting is done in nginx (vps-hosting), not here.
 */
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return methodNotAllowed();

  await logUsage(request.clone());

  const server = createServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(request);
}

// Stateless servers offer no SSE stream to GET, and no session to DELETE.
export function loader() {
  return methodNotAllowed();
}

function methodNotAllowed() {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { Allow: "POST" },
  });
}

type JsonRpcMessage = {
  method?: string;
  params?: {
    name?: string;
    arguments?: { colours?: unknown };
    clientInfo?: { name?: string; version?: string };
  };
};

/**
 * One line per connection and per tool call, to the PM2 logs. Records which
 * clients connect and which tools they use; never IPs or palette contents.
 */
async function logUsage(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return; // Malformed bodies are rejected by the transport
  }

  for (const message of (Array.isArray(body) ? body : [body]) as JsonRpcMessage[]) {
    if (message?.method === "initialize") {
      const client = message.params?.clientInfo;
      console.log(
        JSON.stringify({
          event: "mcp_initialize",
          client: client?.name,
          clientVersion: client?.version,
        }),
      );
    } else if (message?.method === "tools/call") {
      const colours = message.params?.arguments?.colours;
      console.log(
        JSON.stringify({
          event: "mcp_tool_call",
          tool: message.params?.name,
          ...(Array.isArray(colours) && { colours: colours.length }),
        }),
      );
    }
  }
}
