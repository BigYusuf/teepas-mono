import isAuthenticated from "../../middleware/isAuthenticated";
import express, { Router } from "express";
import {
  fetchMessages,
  fetchAgentMessages,
  getAgentConversations,
  getUserConversations,
  newConversation,
} from "./chatting.controllers";
import { isAgent } from "../../middleware/authorizeRoles";

const chatRoutes: Router = express.Router();

chatRoutes.post("/create-user-conversationGroup", isAuthenticated, newConversation);
chatRoutes.get("/get-user-conversations", isAuthenticated, getUserConversations);
chatRoutes.get(
  "/get-agent-conversations",
  isAuthenticated,
  isAgent,
  getAgentConversations,
);
chatRoutes.get("/get-messages/:conversationId", isAuthenticated, fetchMessages);
chatRoutes.get(
  "/get-agent-messages/:conversationId",
  isAuthenticated,
  isAgent,
  fetchAgentMessages,
);

export default chatRoutes;
