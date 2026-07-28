export interface VisitorDashboardMetrics {
  visitorsToday: number;
  currentlyInside: number;
  averageVisitDurationMinutes: number;
}

import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";

export class GetDashboardMetricsUseCase {
  constructor(private readonly visitorRepository: IVisitorRepository) {}

  async execute(): Promise<VisitorDashboardMetrics> {
    return this.visitorRepository.getDashboardMetrics();
  }
} 