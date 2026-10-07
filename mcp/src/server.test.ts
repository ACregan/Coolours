import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { beforeAll, describe, expect, it } from "vitest";
import { version } from "../package.json";
import { createServer } from "./server.js";

// A real MCP client talking to the server over an in-memory transport:
// the same protocol a host like Claude Code speaks, minus the stdio pipe.
let client: Client;

beforeAll(async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await createServer().connect(serverTransport);
  client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(clientTransport);
});

describe("coolours MCP server", () => {
  it("reports the package version in the handshake", () => {
    expect(client.getServerVersion()).toEqual({ name: "coolours", version });
  });

  it("advertises its three tools", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "create_palette_link",
      "export_palette",
      "parse_palette_link",
    ]);
  });

  it("create_palette_link returns a URL and contrast data", async () => {
    const res = await client.callTool({
      name: "create_palette_link",
      arguments: { colours: ["#0f172a", "white", "rgb(56, 189, 248)"], name: "Test" },
    });
    expect(res.isError).toBeFalsy();
    expect(res.structuredContent).toMatchObject({
      url: "https://coolours.perpetualsummer.ltd/create/0F172A-FFFFFF-38BDF8?name=Test",
      hexes: ["#0F172A", "#FFFFFF", "#38BDF8"],
    });
    expect((res.structuredContent as { contrast: unknown[] }).contrast).toHaveLength(3);
  });

  it("returns a tool error (not a protocol error) for bad colours", async () => {
    const res = await client.callTool({
      name: "create_palette_link",
      arguments: { colours: ["#00000080"] },
    });
    expect(res.isError).toBe(true);
    expect(JSON.stringify(res.content)).toMatch(/alpha/);
  });

  it("parse_palette_link reads a link back", async () => {
    const res = await client.callTool({
      name: "parse_palette_link",
      arguments: {
        url: "https://coolours.perpetualsummer.ltd/create/0F172A-38BDF8?name=Ocean",
      },
    });
    expect(res.structuredContent).toMatchObject({
      hexes: ["#0F172A", "#38BDF8"],
      name: "Ocean",
      ignored: [],
    });
  });

  it("export_palette returns CSS", async () => {
    const res = await client.callTool({
      name: "export_palette",
      arguments: { colours: ["#000000"], format: "css" },
    });
    expect(res.structuredContent).toEqual({ code: "--black: #000000;\n" });
  });
});
