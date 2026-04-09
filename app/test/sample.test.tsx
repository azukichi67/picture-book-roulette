import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("テストセットアップの sanity check", () => {
  it("React コンポーネントがレンダリングできる", () => {
    render(<div>えほんガチャ</div>);
    expect(screen.getByText("えほんガチャ")).toBeInTheDocument();
  });

  it("localStorage の読み書きができる", () => {
    localStorage.setItem("sample-key", "sample-value");
    expect(localStorage.getItem("sample-key")).toBe("sample-value");
  });
});
