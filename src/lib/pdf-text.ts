"use client";

// Extracts plain text from a PDF file in the browser using pdf.js.
// Client-side keeps the server stateless and avoids file-upload plumbing —
// only the extracted text is sent on to the AI parser.
//
// The worker is loaded from a CDN pinned to the installed version, which is the
// most robust option across bundlers (no build-time URL resolution needed).
const PDFJS_VERSION = "6.0.227";

export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;

  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .filter(Boolean);
    text += strings.join(" ") + "\n";
  }
  return text.trim();
}
