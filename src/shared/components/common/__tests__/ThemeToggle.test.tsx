import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import ThemeToggle from "@/shared/components/common/ThemeToggle";
import { ThemeProvider } from "@/shared/theme/ThemeProvider";

describe("ThemeToggle", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("dark") ? false : true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  it("renders theme options and persists the selected preference", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle showLabels showStatusText={false} />
      </ThemeProvider>,
    );

    const darkOption = await screen.findByRole("radio", { name: /الوضع الداكن/i });
    expect(darkOption).toBeInTheDocument();

    await user.click(darkOption);

    await waitFor(() => {
      expect(window.localStorage.getItem("exaado-theme")).toBe("dark");
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    const lightOption = screen.getByRole("radio", { name: /الوضع الفاتح/i });
    await user.click(lightOption);

    await waitFor(() => {
      expect(window.localStorage.getItem("exaado-theme")).toBe("light");
    });
  });
});
