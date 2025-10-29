import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PageLayout from "@/shared/components/layout/PageLayout";
import { PageLayoutComponentsProvider } from "@/shared/components/layout/PageLayoutContext";

vi.mock("@/shared/components/layout/NavbarEnhanced", () => ({
  default: () => <nav data-testid="default-navbar">Default Navbar</nav>,
}));

vi.mock("@/shared/components/layout/FooterNav", () => ({
  default: () => <footer data-testid="default-footer">Default Footer</footer>,
}));

describe("PageLayout", () => {
  it("renders default navbar and footer when enabled", () => {
    render(
      <PageLayout>
        <div>Content</div>
      </PageLayout>,
    );

    expect(screen.getByTestId("default-navbar")).toBeInTheDocument();
    expect(screen.getByTestId("default-footer")).toBeInTheDocument();
  });

  it("hides navbar and footer when toggles are disabled", () => {
    render(
      <PageLayout showNavbar={false} showFooter={false}>
        <div>Content</div>
      </PageLayout>,
    );

    expect(screen.queryByTestId("default-navbar")).not.toBeInTheDocument();
    expect(screen.queryByTestId("default-footer")).not.toBeInTheDocument();
    expect(screen.getByRole("main")).not.toHaveClass("pb-20");
  });

  it("allows overriding layout slots via props and context", () => {
    const ContextNavbar = () => (
      <header data-testid="context-navbar">Context Navbar</header>
    );
    const PropNavbar = () => (
      <header data-testid="prop-navbar">Prop Navbar</header>
    );
    const PropFooter = () => (
      <footer data-testid="prop-footer">Prop Footer</footer>
    );

    render(
      <PageLayoutComponentsProvider navbar={ContextNavbar}>
        <PageLayout navbar={PropNavbar} footer={<PropFooter />}>
          <div>Content</div>
        </PageLayout>
      </PageLayoutComponentsProvider>,
    );

    expect(screen.getByTestId("prop-navbar")).toBeInTheDocument();
    expect(screen.queryByTestId("context-navbar")).not.toBeInTheDocument();
    expect(screen.getByTestId("prop-footer")).toBeInTheDocument();
  });

  it("falls back to context components when props are not provided", () => {
    const ContextFooter = () => (
      <footer data-testid="context-footer">Context Footer</footer>
    );

    render(
      <PageLayoutComponentsProvider footer={ContextFooter}>
        <PageLayout showNavbar={false}>
          <div>Content</div>
        </PageLayout>
      </PageLayoutComponentsProvider>,
    );

    expect(screen.getByTestId("context-footer")).toBeInTheDocument();
    expect(screen.queryByTestId("default-footer")).not.toBeInTheDocument();
  });
});

