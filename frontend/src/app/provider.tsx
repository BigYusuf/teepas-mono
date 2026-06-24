"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import useAgent from "../hooks/useAgent";
import { WebSocketProvider } from "../context/web-socket-context";
import { Toaster } from "sonner";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ProvidersWithWebSocket>{children}</ProvidersWithWebSocket>
      <Toaster />
    </QueryClientProvider>
  );
};

const ProvidersWithWebSocket = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { agent, isLoading } = useAgent();

  if (isLoading) return null;

  return (
    <>
      {agent && (
        <WebSocketProvider agent={agent}>{children}</WebSocketProvider>
      )}
      {!agent && children}
    </>
  );
};

export default Providers;
