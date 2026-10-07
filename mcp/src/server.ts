import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { version } from "../package.json";
import {
  buildPaletteUrl,
  contrastPairs,
  exportCss,
  exportJs,
  parseColour,
  parsePaletteUrl,
} from "./colour.js";

const colourList = z
  .array(z.string())
  .min(1)
  .max(20)
  .describe(
    'Colours in display order. Hex ("#1E293B", "#abc"), rgb() or CSS colour names. No transparency.',
  );

const contrastPairShape = z.object({
  foreground: z.string(),
  background: z.string(),
  ratio: z.number(),
  wcag: z.enum(["AAA", "AA", "AA large", "fail"]),
});

/**
 * Text content is kept alongside structuredContent so that clients which
 * don't read structured output still get the full result.
 */
function result<T extends Record<string, unknown>>(data: T) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

function toolError(error: unknown) {
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: error instanceof Error ? error.message : String(error),
      },
    ],
  };
}

/**
 * Sent in the initialize handshake. Hosts put this in the system prompt even
 * when they defer tool definitions (Claude Code does, once many tools are
 * installed), so it's how the model learns these tools exist before it would
 * think to search for them. It costs tokens in every session: keep it short.
 */
const instructions = [
  "Coolours (coolours.perpetualsummer.ltd) previews and edits colour palettes.",
  "Whenever you design, suggest or change a colour palette, scheme or theme colours, call create_palette_link",
  "with the colours and always give the user the returned URL, alongside anything else you produce,",
  "so they can preview and tweak the palette. Use its contrast ratios rather than calculating them yourself.",
  "When the user shares a coolours.perpetualsummer.ltd/create/... URL, call parse_palette_link to read it.",
].join(" ");

export function createServer() {
  const server = new McpServer({ name: "coolours", version }, { instructions });

  server.registerTool(
    "create_palette_link",
    {
      title: "Create Coolours palette link",
      description: [
        "Turn a colour palette you have chosen into a link that opens it in Coolours",
        "(coolours.perpetualsummer.ltd), where the user can preview the swatches, tweak them and export them.",
        "Use this whenever you propose a colour scheme, so the user can see it rather than read hex codes.",
        "Also returns WCAG contrast ratios for every pair of colours: check them before recommending",
        "a text/background pairing (4.5 or more for body text, 3 or more for large text and UI components).",
        "Give the user the URL.",
      ].join(" "),
      inputSchema: {
        colours: colourList,
        name: z
          .string()
          .max(100)
          .optional()
          .describe('Palette name shown on the site, e.g. "Fintech Dark"'),
      },
      outputSchema: {
        url: z.string(),
        hexes: z.array(z.string()),
        contrast: z.array(contrastPairShape),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ colours, name }) => {
      try {
        const hexes = colours.map(parseColour);
        return result({
          url: buildPaletteUrl(hexes, name),
          hexes: hexes.map((hex) => `#${hex}`),
          contrast: contrastPairs(hexes),
        });
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "parse_palette_link",
    {
      title: "Read Coolours palette link",
      description: [
        "Read the colours and name back out of a Coolours link",
        "(coolours.perpetualsummer.ltd/create/...). Use this when the user pastes a Coolours URL,",
        "for example after editing a palette on the site, so you can apply their changes.",
      ].join(" "),
      inputSchema: {
        url: z.string().describe("The full Coolours URL"),
      },
      outputSchema: {
        hexes: z.array(z.string()),
        name: z.string().optional(),
        ignored: z
          .array(z.string())
          .describe("URL segments that are not valid swatches; the site ignores these too"),
        contrast: z.array(contrastPairShape),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ url }) => {
      try {
        const { hexes, name, ignored } = parsePaletteUrl(url);
        return result({
          hexes: hexes.map((hex) => `#${hex}`),
          ...(name !== undefined && { name }),
          ignored,
          contrast: contrastPairs(hexes),
        });
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "export_palette",
    {
      title: "Export palette as code",
      description: [
        "Export a palette as CSS custom properties or a JavaScript object, with each colour named",
        "after its nearest named colour. Output matches Coolours' own Export feature.",
        "Rename the variables to semantic names (--color-primary etc.) if the codebase uses them.",
      ].join(" "),
      inputSchema: {
        colours: colourList,
        format: z.enum(["css", "js"]),
      },
      outputSchema: {
        code: z.string(),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ colours, format }) => {
      try {
        const hexes = colours.map(parseColour);
        return result({ code: format === "css" ? exportCss(hexes) : exportJs(hexes) });
      } catch (error) {
        return toolError(error);
      }
    },
  );

  return server;
}
