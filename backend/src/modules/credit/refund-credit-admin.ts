import prisma from "../../libs/prisma";

interface RefundCreditsParams {
  agencyId: string;
  credits: number;
  reason?: string;
}

export const refundCreditsAdmin = async ({
  agencyId,
  credits,
  reason,
}: RefundCreditsParams) => {
  // Find the agency credits record
  const creditRecord = await prisma.agencyCredits.findUnique({
    where: { agencyId },
  });

  if (!creditRecord) {
    throw new Error("Agency credit record not found");
  }

  const balanceBefore = creditRecord.balance;
  const balanceAfter = balanceBefore + credits;

  // Update the agency's credit balance
  const updatedCredits = await prisma.agencyCredits.update({
    where: { agencyId },
    data: {
      balance: balanceAfter,
      lastUpdated: new Date(),
    },
  });

  // Log credit transaction
  await prisma.creditTransactions.create({
    data: {
      agencyId,
      type: "REFUNDED",
      amount: credits,
      balanceBefore,
      balanceAfter,
      purpose: "ADMIN_REFUND",
      note: reason || "Manual admin refund",
      createdAt: new Date(),
    },
  });

  return updatedCredits;
};
                                                                                                                                                            