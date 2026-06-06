export class AIProviderError extends Error {
  constructor(
    message: string,
    public providerId: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = "AIProviderError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AIRateLimitError extends AIProviderError {
  constructor(message: string, providerId: string, cause?: unknown) {
    super(message, providerId, cause);
    this.name = "AIRateLimitError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AITimeoutError extends AIProviderError {
  constructor(message: string, providerId: string, cause?: unknown) {
    super(message, providerId, cause);
    this.name = "AITimeoutError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AIAuthenticationError extends AIProviderError {
  constructor(message: string, providerId: string, cause?: unknown) {
    super(message, providerId, cause);
    this.name = "AIAuthenticationError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AIValidationError extends Error {
  constructor(
    message: string,
    public providerId: string,
    public schemaErrors?: string[]
  ) {
    super(message);
    this.name = "AIValidationError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
