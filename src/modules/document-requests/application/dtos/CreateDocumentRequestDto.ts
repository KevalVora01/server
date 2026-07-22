export interface CreateDocumentRequestDto {
  documentType: string;
  customDocumentName?: string | null;
  note?: string | null;
}
