import type { PropsWithChildren } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { TelegramProvider } from "@/shared/context/TelegramContext";
import { NotificationsProvider } from "@/domains/notifications/context/NotificationsContext";
import { ThemeProvider } from "@/shared/theme/ThemeProvider";

interface AppProvidersProps {
  queryClient: QueryClient;
  tonManifestUrl: string;
}

export function AppProviders({
  children,
  queryClient,
  tonManifestUrl,
}: PropsWithChildren<AppProvidersProps>) {
  return (
    <ThemeProvider>
      <TonConnectUIProvider manifestUrl={tonManifestUrl}>
        <TelegramProvider>
          <QueryClientProvider client={queryClient}>
            <NotificationsProvider>{children}</NotificationsProvider>
          </QueryClientProvider>
        </TelegramProvider>
      </TonConnectUIProvider>
    </ThemeProvider>
  );
}
