import prisma from "../libs/prisma";
import { PrismaClient, TaskTarget, Prisma } from "@prisma/client";

type TxClient = Prisma.TransactionClient;

/**
 * Credits an agency's wallet and writes a ledger entry for a completed task.
 * Must be called inside an existing transaction to stay atomic with the
 * task-progress write.
 */
const awardTaskCredits = async (
  tx: TxClient,
  agencyId: string,
  amount: number,
  taskName: string
) => {
  if (amount <= 0) return;

  // Ensure a wallet exists, then lock/read current balance
  const wallet = await tx.agencyCredits.upsert({
    where: { agencyId },
    update: {},
    create: { agencyId, balance: 0 },
  });

  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore + amount;

  await tx.agencyCredits.update({
    where: { agencyId },
    data: { balance: balanceAfter, lastUpdated: new Date() },
  });

  await tx.creditTransactions.create({
    data: {
      agencyId,
      type: "TASK_REWARD", // add this value to your CreditType enum
      amount,
      balanceBefore,
      balanceAfter,
      purpose: "TASK_COMPLETION",
      note: `Reward for completing task: ${taskName}`,
    },
  });
};

/**
 * Marks an AGENT-scoped task completed for an agent, and (if the task has
 * rewardCredits) credits the agent's agency. Idempotent — awarding only
 * happens on the transition into `completed: true`.
 */
export const markAgentTaskCompleted = async (
  agentId: string,
  taskKey: string
) => {
  try {
    const task = await prisma.tasks.findUnique({ where: { key: taskKey } });

    if (!task) {
      console.warn(`⚠️ Task with key '${taskKey}' not found.`);
      return;
    }

    if (task.target !== TaskTarget.AGENT) {
      console.warn(
        `⚠️ Task '${taskKey}' is target ${task.target}, not AGENT. Use markAgencyTaskCompleted instead.`
      );
      return;
    }

    const agent = await prisma.agents.findUnique({
      where: { id: agentId },
      select: { id: true, agencyId: true },
    });

    if (!agent) {
      console.warn(`⚠️ Agent '${agentId}' not found.`);
      return;
    }

    const outcome = await prisma.$transaction(async (tx) => {
      const existingProgress = await tx.agentTaskProgress.findUnique({
        where: { agentId_taskId: { agentId, taskId: task.id } },
      });

      if (existingProgress?.completed) {
        return "already_completed" as const;
      }

      if (existingProgress) {
        await tx.agentTaskProgress.update({
          where: { id: existingProgress.id },
          data: { completed: true, completedAt: new Date() },
        });
      } else {
        await tx.agentTaskProgress.create({
          data: {
            agentId,
            taskId: task.id,
            completed: true,
            completedAt: new Date(),
          },
        });
      }

      if (task.rewardCredits > 0 && agent.agencyId) {
        await awardTaskCredits(tx, agent.agencyId, task.rewardCredits, task.name);
      }

      return "completed" as const;
    });

    if (outcome === "completed") {
      console.log(
        `✅ Agent task '${taskKey}' completed for ${agentId}` +
          (task.rewardCredits > 0
            ? ` (+${task.rewardCredits} credits to agency)`
            : "")
      );
    }
  } catch (error) {
    console.error(
      `❌ Failed to mark agent task '${taskKey}' for ${agentId}:`,
      error
    );
  }
};

/**
 * Marks an AGENCY-scoped task completed and credits the agency's wallet
 * if the task has a rewardCredits value. Idempotent.
 */
export const markAgencyTaskCompleted = async (
  agencyId: string,
  taskKey: string
) => {
  try {
    const task = await prisma.tasks.findUnique({ where: { key: taskKey } });

    if (!task) {
      console.warn(`⚠️ Task with key '${taskKey}' not found.`);
      return;
    }

    if (task.target !== TaskTarget.AGENCY) {
      console.warn(
        `⚠️ Task '${taskKey}' is target ${task.target}, not AGENCY. Use markAgentTaskCompleted instead.`
      );
      return;
    }

    const outcome = await prisma.$transaction(async (tx) => {
      const existingProgress = await tx.agencyTaskProgress.findUnique({
        where: { agencyId_taskId: { agencyId, taskId: task.id } },
      });

      if (existingProgress?.completed) {
        return "already_completed" as const;
      }

      if (existingProgress) {
        await tx.agencyTaskProgress.update({
          where: { id: existingProgress.id },
          data: { completed: true, completedAt: new Date() },
        });
      } else {
        await tx.agencyTaskProgress.create({
          data: {
            agencyId,
            taskId: task.id,
            completed: true,
            completedAt: new Date(),
          },
        });
      }

      if (task.rewardCredits > 0) {
        await awardTaskCredits(tx, agencyId, task.rewardCredits, task.name);
      }

      return "completed" as const;
    });

    if (outcome === "completed") {
      console.log(
        `✅ Agency task '${taskKey}' completed for ${agencyId}` +
          (task.rewardCredits > 0
            ? ` (+${task.rewardCredits} credits)`
            : "")
      );
    }
  } catch (error) {
    console.error(
      `❌ Failed to mark agency task '${taskKey}' for ${agencyId}:`,
      error
    );
  }
};

/**
 * Convenience dispatcher if you just have a taskKey and don't yet know
 * its target — looks it up once, then delegates.
 */
export const markTaskCompleted = async (
  ids: { agentId?: string; agencyId?: string },
  taskKey: string
) => {
  const task = await prisma.tasks.findUnique({ where: { key: taskKey } });
  if (!task) {
    console.warn(`⚠️ Task with key '${taskKey}' not found.`);
    return;
  }

  if (task.target === TaskTarget.AGENT) {
    if (!ids.agentId) {
      console.warn(`⚠️ Task '${taskKey}' requires an agentId.`);
      return;
    }
    return markAgentTaskCompleted(ids.agentId, taskKey);
  }

  if (!ids.agencyId) {
    console.warn(`⚠️ Task '${taskKey}' requires an agencyId.`);
    return;
  }
  return markAgencyTaskCompleted(ids.agencyId, taskKey);
};