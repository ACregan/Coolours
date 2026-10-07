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

## Use it

The public server is `https://coolours.perpetualsummer.ltd/mcp` (Streamable HTTP, stateless). In Claude Code:

```sh
claude mcp add --transport http coolours https://coolours.perpetualsummer.ltd/mcp
```

The site's header MCP button has instructions for other clients.

## Run it locally (stdio)

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
- `src/index.ts` connects the server to stdio. The site's `app/routes/mcp.ts` connects the same `createServer()` to HTTP.

esbuild bundles everything, including the site code and its copy of `hex-color-to-color-name`, into one self-contained `dist/index.js`. That library is deliberately not a dependency of `mcp/`: it resolves to the site's installed copy, so the colour names the tools return are exactly the ones the site shows on its swatches.

## Listing in the MCP Registry

[`server.json`](server.json) describes the public server, including its icons (the site's favicons, the same ones the server sends in its handshake), for the official [MCP Registry](https://registry.modelcontextprotocol.io) as `ltd.perpetualsummer/coolours`. A test keeps its version and URL in step with the code. When you change the server, bump the version in both `package.json` and `server.json`, then publish again.

Publishing proves you own perpetualsummer.ltd with a DNS record. The first time:

1. Install `mcp-publisher`, the registry's official tool (a Go binary from its GitHub releases). **Don't `npm install mcp-publisher`**: that npm package is an unrelated third-party project.
   ```sh
   curl -L "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" | tar xz mcp-publisher && sudo mv mcp-publisher /usr/local/bin/
   ```
2. Make a key pair **outside this repo**, and keep `key.pem` private:
   ```sh
   openssl genpkey -algorithm Ed25519 -out ~/mcp-registry-key.pem
   echo "v=MCPv1; k=ed25519; p=$(openssl pkey -in ~/mcp-registry-key.pem -pubout -outform DER | tail -c 32 | base64)"
   ```
3. Add the printed line as a **TXT record on `perpetualsummer.ltd` itself**, not on a subdomain, and wait for it to propagate (`dig +short TXT perpetualsummer.ltd`).
4. Log in and publish, from `mcp/`:
   ```sh
   mcp-publisher login dns --domain perpetualsummer.ltd --private-key "$(openssl pkey -in ~/mcp-registry-key.pem -noout -text | grep -A3 'priv:' | tail -n +2 | tr -d ' :\n')"
   mcp-publisher publish
   ```

Later versions only need step 4. Check the listing at `https://registry.modelcontextprotocol.io/v0/servers?search=ltd.perpetualsummer/coolours`.
