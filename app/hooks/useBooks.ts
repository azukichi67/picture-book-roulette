import { useCallback, useState } from "react";
import * as bookService from "~/services/book-service";
import { StorageQuotaError } from "~/services/book-service";
import type { Book } from "~/types/book";
import { todayYmd } from "~/utils/date";

export type UseBooksReturn = {
  books: Book[];
  addBook: (title: string, imageData: string) => void;
  deleteBook: (id: string) => void;
  recordRead: (id: string) => void;
  error: string | null;
};

const UNEXPECTED_ERROR_MESSAGE = "予期しないエラーが発生しました。";

export const useBooks = (): UseBooksReturn => {
  const [books, setBooks] = useState<Book[]>(() => bookService.getBooks());
  const [error, setError] = useState<string | null>(null);

  const applyBooksUpdate = useCallback((operation: () => void) => {
    try {
      operation();
      setBooks(bookService.getBooks());
      setError(null);
    } catch (err) {
      if (err instanceof StorageQuotaError) {
        setError(err.message);
        return;
      }
      console.error(err);
      setError(UNEXPECTED_ERROR_MESSAGE);
    }
  }, []);

  const addBook = useCallback(
    (title: string, imageData: string) => {
      applyBooksUpdate(() => {
        bookService.addBook({
          id: crypto.randomUUID(),
          title,
          imageData,
          lastReadDate: null,
          createdAt: todayYmd(),
        });
      });
    },
    [applyBooksUpdate],
  );

  const deleteBook = useCallback(
    (id: string) => {
      applyBooksUpdate(() => {
        bookService.deleteBook(id);
      });
    },
    [applyBooksUpdate],
  );

  const recordRead = useCallback(
    (id: string) => {
      applyBooksUpdate(() => {
        const target = bookService.getBooks().find((b) => b.id === id);
        if (!target) {
          throw new Error(`Book not found: ${id}`);
        }
        bookService.updateBook({ ...target, lastReadDate: todayYmd() });
      });
    },
    [applyBooksUpdate],
  );

  return { books, addBook, deleteBook, recordRead, error };
};
