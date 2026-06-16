import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { ModelArmorClient } from "@google-cloud/modelarmor";

let client: ModelArmorClient | null = null;
let initError: Error | null = null;

const projectId = process.env.GCP_PROJECT_ID;
const apiKey = process.env.GCP_API_KEY;

const isPlaceholder = (val?: string) => !val || val === "placeholder_project" || val === "placeholder_key" || val.includes("placeholder");

if (isPlaceholder(projectId) || isPlaceholder(apiKey)) {
  initError = new Error("GCP Model Armor credentials are not configured or are using placeholders.");
} else {
  try {
    client = new ModelArmorClient({
      projectId,
      apiKey,
    });
  } catch (error: any) {
    initError = error;
  }
}

const server = new Server(
  {
    name: "modelarmor",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const tools = [
  {
    name: "sanitize_user_prompt",
    description: "Sanitize a user prompt for safety (prompt injection, toxic content, PII, etc.) using GCP Model Armor.",
    inputSchema: {
      type: "object",
      properties: {
        templateName: {
          type: "string",
          description: "GCP Model Armor template resource name, e.g. projects/PROJECT_ID/locations/LOCATION/templates/TEMPLATE_ID",
        },
        text: {
          type: "string",
          description: "The prompt text to sanitize.",
        },
      },
      required: ["templateName", "text"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "sanitize_user_prompt") {
    if (initError || !client) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Model Armor is not initialized: ${initError?.message || "Missing client"}. Please configure valid GCP_PROJECT_ID and GCP_API_KEY.`,
          },
        ],
      };
    }

    const { templateName, text } = args as { templateName: string; text: string };
    try {
      const [response] = await client.sanitizeUserPrompt({
        name: templateName,
        userPromptData: {
          text: text,
        },
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `GCP Model Armor API error: ${error.message}`,
          },
        ],
      };
    }
  }
  throw new Error(`Tool not found: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in Model Armor MCP server:", error);
  process.exit(1);
});
