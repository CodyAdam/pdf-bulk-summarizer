import { getDocument } from "pdfjs-legacy";

export async function extractTextFromPdf(pdfInputPath: string) {
  const file = await Deno.readFile(pdfInputPath);

  // Load PDF document with options
  const loadingTask = getDocument({
    data: file,
  });
  const pdf = await loadingTask.promise;

  let fullText = "";
  const totalPages = pdf.numPages;

  // Extract text from each page
  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent({
      includeMarkedContent: false,
    });
    const pageText = textContent.items
      .map((item) => (item as { str: string }).str)
      .join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
}
