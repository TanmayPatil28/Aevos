import * as fs from 'fs';
import * as path from 'path';

const matcherPath = path.join(__dirname, '../../lib/jobs/matcher.ts');
let matcherCode = fs.readFileSync(matcherPath, 'utf8');

// Replace the imports and network calls with our own mock implementations
matcherCode = matcherCode.replace(/import \{ tavily \} from "@tavily\/core";/, '');
matcherCode = matcherCode.replace(/import \{ generateObject \} from "ai";/, '');
matcherCode = matcherCode.replace(/import \{ createGoogleGenerativeAI \} from "@ai-sdk\/google";/, '');
matcherCode = matcherCode.replace(/import \{ z \} from "zod";/, 'const z = { object: () => ({}), array: () => ({}), string: () => ({ describe: () => ({}) }), number: () => ({ describe: () => ({}) }) };');
matcherCode = matcherCode.replace(/import \{ getTavilyKey, getGeminiKey \} from "\.\.\/ai\/keys";/, 'const getTavilyKey = () => "fake"; const getGeminiKey = () => "fake";');

// Mock tavily
matcherCode = `
let lastQuery = "";
const tavily = () => ({
  search: async (query) => {
    lastQuery = query;
    return { results: [] };
  }
});
const createGoogleGenerativeAI = () => () => "fake-model";
const generateObject = async () => {
  return { object: { matches: [{ title: "Mock", score: 100 }] } };
};

export const getLastQuery = () => lastQuery;
export const resetQuery = () => { lastQuery = ""; };

` + matcherCode;

const outPath = path.join(__dirname, 'matcher-mocked.ts');
fs.writeFileSync(outPath, matcherCode);
console.log("Mock created at", outPath);
