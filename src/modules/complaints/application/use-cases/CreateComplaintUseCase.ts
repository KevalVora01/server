import { Complaint } from "../../domain/entities/Complaint";
import { IComplaintRepository } from "../../domain/repositories/IComplaintRepository";
import { IComplaintNotifier } from "../../domain/services/IComplaintNotifier";
import { CreateComplaintDto } from "../dtos/CreateComplaintDto";

export class CreateComplaintUseCase {
  constructor(
    private readonly complaintRepository: IComplaintRepository,
    private readonly notifier: IComplaintNotifier
  ) { }

  async execute(dto: CreateComplaintDto): Promise<Complaint> {
    const complaint = Complaint.create({
      residentId: dto.residentId,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
    });

    const saved = await this.complaintRepository.create(complaint, dto.imageUrls);

    await this.notifier.notifyCreated(saved);

    return saved;
  }
}