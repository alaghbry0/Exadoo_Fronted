import { useCallback } from "react";

import { useToast } from "@/shared/hooks/useToast";

type CartItemType = "course" | "bundle" | "product";

interface CartItemInput {
  id: string;
  title: string;
  price?: string;
  type?: CartItemType;
}

export const useCartActions = () => {
  const { toast } = useToast();

  const addItemToCart = useCallback(
    ({ id, title, price, type: _type = "product" }: CartItemInput) => {
      if (!id || !title) {
        return;
      }

      toast({
        title: "تمت الإضافة إلى السلة",
        description: `${title}${price ? ` • ${price}` : ""}`,
      });
    },
    [toast],
  );

  return {
    addItemToCart,
  };
};

export type { CartItemInput };
