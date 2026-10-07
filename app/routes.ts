import {
  type RouteConfig,
  layout,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  layout("./layouts/core/core-layout.tsx", [
    index("./routes/home/home.tsx"),
    route("create/:swatches?", "./routes/create/create.tsx"),
  ]),
  // MCP endpoint for AI agents (resource route, no UI)
  route("mcp", "./routes/mcp.ts"),
] satisfies RouteConfig;
