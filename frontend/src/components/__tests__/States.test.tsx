import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";
import { Spinner, PageLoader } from "../ui/Spinner";

describe("EmptyState", () => {
  it("renders a title and description", () => {
    render(<EmptyState title="No readings yet" description="Data arrives once the device reports." />);
    expect(screen.getByText("No readings yet")).toBeInTheDocument();
    expect(screen.getByText(/Data arrives/)).toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("renders the error message and a retry control", () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Could not load data." onRetry={onRetry} />);
    expect(screen.getByText("Could not load data.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("calls onRetry when the retry button is clicked", async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="x" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("Spinner / PageLoader (loading state)", () => {
  it("Spinner exposes an accessible loading status", () => {
    render(<Spinner label="Loading device data…" />);
    expect(screen.getByText("Loading device data…")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("PageLoader renders an accessible loading status", () => {
    const { container } = render(<PageLoader />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    // Ensure it rendered something.
    expect(container.firstChild).toBeTruthy();
  });
});
