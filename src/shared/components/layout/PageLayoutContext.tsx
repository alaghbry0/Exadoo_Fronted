import { ComponentType, ReactNode, createContext, useContext } from "react";

export type PageLayoutSlot = ReactNode | ComponentType;

interface PageLayoutComponentsContextValue {
  navbar?: PageLayoutSlot;
  footer?: PageLayoutSlot;
}

const PageLayoutComponentsContext = createContext<PageLayoutComponentsContextValue | undefined>(
  undefined,
);

interface PageLayoutComponentsProviderProps extends PageLayoutComponentsContextValue {
  children: ReactNode;
}

export function PageLayoutComponentsProvider({
  children,
  navbar,
  footer,
}: PageLayoutComponentsProviderProps) {
  return (
    <PageLayoutComponentsContext.Provider value={{ navbar, footer }}>
      {children}
    </PageLayoutComponentsContext.Provider>
  );
}

export function usePageLayoutComponents(): PageLayoutComponentsContextValue {
  return useContext(PageLayoutComponentsContext) ?? {};
}
