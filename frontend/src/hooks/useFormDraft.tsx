import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import equal from "fast-deep-equal";
import { toast } from "sonner";
import axiosInstance from "../utils/axiosInstance";

function normalize(value: any) {
  if (typeof value === "string") {
    return value
      .trim()
      .replace(/<p><br><\/p>/gi, "")
      .replace(/<br\s*\/?>/gi, "")
      .replace(/<p>\s*<\/p>/gi, "");
  }
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, normalize(v)])
    );
  }
  return value;
}

/**
 * A dynamic draft-saving hook that works for any form type (property, event, etc.)
 *
 * @param type - e.g. "property", "event"
 * @param defaultValues - form default values
 * @param endpoints - optional custom API endpoints
 */
function useFormDraft<T>(
  type: string,
  defaultValues: any,
  endpoints?: {
    getDraft?: string;
    deleteDraft?: (id: string) => string;
  }
) {
  const FORM_KEY = `${type}Draft`;
  const FORM_META_KEY = `${type}DraftMeta`;

  const form = useForm<T>({ defaultValues });
  const [loadedDraft, setLoadedDraft] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftMeta, setDraftMeta] = useState<any>(null);

  // 🔹 Step 1: Check for draft (local or backend)
  useEffect(() => {
    const checkDraft = async () => {
      try {
        const localDraft = localStorage.getItem(FORM_KEY);
        const localMeta = localStorage.getItem(FORM_META_KEY);

        if (localDraft) {
          const parsedDefaultValues = JSON.stringify(defaultValues);

          if (!equal(normalize(localDraft), normalize(parsedDefaultValues))) {
            setShowDraftModal(true);
            if (localMeta) setDraftMeta(JSON.parse(localMeta));
            return;
          }
        }

        // 🔸 Check backend (optional)
        const getDraftUrl =
          endpoints?.getDraft ?? `/${type}/get-draft-${type}`;
        const res = await axiosInstance.get(getDraftUrl);

        if (res.data?.draft) {
          const draft = res.data.draft;
          localStorage.setItem(FORM_META_KEY, JSON.stringify({ id: draft.id }));
          localStorage.setItem(FORM_KEY, JSON.stringify(draft));

          if (!equal(draft, defaultValues)) {
            setDraftMeta({ id: draft.id });
            setShowDraftModal(true);
            return;
          }
        }

        setLoadedDraft(true);
      } catch (error) {
        console.error(`Error checking ${type} draft:`, error);
        setLoadedDraft(true);
      }
    };

    checkDraft();
  }, [defaultValues, type]);

  // 🔹 Step 2: Auto-save locally on change
  useEffect(() => {
    const subscription = form.watch((values) => {
      localStorage.setItem(FORM_KEY, JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // 🔹 Step 3: Actions
  const handleLoadDraft = () => {
    const savedDraft = localStorage.getItem(FORM_KEY);
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);
      form.reset(draftData);
      toast.success(`${type} draft loaded successfully!`);
    }
    setShowDraftModal(false);
    setLoadedDraft(true);
  };

  const handleDiscardDraft = async () => {
    try {
      if (draftMeta?.id) {
        const deleteUrl = endpoints?.deleteDraft
          ? endpoints.deleteDraft(draftMeta.id)
          : `/${type}/permanent-delete-${type}/${draftMeta.id}`;

        await axiosInstance.delete(deleteUrl);
      }

      localStorage.removeItem(FORM_KEY);
      localStorage.removeItem(FORM_META_KEY);
      toast.success(`${type} draft discarded successfully!`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || `Failed to discard ${type} draft`
      );
    } finally {
      setShowDraftModal(false);
      setLoadedDraft(true);
    }
  };

  const handleCancelDraft = () => {
    setShowDraftModal(false);
    setLoadedDraft(true);
  };

  return {
    ...form,
    loadedDraft,
    showDraftModal,
    setShowDraftModal,
    handleLoadDraft,
    handleDiscardDraft,
    handleCancelDraft,
  };
}

export default useFormDraft;
