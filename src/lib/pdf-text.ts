"use client";

// Extracts plain text from a PDF file in the browser using pdf.js.
// Client-side keeps the server stateless and avoids file-upload plumbing —
// only the extracted text is sent on to the AI parser.
//
// The worker is served from our own /public so the version always matches the
// installed pdfjs-dist (CDNs lag new releases — 6.x 404s on cdnjs).
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

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
