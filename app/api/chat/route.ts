export async function POST(req: Request) {
  return new Response(
    JSON.stringify({
      error: "Gone",
      message: "The /api/chat endpoint is deprecated. Please use /api/jarvis/v2 instead."
    }),
    {
      status: 410,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
