#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
export const startStdio = async (server) => {
    const transport = new StdioServerTransport();
    await server.connect(transport);
};
