import { streamText } from "ai";
import { prompt } from "./config.ts";
import { model } from "./model.ts";
import { extractTextFromPdf } from "./utils.ts";

// If this is true, the text will be extracted from the pdf file and sent to the model as text only.
// If this is false, the pdf file will be sent to the model as a file.
// This is for model that can't handle file input. (like Perplexity)
const EXTRACT_TEXT = false;

async function summarizePdf(
  pdfInputPath: string,
  pdfOutputPath: string,
  extractText = false
) {
  try {
    const result = streamText({
      model: model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            extractText
              ? {
                  type: "text",
                  text: await extractTextFromPdf(pdfInputPath),
                }
              : {
                  type: "file",
                  mimeType: "application/pdf",
                  data: await Deno.readFile(pdfInputPath),
                },
          ],
        },
      ],
    });

    let characterCount = 0;
    const file = await Deno.open(pdfOutputPath, { write: true, create: true });
    const encoder = new TextEncoder();

    for await (const textPart of result.textStream) {
      await file.write(encoder.encode(textPart));
      characterCount += textPart.length;
      Deno.stdout.writeSync(
        new TextEncoder().encode(
          `\rWriting in: ${pdfOutputPath} ${characterCount} characters`
        )
      );
    }
    console.log(
      `\rFinished writing: ${pdfOutputPath} ${characterCount} characters`
    );
    file.close();
    console.log(result.finishReason);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error summarizing PDF:", error.message);
    } else {
      console.error("Error summarizing PDF:", error);
    }
  }
}

console.log("Starting using prompt: ", Deno.env.get("PROMPT_USED"), "\n");

const inputFolder = "./input/";
const outputFolder = "./output/";
// Get all PDF files and their count upfront
const allFiles = [...Deno.readDirSync(inputFolder)];
const pdfFiles = allFiles.filter((f): f is Deno.DirEntry =>
  f.name.endsWith(".pdf")
);
const totalFiles = pdfFiles.length;

for (const [index, file] of pdfFiles.entries()) {
  const fileIndex = index + 1;
  const pdfPath = `${inputFolder}${file.name}`;
  const outputPath = `${outputFolder}${file.name.replace(".pdf", ".md")}`;
  const percentage = (fileIndex / totalFiles) * 100;
  console.log(
    `\nStart Processing (${fileIndex}/${totalFiles} - ${percentage.toFixed(
      0
    )}%): ${file.name} `
  );

  await summarizePdf(pdfPath, outputPath, EXTRACT_TEXT);
}
