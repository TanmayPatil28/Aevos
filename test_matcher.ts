import { matchInternshipsForProfile } from "./lib/jobs/matcher";
import { tavily } from "@tavily/core";

console.log("Mocking tavily...");
const mockQueries: string[] = [];

// Since we cannot easily intercept without a mock library, maybe we can just run it
// and see if it fails, or we can use a library like 'proxyquire' or module replacement.

// Actually, wait, let's just write a test that checks if matchInternshipsForProfile throws 
// when we don't have API keys, or if it handles things properly.
