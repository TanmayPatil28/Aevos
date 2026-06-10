const Module = require('module');
const originalLoad = Module._load;

let capturedQuery = "";

Module._load = function (request, parent, isMain) {
  if (request === '@tavily/core') {
    return {
      tavily: (args) => ({
        search: async (query, options) => {
          capturedQuery = query;
          return { results: [{ title: "Mock Title", company: "Mock Company", url: "Mock URL" }] };
        }
      })
    };
  }
  if (request === 'ai') {
    return {
      generateObject: async () => ({
        object: { matches: [{ title: "Mock Title", company: "Mock Company", url: "Mock URL", score: 100, rationale: "Mock Rationale" }] }
      })
    };
  }
  if (request === '@ai-sdk/google') {
    return {
      createGoogleGenerativeAI: () => () => ({})
    };
  }
  if (request === '../ai/keys') {
    return {
      getTavilyKey: () => 'mock',
      getGeminiKey: () => 'mock'
    };
  }
  return originalLoad.apply(this, arguments);
};

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: "commonjs", moduleResolution: "node", esModuleInterop: true }
});

const { matchInternshipsForProfile } = require('./lib/jobs/matcher');

async function runTests() {
  const tests = [
    {
      name: "Skills is string instead of array",
      input: { major: "CS", skills: "React Node TypeScript" },
      expectedQuery: "CS React Node internships summer" // Or it might crash!
    }
  ];

  for (const t of tests) {
    capturedQuery = "";
    try {
      await matchInternshipsForProfile(t.input);
      console.log(`Query: ${capturedQuery}`);
    } catch (e) {
      console.error(`Crash: ${e.message}`);
    }
  }
}

runTests();
