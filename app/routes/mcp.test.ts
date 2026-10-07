// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { action, loader } from "./mcp";

function mcpRequest(body: unknown, method = "POST") {
  return new Request("https://coolours.perpetualsummer.ltd/mcp", {
    method,
    headers: {
      "Content-Type": "application/json",
      // Streamable HTTP requires clients to accept both response types
      Accept: "application/json, text/event-stream",
      "MCP-Protocol-Version": "2025-06-18",
    },
    body: JSON.stringify(body),
  });
}

async function call(body: unknown) {
  const response = await action({ request: mcpRequest(body) } as never);
  return { status: response.status, json: await response.json() };
}

const initialize = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.2.3" },
  },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("/mcp", () => {
  it("completes the initialize handshake with instructions", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const { status, json } = await call(initialize);
    expect(status).toBe(200);
    expect(json.result.serverInfo.name).toBe("coolours");
    expect(json.result.instructions).toMatch(/create_palette_link/);
  });

  it("lists the tools without a prior initialize (stateless)", async () => {
    const { json } = await call({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
    });
    expect(
      json.result.tools.map((t: { name: string }) => t.name).sort(),
    ).toEqual(["create_palette_link", "export_palette", "parse_palette_link"]);
  });

  it("calls a tool", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const { json } = await call({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "create_palette_link",
        arguments: { colours: ["#2f3a40", "#252f34"], name: "Test" },
      },
    });
    expect(json.result.structuredContent).toMatchObject({
      url: "https://coolours.perpetualsummer.ltd/create/2F3A40-252F34?name=Test",
      colours: [
        { hex: "#2F3A40", name: "Outer Space Light" },
        { hex: "#252F34", name: "Outer Space Dark" },
      ],
    });
  });

  it("logs clients and tool calls, without palette contents", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await call(initialize);
    await call({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "create_palette_link",
        arguments: { colours: ["#000", "#fff"] },
      },
    });
    expect(log.mock.calls.map(([line]) => JSON.parse(line))).toEqual([
      {
        event: "mcp_initialize",
        client: "test-client",
        clientVersion: "1.2.3",
      },
      { event: "mcp_tool_call", tool: "create_palette_link", colours: 2 },
    ]);
  });

  it("answers GET with 405, as stateless servers offer no SSE stream", async () => {
    const response = loader();
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
  });

  it("answers DELETE with 405, as there are no sessions to end", async () => {
    const response = await action({
      request: new Request("https://coolours.perpetualsummer.ltd/mcp", {
        method: "DELETE",
      }),
    } as never);
    expect(response.status).toBe(405);
  });
});
