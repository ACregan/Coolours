# Coolours!

A colour palette selection tool built for fun by [Anthony Cregan](https://www.anthonycregan.co.uk/)

## Live Site

Visit [Coolours.perpetualsummer.ltd](https://coolours.perpetualsummer.ltd/)

## Development

Built with [React Router](https://reactrouter.com/) (framework mode, SSR).

```bash
npm install
npm run dev        # dev server with HMR at http://localhost:5173
npm test           # vitest
npm run typecheck
npm run build
```

## Deployment

The manual `deploy` job in GitLab CI SSHes to the VPS and runs `~/server/deploy.sh coolours.perpetualsummer.ltd`. That script pulls this repo into a checkout on the VPS, runs `npm install` and `npm run build`, then restarts the PM2 process serving `build/` on port 3007. See the `vps-hosting` repo.

## MCP server

[`mcp/`](mcp/) is an MCP server that lets AI agents open the palettes they design in Coolours. It has its own `package.json` and is not part of the site build or deploy. See [mcp/README.md](mcp/README.md).

Palette links (`/create/RRGGBB-RRGGBB?name=...`) are a public contract: agents build them through the MCP server. Don't change the `create/:swatches?` route or `generateUrlPath` without checking `mcp/`.
