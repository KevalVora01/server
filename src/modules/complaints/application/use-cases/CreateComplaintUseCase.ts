import { Complaint } from "../../domain/entities/Complaint";
import { IComplaintRepository } from "../../domain/repositories/IComplaintRepository";
import { CreateComplaintDto } from "../dtos/CreateComplaintDto";

export class CreateComplaintUseCase {
  constructor(private readonly complaintRepository: IComplaintRepository) { }

  async execute(dto: CreateComplaintDto): Promise<Complaint> {
    const complaint = Complaint.create({
      residentId: dto.residentId,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
    });

    return this.complaintRepository.create(complaint, dto.imageUrls);
  }
}