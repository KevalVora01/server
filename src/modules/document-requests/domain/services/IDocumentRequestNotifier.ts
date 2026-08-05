import { DocumentRequest } from "../entities/DocumentRequest";

export interface IDocumentRequestNotifier {
  notifyCreated(request: DocumentRequest): Promise<void>;
  notifyStatusChanged(request: DocumentRequest, oldStatus?: string): Promise<void>;
}
