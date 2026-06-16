const { SqliteMem0Adapter } = require('mem0-mcp');
const adapter = SqliteMem0Adapter.fromEnv();

adapter.healthCheck().then(health => {
  console.log('Health check result:', health);
}).catch(err => {
  console.error('Error running health check:', err);
});
