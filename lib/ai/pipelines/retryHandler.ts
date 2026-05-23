import { AIRuntimeRegistry } from "../registry";
import { AIAuthenticationError, AIProviderError } from "../errors";

/**
 * Executes an AI or OCR action with retry logic and fallback mechanisms.
 * Supports 1 fast exponential backoff retry (e.g. 500ms initial delay) before
 * triggering the provider fallback.
 */
export async function withResilience<T>(
  action: () => Promise<T>,
  providerId: string,
  fallbackAction?: () => Promise<T>,
  retries = 1,
  delayMs = 500
): Promise<{ result: T; retriesTriggered: number; fallbackTriggered: boolean }> {
  let attempt = 0;
  const maxAttempts = retries + 1;
  let currentDelay = delayMs;

  while (attempt < maxAttempts) {
    try {
      const result = await action();
      
      // On success, report to registry to reset failure tracking
      AIRuntimeRegistry.reportSuccess(providerId);

      return {
        result,
        retriesTriggered: attempt,
        fallbackTriggered: false
      };
    } catch (error: unknown) {
      attempt++;
      
      // Report failure to health registry
      AIRuntimeRegistry.reportFailure(providerId);

      // Check if we should fail fast (e.g., authentication errors are not retried)
      const isAuthError = error instanceof AIAuthenticationError;
      const errMsg = error instanceof Error ? error.message : String(error);
      
      // If we have retries left and it is not an auth error, sleep and retry
      if (attempt < maxAttempts && !isAuthError) {
        console.warn(
          `AI Provider [${providerId}] failed (Attempt ${attempt}/${maxAttempts}). Retrying in ${currentDelay}ms... Error: ${errMsg}`
        );
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
        currentDelay *= 2; // Exponential backoff
        continue;
      }

      // If attempts exhausted or auth error, try fallback
      if (fallbackAction) {
        console.warn(
          `AI Provider [${providerId}] exhausted all attempts. Triggering fallback provider execution...`
        );
        try {
          const fallbackRes = await fallbackAction();
          return {
            result: fallbackRes,
            retriesTriggered: attempt - 1,
            fallbackTriggered: true
          };
        } catch (fallbackError: unknown) {
          const fallbackErrMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
          console.error(
            `Fallback provider execution also failed. Error: ${fallbackErrMsg}`
          );
          throw fallbackError;
        }
      }

      // No fallback action, rethrow the original or last error
      throw error;
    }
  }

  throw new AIProviderError("Exhausted resilience retries with no output.", providerId);
}
