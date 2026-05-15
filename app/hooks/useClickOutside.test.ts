import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useClickOutside } from "./useClickOutside";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a real DOM element attached to document.body so that
 *  contains() and event dispatch behave exactly as they would in a browser. */
function createAttachedElement() {
  const element = document.createElement("div");
  document.body.appendChild(element);
  return element;
}

function cleanupElement(element: HTMLElement) {
  document.body.removeChild(element);
}

/** Fires a native click event on the given target. */
function clickOn(target: HTMLElement | Document) {
  target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useClickOutside", () => {
  const mockCallback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Callback invocation
  // -------------------------------------------------------------------------

  describe("callback invocation", () => {
    it("calls the callback when a click occurs outside the referenced element", () => {
      const element = createAttachedElement();
      const ref = { current: element };

      renderHook(() => useClickOutside(ref, mockCallback));

      clickOn(document.body);

      expect(mockCallback).toHaveBeenCalledTimes(1);

      cleanupElement(element);
    });

    it("does not call the callback when a click occurs on the referenced element itself", () => {
      const element = createAttachedElement();
      const ref = { current: element };

      renderHook(() => useClickOutside(ref, mockCallback));

      clickOn(element);

      expect(mockCallback).not.toHaveBeenCalled();

      cleanupElement(element);
    });

    it("does not call the callback when a click occurs on a child of the referenced element", () => {
      const parent = createAttachedElement();
      const child = document.createElement("span");
      parent.appendChild(child);
      const ref = { current: parent };

      renderHook(() => useClickOutside(ref, mockCallback));

      clickOn(child);

      expect(mockCallback).not.toHaveBeenCalled();

      cleanupElement(parent);
    });

    it("calls the callback once per outside click", () => {
      const element = createAttachedElement();
      const ref = { current: element };

      renderHook(() => useClickOutside(ref, mockCallback));

      clickOn(document.body);
      clickOn(document.body);
      clickOn(document.body);

      expect(mockCallback).toHaveBeenCalledTimes(3);

      cleanupElement(element);
    });

    it("does not call the callback when ref.current is null", () => {
      const ref = { current: null } as any;

      renderHook(() => useClickOutside(ref, mockCallback));

      clickOn(document.body);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("does not call the callback when ref.current is undefined", () => {
      const ref = { current: undefined } as any;

      renderHook(() => useClickOutside(ref, mockCallback));

      clickOn(document.body);

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Event listener lifecycle
  // -------------------------------------------------------------------------

  describe("event listener lifecycle", () => {
    it("adds a click listener to the document on mount", () => {
      const addSpy = vi.spyOn(document, "addEventListener");
      const ref = { current: document.createElement("div") };

      renderHook(() => useClickOutside(ref, mockCallback));

      expect(addSpy).toHaveBeenCalledWith("click", expect.any(Function));

      addSpy.mockRestore();
    });

    it("removes the click listener from the document on unmount", () => {
      const removeSpy = vi.spyOn(document, "removeEventListener");
      const ref = { current: document.createElement("div") };

      const { unmount } = renderHook(() => useClickOutside(ref, mockCallback));
      unmount();

      expect(removeSpy).toHaveBeenCalledWith("click", expect.any(Function));

      removeSpy.mockRestore();
    });

    it("does not call the callback after the hook has been unmounted", () => {
      const element = createAttachedElement();
      const ref = { current: element };

      const { unmount } = renderHook(() => useClickOutside(ref, mockCallback));
      unmount();

      clickOn(document.body);

      expect(mockCallback).not.toHaveBeenCalled();

      cleanupElement(element);
    });
  });

  // -------------------------------------------------------------------------
  // Multiple hook instances
  // -------------------------------------------------------------------------

  describe("multiple instances", () => {
    it("each instance fires its own callback independently on an outside click", () => {
      const callbackA = vi.fn();
      const callbackB = vi.fn();

      const elementA = createAttachedElement();
      const elementB = createAttachedElement();

      renderHook(() => useClickOutside({ current: elementA }, callbackA));
      renderHook(() => useClickOutside({ current: elementB }, callbackB));

      // Click outside both elements
      clickOn(document.body);

      expect(callbackA).toHaveBeenCalledTimes(1);
      expect(callbackB).toHaveBeenCalledTimes(1);

      cleanupElement(elementA);
      cleanupElement(elementB);
    });

    it("clicking inside element A does not trigger callback A but does trigger callback B", () => {
      const callbackA = vi.fn();
      const callbackB = vi.fn();

      const elementA = createAttachedElement();
      const elementB = createAttachedElement();

      renderHook(() => useClickOutside({ current: elementA }, callbackA));
      renderHook(() => useClickOutside({ current: elementB }, callbackB));

      clickOn(elementA);

      expect(callbackA).not.toHaveBeenCalled();
      expect(callbackB).toHaveBeenCalledTimes(1);

      cleanupElement(elementA);
      cleanupElement(elementB);
    });
  });
});
