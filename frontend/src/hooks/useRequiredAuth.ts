import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAgent from "./useAgent";

const useRequireAuth = () => {
  const router = useRouter();
  const { agent, isLoading } = useAgent();

  useEffect(() => {
    if (!isLoading && !agent) {
      router.replace("/login");
    }
  }, [agent, isLoading, router]);

  return { agent, isLoading };
};

export default useRequireAuth;
