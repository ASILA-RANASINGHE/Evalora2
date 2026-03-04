import type { PDFPageProxy } from "pdfjs-dist";
import type { BoundingBox } from "@/app/protected/chat/types";

interface TextItemWithTransform {
  str: string;
  transform: number[];
  width: number;
  height: number;
  hasEOL?: boolean;
}

export async function findTextPosition(
  page: PDFPageProxy,
  searchText: string,
  scale: number
): Promise<BoundingBox | null> {
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale });

  for (const item of textContent.items) {
    if (!("str" in item)) continue;
    const textItem = item as TextItemWithTransform;
    if (!textItem.str.toLowerCase().includes(searchText.toLowerCase()))
      continue;

    // transform: [scaleX, skewY, skewX, scaleY, translateX, translateY]
    const tx = textItem.transform[4];
    const ty = textItem.transform[5];
    const itemHeight = Math.abs(textItem.transform[3]);

    // Convert PDF user-space coordinates to viewport (canvas) coordinates
    const [canvasX, canvasY] = viewport.convertToViewportPoint(tx, ty);

    // PDF origin is bottom-left, canvas is top-left
    // convertToViewportPoint already flips Y for us
    const normalizedX = canvasX / viewport.width;
    const normalizedY = (canvasY - itemHeight * scale) / viewport.height;
    const normalizedW = (textItem.width * scale) / viewport.width;
    const normalizedH = (itemHeight * scale) / viewport.height;

    return {
      x: Math.max(0, normalizedX - 0.01),
      y: Math.max(0, normalizedY - 0.01),
      width: Math.min(1 - normalizedX, normalizedW + 0.02),
      height: Math.min(1 - normalizedY, normalizedH + 0.02),
    };
  }

  return null;
}

export async function findParagraphPosition(
  page: PDFPageProxy,
  paragraphIndex: number,
  scale: number
): Promise<BoundingBox | null> {
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale });

  // Group text items into paragraphs separated by EOL items
  const paragraphs: TextItemWithTransform[][] = [];
  let current: TextItemWithTransform[] = [];

  for (const item of textContent.items) {
    if (!("str" in item)) continue;
    const textItem = item as TextItemWithTransform;
    current.push(textItem);
    if (textItem.hasEOL) {
      if (current.length > 0) {
        paragraphs.push(current);
      }
      current = [];
    }
  }
  if (current.length > 0) paragraphs.push(current);

  if (paragraphIndex >= paragraphs.length) return null;

  const para = paragraphs[paragraphIndex];
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const textItem of para) {
    const tx = textItem.transform[4];
    const ty = textItem.transform[5];
    const itemHeight = Math.abs(textItem.transform[3]);

    const [cx, cy] = viewport.convertToViewportPoint(tx, ty);
    const top = cy - itemHeight * scale;
    const bottom = cy;
    const right = cx + textItem.width * scale;

    minX = Math.min(minX, cx);
    minY = Math.min(minY, top);
    maxX = Math.max(maxX, right);
    maxY = Math.max(maxY, bottom);
  }

  return {
    x: Math.max(0, minX / viewport.width - 0.01),
    y: Math.max(0, minY / viewport.height - 0.01),
    width: Math.min(1, (maxX - minX) / viewport.width + 0.02),
    height: Math.min(1, (maxY - minY) / viewport.height + 0.02),
  };
}
