import { ExtraCharge } from "../entities/Invoice";

const PENALTY_RATE = 0.05; // 5%
const PENALTY_LABEL_PREFIX = "Late fee";

// Called by the cron job the first time an invoice crosses its due date.
// Returns the extra charge to append — does not touch the invoice itself.

export function calculateFirstOverduePenalty(baseAmount: number): ExtraCharge {
  return {
    label: `${PENALTY_LABEL_PREFIX} (5%)`,
    amount: roundToTwoDecimals(baseAmount * PENALTY_RATE),
  };
}

// Called by the cron job when a full additional month has passed
// since the invoice became overdue, and it is still unpaid.
// monthsOverdue starts at 1 for "one full month past the first penalty".

export function calculateAdditionalMonthlyPenalty(baseAmount: number, monthsOverdue: number): ExtraCharge {
  return {
    label: `${PENALTY_LABEL_PREFIX} (5%) - Month ${monthsOverdue + 1}`,
    amount: roundToTwoDecimals(baseAmount * PENALTY_RATE),
  };
}

// Recalculates total from base + all extra charges.
// Called by the cron job right after appending a new charge,
// since Invoice entity keeps these fields independent by design.

export function recalculateTotal(baseAmount: number, extraCharges: ExtraCharge[]): number {
  const chargesSum = extraCharges.reduce((sum, charge) => sum + charge.amount, 0);
  return roundToTwoDecimals(baseAmount + chargesSum);
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}