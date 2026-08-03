import { Visitor } from "../../domain/entities/Visitor";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { VisitorNotFoundError, VisitorNotCheckedInError } from "../../domain/errors/VisitorErrors";
import { CloudinaryService } from "../../../../shared/services/CloudinaryService";

export class CheckOutVisitorUseCase {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async execute(visitorId: number): Promise<Visitor> {
    const visitor = await this.visitorRepository.findById(visitorId);

    if (!visitor) {
      throw new VisitorNotFoundError(visitorId);
    }

    try {
      visitor.checkOut();
    } catch {
      throw new VisitorNotCheckedInError();
    }

    // Delete visitor photo from Cloudinary on checkout and clear from entity
    console.log("[CheckOut] visitor.photoUrl:", visitor.photoUrl);
    if (visitor.photoUrl) {
      console.log("[CheckOut] Deleting photo from Cloudinary:", visitor.photoUrl);
      await this.cloudinaryService.deleteImage(visitor.photoUrl);
      visitor.clearPhoto();
    }

    return this.visitorRepository.update(visitor);
  }
}