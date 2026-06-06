import { AcademicDocumentParser, ParsedAcademicDocument, DocumentMetadata } from "./types";
import { SppuDocumentParser } from "./rules/sppu";
import { VtuDocumentParser } from "./rules/vtu";
import { JntuhDocumentParser } from "./rules/jntuh";
import { JspmDocumentParser } from "./rules/jspm";

class DocumentParserRegistry {
  private parsers: AcademicDocumentParser[] = [];

  constructor() {
    // Register default parsers
    this.register(new SppuDocumentParser());
    this.register(new VtuDocumentParser());
    this.register(new JntuhDocumentParser());
    this.register(new JspmDocumentParser());
  }

  register(parser: AcademicDocumentParser): void {
    this.parsers.push(parser);
  }

  getParser(presetId: string): AcademicDocumentParser | undefined {
    return this.parsers.find((p) => p.supports(presetId));
  }

  parseDocument(rawText: string, presetId: string, metadata?: DocumentMetadata): ParsedAcademicDocument {
    const parser = this.getParser(presetId);
    if (!parser) {
      throw new Error(`Unsupported presetId: No document parser registered for preset '${presetId}'`);
    }
    return parser.parse(rawText, metadata);
  }
}

export const documentParserRegistry = new DocumentParserRegistry();
export { SppuDocumentParser } from "./rules/sppu";
export { VtuDocumentParser } from "./rules/vtu";
export { JntuhDocumentParser } from "./rules/jntuh";
export { JspmDocumentParser } from "./rules/jspm";
export * from "./types";
