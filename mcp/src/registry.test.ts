import { describe, expect, it } from "vitest";
import serverJson from "../server.json";
import packageJson from "../package.json";
import { COOLOURS_ORIGIN } from "./colour.js";

// server.json is what the official MCP Registry lists (see README). Keep it
// in step with the server it describes.
describe("server.json (MCP Registry listing)", () => {
  it("has the same version as the server", () => {
    expect(serverJson.version).toBe(packageJson.version);
  });

  it("points at the public endpoint", () => {
    expect(serverJson.remotes).toEqual([
      { type: "streamable-http", url: `${COOLOURS_ORIGIN}/mcp` },
    ]);
  });

  it("fits the registry's 100-character description limit", () => {
    expect(serverJson.description.length).toBeLessThanOrEqual(100);
  });

  it("uses the reverse-DNS namespace of perpetualsummer.ltd", () => {
    expect(serverJson.name).toBe("ltd.perpetualsummer/coolours");
  });
});
