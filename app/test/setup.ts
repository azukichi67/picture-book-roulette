/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

// 各テストケースの独立性を担保するため、localStorage を毎ケースクリアする
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});
