# coolours-mcp

An [MCP](https://modelcontextprotocol.io) server that lets AI agents show colour palettes in [Coolours](https://coolours.perpetualsummer.ltd).

When you ask an agent for a colour scheme, it picks the colours and calls this server. You get back a link that opens the palette in Coolours, plus WCAG contrast ratios for every pair of colours.

## Tools

| Tool | What it does |
| ---- | ------------ |
| `create_palette_link` | Turns colours (hex, `rgb()`, CSS names) into a Coolours URL. Returns each colour's Coolours name and a contrast ratio for every pair |
| `parse_palette_link` | Reads a Coolours URL back into colours, for example after you've edited the palette on the site |
| `export_palette` | Outputs the palette as CSS custom properties or a JS object, identical to the site's Export feature |

Colours with transparency are rejected, because Coolours has no alpha channel.

## Use with Claude Code

From the repo root:

```sh
npm install                 # the server imports the site's app/utilities
npm install --prefix mcp
npm run build --prefix mcp
claude mcp add coolours -- node /absolute/path/to/coolour/mcp/dist/index.js
```

Then ask: *"Design a dark-mode palette for a fintech dashboard and show it to me in Coolours."*

## Develop

```sh
npm test            # unit tests, plus an in-memory MCP client/server test
npm run typecheck
npm run inspect     # build, then open the MCP Inspector to call the tools by hand
```

- `src/colour.ts` holds the colour logic, with no MCP code. URL building, URL validation and exports come straight from the site's `app/utilities/utilities.ts`, so they can't drift from the site.
- `src/server.ts` registers the tools. Their descriptions are what agents read to decide when to call them.
- `src/index.ts` connects the server to stdio.

esbuild bundles everything, including the site code and its copy of `hex-color-to-color-name`, into one self-contained `dist/index.js`. That library is deliberately not a dependency of `mcp/`: it resolves to the site's installed copy, so the colour names the tools return are exactly the ones the site shows on its swatches.
