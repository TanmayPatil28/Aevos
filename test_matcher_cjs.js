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

// Now register ts-node so we can require the TS file
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: "commonjs", moduleResolution: "node", esModuleInterop: true }
});

const { matchInternshipsForProfile } = require('./lib/jobs/matcher');

async function runTests() {
  const tests = [
    {
      name: "Fallback to default",
      input: {},
      expectedQuery: "software engineering tech internships summer"
    },
    {
      name: "Uses programme and branch",
      input: { academic: { programme: "B.Tech", branch: "CSE" } },
      expectedQuery: "CSE B.Tech internships summer"
    },
    {
      name: "Uses only branch",
      input: { academic: { branch: "Computer Science" } },
      expectedQuery: "Computer Science  internships summer"
    },
    {
      name: "Uses major and skills",
      input: { major: "CS", skills: ["React", "Node", "TypeScript"] },
      expectedQuery: "CS React Node internships summer"
    },
    {
      name: "Empty arrays and strings fallback",
      input: { academic: { programme: "", branch: "" }, major: "", skills: [] },
      expectedQuery: "software engineering tech internships summer"
    },
    {
      name: "Skills but no major",
      input: { skills: ["React", "Node"] },
      expectedQuery: "software engineering tech internships summer"
    },
    {
      name: "Major but no skills",
      input: { major: "CS" },
      expectedQuery: "software engineering tech internships summer"
    }
  ];

  let passed = true;
  for (const t of tests) {
    capturedQuery = "";
    try {
      await matchInternshipsForProfile(t.input);
      if (capturedQuery !== t.expectedQuery) {
        console.error(`❌ Test failed: ${t.name}`);
        console.error(`Expected query: "${t.expectedQuery}"`);
        console.error(`Actual query: "${capturedQuery}"`);
        passed = false;
      } else {
        console.log(`✅ Test passed: ${t.name} (Query: "${capturedQuery}")`);
      }
    } catch (e) {
        console.error(`❌ Test failed with exception: ${t.name}`, e);
        passed = false;
    }
  }
  
  if (passed) {
    console.log("ALL TESTS PASSED");
    process.exit(0);
  } else {
    console.log("SOME TESTS FAILED");
    process.exit(1);
  }
}

runTests();
