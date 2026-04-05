export type Book = {
  /** UUID v4 */
  id: string;
  /** 1-30文字 */
  title: string;
  /** Base64エンコード画像データ */
  imageData: string;
  /** YYYY-MM-DD 形式、未読の場合は null */
  lastReadDate: string | null;
  /** YYYY-MM-DD 形式 */
  createdAt: string;
};
