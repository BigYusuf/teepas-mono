import { AuthError, NotFoundError, ValidationError } from "../../error-handler";
import prisma from "../../libs/prisma";
import redis from "../../libs/redis";
import {
  clearUnseenCount,
  getUnseenCount,
} from "../../libs/redis/message.redis";
import { NextFunction, Response } from "express";

// create a new conversation
export const newConversation = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agentId } = req.body;
    const userId = req.user.id;

    if (!agentId) {
      return next(new ValidationError("Agent Id is required!"));
    }

    // Directly check if a conversationGroup already exists for this user + agent
    const existingGroup = await prisma.conversationGroup.findFirst({
      where: {
        isGroup: false,
        participantIds: {
          hasEvery: [userId, agentId],
        },
      },
    });

    if (existingGroup) {
      return res
        .status(200)
        .json({ conversation: existingGroup, isNew: false });
    }

    // Create conversation + participants
    const newGroup = await prisma.conversationGroup.create({
      data: {
        isGroup: false,
        creatorId: userId,
        participantIds: [userId, agentId],
      },
    });

    await prisma.participant.createMany({
      data: [
        {
          conversationId: newGroup.id,
          userId,
        },
        {
          conversationId: newGroup.id,
          agentId,
        },
      ],
    });

    return res.status(201).json({ conversation: newGroup, isNew: true });
  } catch (error) {
    next(error);
  }
};

// get user conversations
export const getUserConversations = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;

    // Find all conversationGroups where the user is a participant
    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: {
          has: userId,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const responseData = await Promise.all(
      conversations.map(async (group: any) => {
        // Get the agentParticipant inside this conversation
        const agentParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: group.id,
            agentId: { not: null },
          },
        });

        // Get the agent's full info
        let agent = null;
        if (agentParticipant?.agentId) {
          agent = await prisma.agents.findUnique({
            where: {
              id: agentParticipant.agentId,
            },
            include: {
              agency: true,
            },
          });
        }

        // Get last message in the conversation
        const lastMessage = await prisma.message.findFirst({
          where: {
            conversationId: group.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        // Check online status from Redis
        let isOnline = false;
        if (agentParticipant?.agentId) {
          const redisKey = `online:agent:${agentParticipant.agentId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }

        const unreadCount = await getUnseenCount("user", group.id);

        return {
          conversationId: group.id,
          agent: {
            id: agent?.id || null,
            name: agent?.agency?.name || "Unknown",
            isOnline,
            avatar: agent?.agency?.avatar,
          },
          lastMessage:
            lastMessage?.content || "Say something to start a conversation",
          lastMessageAt: lastMessage?.createdAt || group.updatedAt,
          unreadCount,
        };
      }),
    );

    return res.status(200).json({ conversations: responseData });
  } catch (error) {
    return next(error);
  }
};

// get agent conversations
export const getAgentConversations = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agentId = req.agent.id;

    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: {
          has: agentId,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const responseData = await Promise.all(
      conversations.map(async (group: any) => {
        // Get the userParticipant (NOT agent) for this conversation
        const userParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: group.id,
            userId: { not: null },
          },
        });

        // Get user details
        let user = null;
        if (userParticipant?.userId) {
          user = await prisma.users.findUnique({
            where: {
              id: userParticipant.userId,
            },
            include: {
              avatar: true,
            },
          });
        }

        // Get last message
        const lastMessage = await prisma.message.findFirst({
          where: {
            conversationId: group.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        // Online status from Redis
        let isOnline = false;
        if (userParticipant?.userId) {
          const redisKey = `online:user:user_${userParticipant.userId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }

        const unreadCount = await getUnseenCount("agent", group.id);

        return {
          conversationId: group.id,
          user: {
            id: user?.id || null,
            name: user?.name || "Unknown",
            avatar: user?.avatar || null,
            isOnline,
          },
          lastMessage:
            lastMessage?.content || "Say something to start a conversation",
          lastMessageAt: lastMessage?.createdAt || group.updatedAt,
          unreadCount,
        };
      }),
    );

    return res.status(200).json({ conversations: responseData });
  } catch (error) {
    return next(error);
  }
};

// fetch user messages
export const fetchMessages = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;

    if (!conversationId) {
      return next(new ValidationError("Conversation ID is required"));
    }

    // Check if user has access to this conversation
    const conversation = await prisma.conversationGroup.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return next(new NotFoundError("Conversation not found"));
    }

    const hasAccess = conversation.participantIds.includes(userId);
    if (!hasAccess) {
      return next(new AuthError("Access denied to this conversation"));
    }

    // Clear unseen messages for this user
    await clearUnseenCount("user", conversationId);

    // Get the agent participant
    const agentParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        agentId: { not: null },
      },
    });

    // Fetch agent info
    let agent = null;
    let isOnline = false;

    if (agentParticipant?.agentId) {
      agent = await prisma.agents.findUnique({
        where: { id: agentParticipant.agentId },
        include: {
          agency: true,
        },
      });

      const redisKey = `online:agent:${agentParticipant.agentId}`;
      const redisResult = await redis.get(redisKey);
      isOnline = !!redisResult;
    }

    // Fetch paginated messages (latest first)
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json({
      messages,
      agent: {
        id: agent?.id || null,
        name: agent?.agency?.name || "Unknown",
        avatar: agent?.agency?.avatar || null,
        isOnline,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    return next(error);
  }
};

// fetch agent messages
export const fetchAgentMessages = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agentId = req.agent.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;

    if (!conversationId) {
      return next(new ValidationError("Conversation ID is required"));
    }

    // Validate access
    const conversation = await prisma.conversationGroup.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return next(new NotFoundError("Conversation not found"));
    }

    if (!conversation.participantIds.includes(agentId)) {
      return next(new AuthError("Access denied to this conversation"));
    }

    // Clear unseen messages for this agent
    await clearUnseenCount("agent", conversationId);

    // Get user participant
    const userParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        userId: { not: null },
      },
    });

    // Get user info
    let user = null;
    let isOnline = false;

    if (userParticipant?.userId) {
      user = await prisma.users.findUnique({
        where: { id: userParticipant.userId },
        include: {
          avatar: true,
        },
      });

      const redisKey = `online:user:user_${userParticipant.userId}`;
      const redisResult = await redis.get(redisKey);
      isOnline = !!redisResult;
    }

    // Get paginated messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json({
      messages,
      user: {
        id: user?.id || null,
        name: user?.name || "Unknown",
        avatar: user?.avatar || null,
        isOnline,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    return next(error);
  }
};
