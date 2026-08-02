import prisma from "../../libs/prisma";
import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

const connectedUsers: Map<string, WebSocket> = new Map();

type IncomingMessage = {
  type?: string;
  fromUserId: string;
  toUserId: string;
  messageBody: string;
  conversationId: string;
  senderType: string;
};

export async function createWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("New WebSocket connection!");

    let registeredUserId: string | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;

    ws.on("message", async (rawMessage) => {
      try {
        const messageStr = rawMessage.toString();

        // Register user on first plain (non-JSON) message
        if (!registeredUserId && !messageStr.startsWith("{")) {
          registeredUserId = messageStr.trim();
          connectedUsers.set(registeredUserId, ws);
          console.log(`Registered WebSocket for: ${registeredUserId}`);

          const isAgent = registeredUserId.startsWith("agent_");
          const rawId = isAgent
            ? registeredUserId.replace("agent_", "")
            : registeredUserId.replace("user_", "");

          // Mark all their participant rows as online
          await prisma.participants.updateMany({
            where: isAgent ? { agentId: rawId } : { userId: rawId },
            data: { isOnline: true },
          });

          // Heartbeat: keep isOnline fresh every 2 minutes
          heartbeatInterval = setInterval(async () => {
            await prisma.participants.updateMany({
              where: isAgent ? { agentId: rawId } : { userId: rawId },
              data: { isOnline: true },
            });
          }, 120_000);

          return;
        }

        const data: IncomingMessage = JSON.parse(messageStr);

        // Handle MARK_AS_SEEN
        if (data.type === "MARK_AS_SEEN" && registeredUserId) {
          const isAgent = registeredUserId.startsWith("agent_");
          const rawId = isAgent
            ? registeredUserId.replace("agent_", "")
            : registeredUserId.replace("user_", "");

          await prisma.participants.updateMany({
            where: {
              conversationId: data.conversationId,
              ...(isAgent ? { agentId: rawId } : { userId: rawId }),
            },
            data: { unreadCount: 0, lastSeenAt: new Date() },
          });
          return;
        }

        // Regular message
        const {
          fromUserId,
          toUserId,
          messageBody,
          conversationId,
          senderType,
        } = data;

        if (!toUserId || !messageBody || !conversationId) {
          console.warn("Invalid message format:", data);
          return;
        }

        const now = new Date();

        // Persist message to DB
        const savedMessage = await prisma.message.create({
          data: {
            conversationId,
            senderId: fromUserId,
            senderType,
            content: messageBody,
            createdAt: now,
          },
        });

        // Bump conversation updatedAt so lists stay sorted
        await prisma.conversationGroup.update({
          where: { id: conversationId },
          data: { updatedAt: now },
        });

        // Increment receiver's unreadCount in participants
        const isReceiverAgent = senderType === "user";
        await prisma.participants.updateMany({
          where: {
            conversationId,
            ...(isReceiverAgent ? { agentId: toUserId } : { userId: toUserId }),
          },
          data: { unreadCount: { increment: 1 } },
        });

        // Fetch updated unread count to send in the event
        const receiverParticipant = await prisma.participants.findFirst({
          where: {
            conversationId,
            ...(isReceiverAgent ? { agentId: toUserId } : { userId: toUserId }),
          },
          select: { unreadCount: true },
        });

        const messagePayload = {
          id: savedMessage.id,
          conversationId,
          senderId: fromUserId,
          senderType,
          content: messageBody,
          createdAt: now.toISOString(),
        };

        const messageEvent = JSON.stringify({
          type: "NEW_MESSAGE",
          payload: messagePayload,
        });

        const receiverKey = isReceiverAgent
          ? `agent_${toUserId}`
          : `user_${toUserId}`;
        const senderKey =
          senderType === "user" ? `user_${fromUserId}` : `agent_${fromUserId}`;

        // Deliver to receiver
        const receiverSocket = connectedUsers.get(receiverKey);
        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          receiverSocket.send(messageEvent);
          receiverSocket.send(
            JSON.stringify({
              type: "UNSEEN_COUNT_UPDATE",
              payload: {
                conversationId,
                count: receiverParticipant?.unreadCount ?? 1,
              },
            }),
          );
          console.log(`Delivered to ${receiverKey}`);
        } else {
          console.log(`${receiverKey} is offline. Message persisted to DB.`);
        }

        // Echo to sender
        const senderSocket = connectedUsers.get(senderKey);
        if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
          senderSocket.send(messageEvent);
          console.log(`Echoed to sender ${senderKey}`);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    ws.on("close", async () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);

      if (registeredUserId) {
        connectedUsers.delete(registeredUserId);
        console.log(`Disconnected: ${registeredUserId}`);

        const isAgent = registeredUserId.startsWith("agent_");
        const rawId = isAgent
          ? registeredUserId.replace("agent_", "")
          : registeredUserId.replace("user_", "");

        await prisma.participants.updateMany({
          where: isAgent ? { agentId: rawId } : { userId: rawId },
          data: { isOnline: false },
        });
      }
    });

    ws.on("error", (err: Error) => {
      console.error("WebSocket error:", err);
    });
  });

  console.log("WebSocket server ready");
}
