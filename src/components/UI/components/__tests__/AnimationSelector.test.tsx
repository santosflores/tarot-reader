import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import { AnimationSelector } from "../AnimationSelector";
import { useAnimation } from "../../../../hooks/useAnimation";

describe("AnimationSelector", () => {
  beforeEach(() => {
    // Reset store state
    const store = useAnimation.getState();
    store.setCurrentAnimation("Idle");
    // Ensure 'Idle' and 'Wave' are in available animations for testing
    // Note: The store initializes with DEFAULT_ANIMATION and AVAILABLE_ANIMATIONS
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders current animation and allows selection", () => {
    render(<AnimationSelector />);

    // Check if the current animation is displayed
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("Idle");

    // Verify options exist
    expect(screen.getByRole("option", { name: "Idle" })).toBeInTheDocument();

    // Test changing animation
    const available = useAnimation.getState().availableAnimations;
    if (available.length > 1) {
      const nextAnimation = available.find((a) => a !== "Idle") || available[0];

      fireEvent.change(select, { target: { value: nextAnimation } });

      expect(useAnimation.getState().currentAnimation).toBe(nextAnimation);
    }
  });
});
