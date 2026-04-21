import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FIRST_LAUNCH_STORAGE_KEY, useFirstLaunch } from "./useFirstLaunch";

describe("useFirstLaunch", () => {
  it("フラグ未保存なら初期レンダリングから true を返す", () => {
    const { result } = renderHook(() => useFirstLaunch());
    expect(result.current.isFirstLaunch).toBe(true);
  });

  it("markLaunched() 後は isFirstLaunch が false になり、localStorage に記録される", () => {
    const { result } = renderHook(() => useFirstLaunch());

    act(() => {
      result.current.markLaunched();
    });

    expect(result.current.isFirstLaunch).toBe(false);
    expect(localStorage.getItem(FIRST_LAUNCH_STORAGE_KEY)).toBe("true");
  });

  it("markLaunched() で書き込んだフラグは再マウント後の起動でも false として読まれる", () => {
    const first = renderHook(() => useFirstLaunch());
    act(() => {
      first.result.current.markLaunched();
    });
    first.unmount();

    const second = renderHook(() => useFirstLaunch());
    expect(second.result.current.isFirstLaunch).toBe(false);
  });
});
