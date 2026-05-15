import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import "@testing-library/jest-dom";

// Extends Vitest's 'expect' with RTL matchers
expect.extend(matchers);

// Runs a cleanup after each test case (e.g., clearing the DOM)
afterEach(() => {
  cleanup();
});
