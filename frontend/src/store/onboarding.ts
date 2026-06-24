import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OnboardingState {
  step: number;
  agentId?: string;
  agencyId?: string;
  setStep: (step: number) => void;
  setAgentId: (id: string) => void;
  setAgencyId: (id: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      agentId: undefined,
      agencyId: undefined,
      setStep: (step) => set({ step }),
      setAgentId: (id) => set({ agentId: id }),
      setAgencyId: (id) => set({ agencyId: id }),
      reset: () => set({ step: 1, agentId: undefined, agencyId: undefined }),
    }),
    {
      name: "onboarding-storage",
      // ✅ cast to `Partial<OnboardingState>` so TypeScript accepts the subset
      partialize: (state): Partial<OnboardingState> => ({
        step: state.step,
        agentId: state.agentId,
        agencyId: state.agencyId,
      }),
    }
  )
);
