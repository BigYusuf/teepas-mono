import prisma from "../libs/prisma";


/**
 * Marks a specific task as completed for an agent.
 * It looks up the task by `taskKey` and ensures idempotency.
 */
export const markTaskCompleted = async (agentId: string, taskKey: string) => {
  try {
    // 1️⃣ Find the task by its unique key
    const task = await prisma.tasks.findUnique({
      where: { key: taskKey },
    });

    if (!task) {
      console.warn(`⚠️ Task with key '${taskKey}' not found.`);
      return;
    }

    // 2️⃣ Check if the agent has already completed it
    const existingProgress = await prisma.agentTaskProgress.findFirst({
      where: {
        agentId,
        taskId: task.id,
      },
    });

    // 3️⃣ If already completed, skip
    if (existingProgress?.completed) {
      return;
    }

    // 4️⃣ If exists but not completed, update it
    if (existingProgress) {
      await prisma.agentTaskProgress.update({
        where: { id: existingProgress.id },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      });
      return;
    }

    // 5️⃣ If no record yet, create it
    await prisma.agentTaskProgress.create({
      data: {
        agentId,
        taskId: task.id,
        completed: true,
        completedAt: new Date(),
      },
    });

    console.log(`✅ Marked task '${taskKey}' completed for agent ${agentId}`);
  } catch (error) {
    console.error(
      `❌ Failed to mark task '${taskKey}' for agent ${agentId}:`,
      error
    );
  }
};
