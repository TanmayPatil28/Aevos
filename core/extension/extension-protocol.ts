/**
 * core/extension/extension-protocol.ts
 *
 * Types and abstractions for the Browser Extension interoperability layer.
 *
 * CRITICAL DIRECTIVE: The extension must remain consent-based.
 * It does NOT scrape silently. It acts as an authorized bridge between
 * the university DOM and the GradeFlow application.
 */

export type ExtensionMessageType =
  | 'PING'
  | 'REQUEST_CONSENT'
  | 'CONSENT_GRANTED'
  | 'CONSENT_DENIED'
  | 'EXTRACT_ATTENDANCE'
  | 'EXTRACT_RESULTS'
  | 'EXTRACTION_COMPLETE'
  | 'EXTRACTION_FAILED';

export interface ExtensionMessage<T extends ExtensionMessageType = ExtensionMessageType> {
  readonly type: T;
  readonly payload: unknown;
  readonly timestamp: number;
}

export interface ConsentPayload {
  readonly requestedDataTypes: readonly string[];
  readonly purpose: string;
  readonly sessionDurationMinutes: number;
}

export interface ExtractionResultPayload {
  readonly dataType: string;
  readonly data: unknown;
  readonly url: string;
}

/**
 * Interface for the web application to communicate with the extension.
 */
export interface ExtensionBridge {
  /** Check if the extension is installed and active */
  ping(): Promise<boolean>;

  /** Request explicit user consent for extraction */
  requestConsent(payload: ConsentPayload): Promise<boolean>;

  /** Dispatch an extraction command to the extension */
  extract(dataType: string): Promise<ExtractionResultPayload>;
}
