import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { getMcpTools } from "@coinbase/agentkit-model-context-protocol";
import { AgentKit } from "@coinbase/agentkit";

let tools: any[] = [];
let toolHandler: any = null;
let initError: Error | null = null;

const cdpApiKeyName = process.env.CDP_API_KEY_NAME;
const cdpApiKeyPrivateKey = process.env.CDP_API_KEY_PRIVATE_KEY;

const isPlaceholder = (val?: string) => !val || val === "placeholder_name" || val === "placeholder_key" || val.includes("placeholder");

async function initAgentKit() {
  if (isPlaceholder(cdpApiKeyName) || isPlaceholder(cdpApiKeyPrivateKey)) {
    initError = new Error("CDP API credentials are not configured or are using placeholders.");
  } else {
    try {
      const agentKit = await AgentKit.from({
        cdpApiKeyName,
        cdpApiKeyPrivateKey,
      });
      const mcp = await getMcpTools(agentKit);
      tools = mcp.tools;
      toolHandler = mcp.toolHandler;
    } catch (error: any) {
      initError = error;
    }
  }
}

const server = new Server(
  {
    name: "agentkit",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  if (initError) {
    console.error("Initialization Error: ", initError.message);
    return {
      tools: [
        {
          name: "agentkit_status",
          description: "Check the initialization status of AgentKit",
          inputSchema: { type: "object", properties: {} },
        }
      ],
    };
  }
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (initError) {
    if (request.params.name === "agentkit_status") {
      return {
        content: [
          {
            type: "text",
            text: `AgentKit initialization failed: ${initError.message}. Please configure valid CDP_API_KEY_NAME and CDP_API_KEY_PRIVATE_KEY.`,
          },
        ],
      };
    }
    throw new Error(`AgentKit not initialized: ${initError.message}`);
  }

  try {
    return await toolHandler(request.params.name, request.params.arguments);
  } catch (error) {
    throw new Error(`Tool ${request.params.name} failed: ${error}`);
  }
});

async function main() {
  await initAgentKit();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in AgentKit MCP server:", error);
  process.exit(1);
});
