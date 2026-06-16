import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface McpServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

interface McpConfig {
  mcpServers: Record<string, McpServerConfig>;
}

const configPath = path.resolve('C:\\Users\\Tanmay\\.gemini\\config\\mcp_config.json');

async function runDryRun(name: string, config: McpServerConfig): Promise<{ success: boolean; reason?: string }> {
  return new Promise((resolve) => {
    console.log(`\nChecking server "${name}"...`);
    console.log(`Command: ${config.command} ${config.args.join(' ')}`);

    const spawnEnv = {
      ...process.env,
      ...(config.env || {}),
    };

    // On Windows, commands like npx or mcp-server-browserbase may need { shell: true } to launch successfully
    const child = spawn(config.command, config.args, {
      shell: true,
      env: spawnEnv,
      stdio: 'pipe',
    });

    let stderrData = '';
    let stdoutData = '';

    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    let finished = false;

    const timeout = setTimeout(() => {
      if (finished) return;
      finished = true;
      child.kill(); // Kill the server since it's running fine and hasn't exited

      // If it ran for 3 seconds without exiting, it launched successfully!
      resolve({ success: true });
    }, 3000);

    child.on('error', (err) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      resolve({ success: false, reason: `Spawn error: ${err.message}` });
    });

    child.on('exit', (code, signal) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);

      resolve({
        success: false,
        reason: `Process exited prematurely before timeout with code ${code} (signal ${signal}). Output:\n${stderrData || stdoutData || 'No output'}`,
      });
    });
  });
}

async function main() {
  if (!fs.existsSync(configPath)) {
    console.error(`Error: Config file not found at ${configPath}`);
    process.exit(1);
  }

  const rawConfig = fs.readFileSync(configPath, 'utf8');
  let config: McpConfig;
  try {
    config = JSON.parse(rawConfig);
  } catch (err: any) {
    console.error(`Error parsing config JSON: ${err.message}`);
    process.exit(1);
  }

  const servers = config.mcpServers;
  if (!servers || typeof servers !== 'object') {
    console.error('Error: mcpServers not found in config');
    process.exit(1);
  }

  const serverNames = Object.keys(servers);
  console.log(`Found ${serverNames.length} MCP servers in config.`);

  let allSuccess = true;
  const results: Record<string, { success: boolean; reason?: string }> = {};

  for (const name of serverNames) {
    const res = await runDryRun(name, servers[name]);
    results[name] = res;
    if (!res.success) {
      allSuccess = false;
      console.log(`❌ "${name}" failed: ${res.reason}`);
    } else {
      console.log(`✅ "${name}" passed dry-run.`);
    }
  }

  console.log('\n--- VERIFICATION SUMMARY ---');
  for (const name of serverNames) {
    const res = results[name];
    console.log(`${res.success ? '✅' : '❌'} ${name}: ${res.success ? 'PASSED' : 'FAILED (' + (res.reason || '') + ')'}`);
  }

  if (allSuccess) {
    console.log('\nAll MCP configs verified successfully!');
    process.exit(0);
  } else {
    console.error('\nSome MCP configs failed dry-run checks.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error in verify-mcp-configs:', err);
  process.exit(1);
});
