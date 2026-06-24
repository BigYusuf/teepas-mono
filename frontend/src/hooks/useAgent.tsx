"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";
import React from "react";
import { isProtected } from "../utils/protected";

// fetch agent data from API
const fetchAgent = async () => {
  const response = await axiosInstance.get(
    "/auth/logged-in-agent",
    isProtected
  );
  console.log("Fetched agent data:", response.data);
  return response.data.agent;
};

const useAgent = () => {
  const { setLoggedIn, isLoggedIn } = useAuthStore();

  const {
    data: agent,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["agent"],
    queryFn: fetchAgent,
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: isLoggedIn, // Only run query if agent should be logged in
  });

  // Update auth state based on query results
  React.useEffect(() => {
    if (agent) {
      setLoggedIn(true);
    } else if (isError) {
      setLoggedIn(false);
    }
  }, [agent, isError, setLoggedIn]);

  return { agent: agent as any, isLoading: isPending, isError };
};

export default useAgent;
