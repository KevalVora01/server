import { ExtraCharge } from "../entities/Invoice";

const PENALTY_RATE = 0.05; // 5%
const PENALTY_LABEL_PREFIX = "Late fee";

// Called by the cron job the first time an invoice crosses its due date.
// Returns the extra charge to append — does not touch the invoice itself.

export function calculateFirstOverduePenalty(baseAmount: number): ExtraCharge {
  return {
    label: `${PENALTY_LABEL_PREFIX} (1 Month @ 5%)`,
    amount: roundToTwoDecimals(baseAmount * PENALTY_RATE),
  };
}

export function calculateAdditionalMonthlyPenalty(baseAmount: number, monthsOverdue: number): ExtraCharge {
  const totalMonths = monthsOverdue + 1;
  return {
    label: `${PENALTY_LABEL_PREFIX} (${totalMonths} Months @ 5%/mo)`,
    amount: roundToTwoDecimals(baseAmount * PENALTY_RATE * totalMonths),
  };
}

/**
 * Consolidates all late fee entries in extraCharges into a single line item for N months.
 */
export function consolidateLateFees(
  existingCharges: ExtraCharge[],
  baseAmount: number,
  totalMonths: number
): ExtraCharge[] {
  const nonLateFeeCharges = existingCharges.filter(
    (c) => !c.label.toLowerCase().startsWith("late fee")
  );

  if (totalMonths <= 0) {
    return nonLateFeeCharges;
  }

  const totalAmount = roundToTwoDecimals(baseAmount * PENALTY_RATE * totalMonths);
  const label = totalMonths === 1
    ? `${PENALTY_LABEL_PREFIX} (1 Month @ 5%)`
    : `${PENALTY_LABEL_PREFIX} (${totalMonths} Months @ 5%/mo)`;

  return [
    ...nonLateFeeCharges,
    {
      label,
      amount: totalAmount,
    },
  ];
}

/**
 * Helper to display late fees in a single consolidated line item (for PDF / API presentation).
 */
export function consolidateLateFeesForDisplay(extraCharges: ExtraCharge[]): ExtraCharge[] {
  const lateFees = extraCharges.filter((c) => c.label.toLowerCase().startsWith("late fee"));
  const nonLateFees = extraCharges.filter((c) => !c.label.toLowerCase().startsWith("late fee"));

  if (lateFees.length === 0) {
    return extraCharges;
  }

  const totalAmount = roundToTwoDecimals(lateFees.reduce((sum, c) => sum + c.amount, 0));

  let totalMonths = lateFees.length;
  for (const fee of lateFees) {
    const match = fee.label.match(/(\d+)\s*Months?/i);
    if (match) {
      totalMonths = Math.max(totalMonths, parseInt(match[1], 10));
    }
  }

  const label = totalMonths === 1
    ? `${PENALTY_LABEL_PREFIX} (1 Month)`
    : `${PENALTY_LABEL_PREFIX} (${totalMonths} Months)`;

  return [
    ...nonLateFees,
    {
      label,
      amount: totalAmount,
    },
  ];
}

// Recalculates total from base + all extra charges.
export function recalculateTotal(baseAmount: number, extraCharges: ExtraCharge[]): number {
  const chargesSum = extraCharges.reduce((sum, charge) => sum + charge.amount, 0);
  return roundToTwoDecimals(baseAmount + chargesSum);
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}