import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEY } from "~/services/book-service";
import type { Book } from "~/types/book";
import { todayYmd } from "~/utils/date";
import { useBooks } from "./useBooks";

const sampleBook = (overrides: Partial<Book> = {}): Book => ({
  id: "00000000-0000-4000-8000-000000000000",
  title: "ぐりとぐら",
  imageData: "data:image/png;base64,AAAA",
  lastReadDate: null,
  createdAt: "2026-04-01",
  ...overrides,
});

const seed = (books: Book[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useBooks", () => {
  it("マウント時に localStorage の内容を同期的に読み込む（ちらつきなし）", () => {
    const initial = sampleBook();
    seed([initial]);

    const { result } = renderHook(() => useBooks());

    expect(result.current.books).toEqual([initial]);
  });

  it("addBook で localStorage と state が更新され、id / createdAt が付与される", () => {
    const { result } = renderHook(() => useBooks());

    act(() => {
      result.current.addBook("てぶくろ", "data:image/png;base64,BBBB");
    });

    expect(result.current.books).toHaveLength(1);
    const [added] = result.current.books;
    expect(added.title).toBe("てぶくろ");
    expect(added.imageData).toBe("data:image/png;base64,BBBB");
    expect(added.lastReadDate).toBeNull();
    expect(added.createdAt).toBe(todayYmd());
    expect(added.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(result.current.error).toBeNull();

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe("てぶくろ");
  });

  it("複数件 addBook しても追加順が保たれる", () => {
    const { result } = renderHook(() => useBooks());

    act(() => {
      result.current.addBook("A", "data:image/png;base64,AAAA");
    });
    act(() => {
      result.current.addBook("B", "data:image/png;base64,BBBB");
    });
    act(() => {
      result.current.addBook("C", "data:image/png;base64,CCCC");
    });

    expect(result.current.books.map((b) => b.title)).toEqual(["A", "B", "C"]);
  });

  it("deleteBook で対象の絵本が削除される", () => {
    const target = sampleBook({ id: "id-1", title: "A" });
    const other = sampleBook({ id: "id-2", title: "B" });
    seed([target, other]);

    const { result } = renderHook(() => useBooks());

    act(() => {
      result.current.deleteBook("id-1");
    });

    expect(result.current.books).toEqual([other]);
    expect(result.current.error).toBeNull();
  });

  it("deleteBook で存在しない id を渡すと error state が設定される", () => {
    seed([sampleBook()]);
    const { result } = renderHook(() => useBooks());

    act(() => {
      result.current.deleteBook("non-existent-id");
    });

    expect(result.current.error).toBe("予期しないエラーが発生しました。");
  });

  it("recordRead で対象の lastReadDate が当日日付になる", () => {
    const target = sampleBook({ id: "id-1" });
    seed([target]);

    const { result } = renderHook(() => useBooks());

    act(() => {
      result.current.recordRead("id-1");
    });

    expect(result.current.books[0].lastReadDate).toBe(todayYmd());
  });

  it("recordRead で存在しない id を渡すと error state が設定される", () => {
    seed([sampleBook({ id: "id-1" })]);
    const { result } = renderHook(() => useBooks());

    act(() => {
      result.current.recordRead("missing-id");
    });

    expect(result.current.error).toBe("予期しないエラーが発生しました。");
  });

  it("容量超過エラー時は StorageQuotaError のメッセージが error state に入り、books は変更されない", () => {
    const initial = sampleBook();
    seed([initial]);

    const { result } = renderHook(() => useBooks());
    expect(result.current.books).toEqual([initial]);

    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("quota exceeded", "QuotaExceededError");
      });

    act(() => {
      result.current.addBook("new", "data:image/png;base64,CCCC");
    });

    expect(result.current.error).toMatch(/保存できませんでした/);
    expect(result.current.books).toEqual([initial]);
    expect(setItemSpy).toHaveBeenCalled();
  });

  it("成功する操作の後は error がクリアされる", () => {
    seed([sampleBook()]);

    const { result } = renderHook(() => useBooks());

    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementationOnce(() => {
        throw new DOMException("quota", "QuotaExceededError");
      });

    act(() => {
      result.current.addBook("fail", "data:image/png;base64,DDDD");
    });
    expect(result.current.error).not.toBeNull();

    setItemSpy.mockRestore();

    act(() => {
      result.current.addBook("ok", "data:image/png;base64,EEEE");
    });
    expect(result.current.error).toBeNull();
  });
});
