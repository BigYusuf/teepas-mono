
import { TaskTarget, TaskCategory } from "@prisma/client";
import prisma from "../../libs/prisma";

// Call after a new agent is created
export async function initAgentTasks(agentId: string) {
  const agentTasks = await prisma.tasks.findMany({
    where: { target: TaskTarget.AGENT, isActive: true },
  });

  await prisma.agentTaskProgress.createMany({
    data: agentTasks.map((task) => ({
      agentId,
      taskId: task.id,
      completed: false,
    })),
    // skipDuplicates may be missing or incorrectly typed in generated Prisma typings
    // @ts-ignore
    skipDuplicates: true,
  });
}

// Call after a new agency is created
export async function initAgencyTasks(agencyId: string) {
  const agencyTasks = await prisma.tasks.findMany({
    where: { target: TaskTarget.AGENCY, isActive: true },
  });

  await prisma.agencyTaskProgress.createMany({
    data: agencyTasks.map((task) => ({
      agencyId,
      taskId: task.id,
      completed: false,
    })),
    // skipDuplicates may be missing or incorrectly typed in generated Prisma typings
    // @ts-ignore
    skipDuplicates: true,
  });
}
