import { tavily } from "@tavily/core";
import { getTavilyKey } from "../ai/keys";

async function testTavily() {
  const tvly = tavily({ apiKey: getTavilyKey() });
  const response = await tvly.search("software engineering internship summer 2027", {
    searchDepth: "advanced",
    limit: 5,
  });
  console.log(response.results);
}
testTavily();
