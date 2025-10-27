import { toast } from "@/shared/hooks/useToast";

type ToastInput =
  | string
  | {
      message?: string;
      title?: string;
      description?: string;
      duration?: number;
    };

const normalizeToastInput = (input: ToastInput) => {
  if (typeof input === "string") {
    return {
      title: input,
      description: undefined,
      duration: undefined,
    };
  }

  const title = input.title ?? input.message ?? "";

  return {
    title,
    description: input.description,
    duration: input.duration,
  };
};

const showToast = {
  success: (input: ToastInput) => {
    const { title, description, duration } = normalizeToastInput(input);

    toast({
      title,
      description,
      duration,
      variant: "default",
    });
  },
  error: (input: ToastInput) => {
    const { title, description, duration } = normalizeToastInput(input);

    toast({
      title,
      description,
      duration,
      variant: "destructive",
    });
  },
};

export { showToast };
export type { ToastInput };
