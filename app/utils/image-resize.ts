const MAX_LONG_SIDE = 500;
const JPEG_QUALITY = 0.85;
const OUTPUT_MIME_TYPE = "image/jpeg";
const ALLOWED_INPUT_MIME_TYPES = ["image/jpeg", "image/png"] as const;

export class ImageResizeError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = "ImageResizeError";
  }
}

const calculateResizedDimensions = (
  width: number,
  height: number,
): { width: number; height: number } => {
  if (Math.max(width, height) <= MAX_LONG_SIDE) {
    return { width, height };
  }
  if (width >= height) {
    return {
      width: MAX_LONG_SIDE,
      height: Math.round((height * MAX_LONG_SIDE) / width),
    };
  }
  return {
    width: Math.round((width * MAX_LONG_SIDE) / height),
    height: MAX_LONG_SIDE,
  };
};

const readFileAsDataUrl = async (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new ImageResizeError("ファイルの読み込み結果が不正です"));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () =>
      reject(
        new ImageResizeError("ファイルの読み込みに失敗しました", reader.error),
      );
    reader.readAsDataURL(file);
  });

const loadImage = async (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (event) =>
      reject(new ImageResizeError("画像の読み込みに失敗しました", event));
    img.src = dataUrl;
  });

const drawToJpegDataUrl = (
  img: HTMLImageElement,
  width: number,
  height: number,
): string => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new ImageResizeError("Canvas コンテキストを取得できませんでした");
  }

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL(OUTPUT_MIME_TYPE, JPEG_QUALITY);
};

export const resizeImage = async (file: File): Promise<string> => {
  if (
    !ALLOWED_INPUT_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_INPUT_MIME_TYPES)[number],
    )
  ) {
    throw new ImageResizeError("対応していない画像形式です");
  }

  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);
  const { width, height } = calculateResizedDimensions(
    img.naturalWidth,
    img.naturalHeight,
  );
  return drawToJpegDataUrl(img, width, height);
};
