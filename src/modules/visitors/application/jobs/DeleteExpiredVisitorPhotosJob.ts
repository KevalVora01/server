import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { CloudinaryService } from "../../../../shared/services/CloudinaryService";

const RETENTION_DAYS = 30;

export class DeleteExpiredVisitorPhotosJob {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(): Promise<void> {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const expired = await this.visitorRepository.findAllWithExpiredPhotos(cutoff);

    for (const visitor of expired) {
      if (visitor.photoUrl) {
        await this.cloudinaryService.deleteImage(visitor.photoUrl);
        visitor.clearPhoto();
        await this.visitorRepository.update(visitor);
      }
    }
  }
}
