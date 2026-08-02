import { AuthError, NotFoundError, ValidationError } from "../../error-handler";
import prisma from "../../libs/prisma";
import { NextFunction, Response } from "express";

// ─── Create a new conversation ───────────────────────────────────────────────
export const newConversation = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { agentId } = req.body;
    const userId = req.user.id;

    if (!agentId) {
      return next(new ValidationError("Agent ID is required!"));
    }

    // Check if a 1-to-1 conversation already exists via participants table
    const existingParticipant = await prisma.participants.findFirst({
      where: { userId },
      include: { conversation: true },
    });

    if (existingParticipant) {
      const alreadyExists = await prisma.participants.findFirst({
        where: {
          conversationId: existingParticipant.conversationId,
          agentId,
        },
      });

      if (alreadyExists) {
        return res.status(200).json({
          conversation: existingParticipant.conversation,
          isNew: false,
        });
      }
    }

    // Create conversation + participants atomically
    const newGroup = await prisma.$transaction(async (tx) => {
      const group = await tx.conversationGroup.create({
        data: {
          isGroup: false,
          creatorId: userId,
        },
      });

      await tx.participants.createMany({
        data: [
          { conversationId: group.id, userId },
          { conversationId: group.id, agentId },
        ],
      });

      return group;
    });

    return res.status(201).json({ conversation: newGroup, isNew: true });
  } catch (error) {
    next(error);
  }
};

// ─── Get all conversations for a user ────────────────────────────────────────
export const getUserConversations = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    // Find all conversations this user is a participant in
    const userParticipants = await prisma.participants.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
      orderBy: { conversation: { updatedAt: "desc" } },
    });

    const responseData = await Promise.all(
      userParticipants.map(async (userParticipant) => {
        const group = userParticipant.conversation;
        const agentParticipant = group.participants.find((p) => p.agentId !== null);

        let agent = null;
        if (agentParticipant?.agentId) {
          agent = await prisma.agents.findUnique({
            where: { id: agentParticipant.agentId },
            select: {
              id: true,
              name: true,
              memberships: {
                where: { status: "ACTIVE" },
                take: 1,
                include: {
                  agency: { select: { name: true, avatar: true } },
                },
              },
            },
          });
        }

        const lastMessage = await prisma.message.findFirst({
          where: { conversationId: group.id },
          orderBy: { createdAt: "desc" },
          select: { content: true, createdAt: true },
        });

        const activeAgency = agent?.memberships?.[0]?.agency ?? null;

        return {
          conversationId: group.id,
          agent: {
            id: agent?.id ?? null,
            name: activeAgency?.name ?? agent?.name ?? "Unknown",
            avatar: activeAgency?.avatar ?? null,
            isOnline: agentParticipant?.isOnline ?? false,
          },
          lastMessage: lastMessage?.content ?? "Say something to start a conversation",
          lastMessageAt: lastMessage?.createdAt ?? group.updatedAt,
          unreadCount: userParticipant.unreadCount,
        };
      })
    );

    return res.status(200).json({ conversations: responseData });
  } catch (error) {
    next(error);
  }
};

// ─── Get all conversations for an agent ──────────────────────────────────────
export const getAgentConversations = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const agentId = req.agent.id;

    const agentParticipants = await prisma.participants.findMany({
      where: { agentId },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
      orderBy: { conversation: { updatedAt: "desc" } },
    });

    const responseData = await Promise.all(
      agentParticipants.map(async (agentParticipant) => {
        const group = agentParticipant.conversation;
        const userParticipant = group.participants.find((p) => p.userId !== null);

        let user = null;
        if (userParticipant?.userId) {
          user = await prisma.users.findUnique({
            where: { id: userParticipant.userId },
            select: {
              id: true,
              name: true,
              avatar: { select: { id: true } },
            },
          });
        }

        const lastMessage = await prisma.message.findFirst({
          where: { conversationId: group.id },
          orderBy: { createdAt: "desc" },
          select: { content: true, createdAt: true },
        });

        return {
          conversationId: group.id,
          user: {
            id: user?.id ?? null,
            name: user?.name ?? "Unknown",
            avatar: user?.avatar ?? null,
            isOnline: userParticipant?.isOnline ?? false,
          },
          lastMessage: lastMessage?.content ?? "Say something to start a conversation",
          lastMessageAt: lastMessage?.createdAt ?? group.updatedAt,
          unreadCount: agentParticipant.unreadCount,
        };
      })
    );

    return res.status(200).json({ conversations: responseData });
  } catch (error) {
    next(error);
  }
};

// ─── Fetch messages for a user ────────────────────────────────────────────────
export const fetchMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = 20;

    if (!conversationId) {
      return next(new ValidationError("Conversation ID is required"));
    }

    // Verify user is a participant — this replaces the old participantIds.includes() check
    const userParticipant = await prisma.participants.findFirst({
      where: { conversationId, userId },
    });

    if (!userParticipant) {
      return next(new AuthError("Access denied to this conversation"));
    }

    // Clear unread count
    await prisma.participants.update({
      where: { id: userParticipant.id },
      data: { unreadCount: 0, lastSeenAt: new Date() },
    });

    const agentParticipant = await prisma.participants.findFirst({
      where: { conversationId, agentId: { not: null } },
    });

    let agent = null;
    if (agentParticipant?.agentId) {
      agent = await prisma.agents.findUnique({
        where: { id: agentParticipant.agentId },
        select: {
          id: true,
          name: true,
          memberships: {
            where: { status: "ACTIVE" },
            take: 1,
            include: {
              agency: { select: { name: true, avatar: true } },
            },
          },
        },
      });
    }

    const activeAgency = agent?.memberships?.[0]?.agency ?? null;

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json({
      messages,
      agent: {
        id: agent?.id ?? null,
        name: activeAgency?.name ?? agent?.name ?? "Unknown",
        avatar: activeAgency?.avatar ?? null,
        isOnline: agentParticipant?.isOnline ?? false,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Fetch messages for an agent ──────────────────────────────────────────────
export const fetchAgentMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const agentId = req.agent.id;
    const { conversationId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = 20;

    if (!conversationId) {
      return next(new ValidationError("Conversation ID is required"));
    }

    // Verify agent is a participant — this replaces the old participantIds.includes() check
    const agentParticipant = await prisma.participants.findFirst({
      where: { conversationId, agentId },
    });

    if (!agentParticipant) {
      return next(new AuthError("Access denied to this conversation"));
    }

    // Clear unread count
    await prisma.participants.update({
      where: { id: agentParticipant.id },
      data: { unreadCount: 0, lastSeenAt: new Date() },
    });

    const userParticipant = await prisma.participants.findFirst({
      where: { conversationId, userId: { not: null } },
    });

    let user = null;
    if (userParticipant?.userId) {
      user = await prisma.users.findUnique({
        where: { id: userParticipant.userId },
        select: {
          id: true,
          name: true,
          avatar: { select: { id: true } },
        },
      });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json({
      messages,
      user: {
        id: user?.id ?? null,
        name: user?.name ?? "Unknown",
        avatar: user?.avatar ?? null,
        isOnline: userParticipant?.isOnline ?? false,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    next(error);
  }
};
