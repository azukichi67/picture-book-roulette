import type { Book } from "~/types/book";

const STORAGE_KEY = "ehon-gacha-books";

export class StorageQuotaError extends Error {
  constructor(cause: unknown) {
    super("データを保存できませんでした。不要な絵本を削除してください。");
    this.name = "StorageQuotaError";
    this.cause = cause;
  }
}

function saveBooks(books: Book[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.code === 22)
    ) {
      throw new StorageQuotaError(error);
    }
    throw error;
  }
}

function isBook(value: unknown): value is Book {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.imageData === "string" &&
    (obj.lastReadDate === null || typeof obj.lastReadDate === "string") &&
    typeof obj.createdAt === "string"
  );
}

export function getBooks(): Book[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isBook);
  } catch {
    console.warn("localStorage のデータが破損しています。初期化します。");
    return [];
  }
}

export function addBook(book: Book): void {
  const books = getBooks();
  saveBooks([...books, book]);
}

export function deleteBook(id: string): void {
  const books = getBooks();
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new Error(`Book not found: ${id}`);
  }
  saveBooks(books.filter((book) => book.id !== id));
}

export function updateBook(book: Book): void {
  const books = getBooks();
  const index = books.findIndex((b) => b.id === book.id);
  if (index === -1) {
    throw new Error(`Book not found: ${book.id}`);
  }
  books[index] = book;
  saveBooks(books);
}
