import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DemoBanner } from "../common/DemoBanner";

describe("DemoBanner", () => {
  it("clearly labels demo mode as sample data", () => {
    render(<DemoBanner onExit={() => {}} />);
    expect(screen.getByText("Demo mode.")).toBeInTheDocument();
    expect(screen.getByText(/sample data/i)).toBeInTheDocument();
  });

  it("calls onExit when the exit button is clicked", async () => {
    const onExit = vi.fn();
    render(<DemoBanner onExit={onExit} />);
    await userEvent.click(screen.getByRole("button", { name: /exit demo mode/i }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
