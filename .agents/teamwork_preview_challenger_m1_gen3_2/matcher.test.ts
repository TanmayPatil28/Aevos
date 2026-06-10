import { matchInternshipsForProfile } from "../../lib/jobs/matcher";
import { jest } from "@jest/globals";
import * as aiModule from "ai";
import * as tavilyModule from "@tavily/core";

// We'll capture the last query made to tavily
let lastTavilyQuery = "";

jest.mock("@tavily/core", () => ({
  tavily: () => ({
    search: jest.fn(async (query: string) => {
      lastTavilyQuery = query;
      return { results: [{ title: "Test Intern", url: "http://test", content: "Test" }] };
    })
  })
}));

jest.mock("ai", () => ({
  generateObject: jest.fn(async () => {
    return {
      object: {
        matches: [
          {
            title: "Test Intern",
            company: "Test Co",
            url: "http://test",
            score: 95,
            rationale: "Good match"
          }
        ]
      }
    };
  })
}));

describe("matchInternshipsForProfile", () => {
  beforeEach(() => {
    lastTavilyQuery = "";
  });

  it("handles undefined profile", async () => {
    const result = await matchInternshipsForProfile(undefined);
    expect(lastTavilyQuery).toBe("software engineering tech internships summer");
    expect(result.length).toBe(1);
  });

  it("handles empty profile", async () => {
    const result = await matchInternshipsForProfile({});
    expect(lastTavilyQuery).toBe("software engineering tech internships summer");
  });

  it("uses programme and branch when available", async () => {
    await matchInternshipsForProfile({
      academic: {
        programme: "B.Tech",
        branch: "Computer Science"
      }
    });
    expect(lastTavilyQuery).toBe("Computer Science B.Tech internships summer");
  });

  it("handles missing branch with programme", async () => {
    await matchInternshipsForProfile({
      academic: {
        programme: "B.Tech",
      }
    });
    expect(lastTavilyQuery).toBe("B.Tech internships summer");
  });

  it("handles missing programme with branch", async () => {
    await matchInternshipsForProfile({
      academic: {
        branch: "Mechanical",
      }
    });
    expect(lastTavilyQuery).toBe("Mechanical internships summer");
  });

  it("uses major and skills when academic info is missing", async () => {
    await matchInternshipsForProfile({
      major: "Data Science",
      skills: ["Python", "SQL", "Machine Learning"]
    });
    expect(lastTavilyQuery).toBe("Data Science Python SQL internships summer");
  });
});
