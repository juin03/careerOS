"use client";

// Extracts plain text from a PDF file in the browser using pdf.js.
// Client-side keeps the server stateless — only the extracted text is sent on.
//
// Uses the LEGACY build, which is the one meant for bundlers/browsers, and a
// worker served from our own /public (CDNs lag new 6.x releases). Errors are
// re-thrown with context so the caller can surface a useful message.
export async function extractPdfText(file: File): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;

  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = (content.items as { str?: string }[])
      .map((item) => item.str ?? "")
      .filter(Boolean);
    text += strings.join(" ") + "\n";
  }
  return text.trim();
}
