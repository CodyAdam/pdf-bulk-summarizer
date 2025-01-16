import { streamText } from "ai";
import { promptConfig } from "./config.ts";
import { model } from "./model.ts";
import { extractTextFromPdf } from "./utils.ts";

// If this is true, the text will be extracted from the pdf file and sent to the model as text only.
// If this is false, the pdf file will be sent to the model as a file.
// This is for model that can't handle file input. (like Perplexity)
const EXTRACT_TEXT = false;
const INPUT_PATH = "./input"; // should not have a trailing slash
const OUTPUT_PATH = "./output"; // should not have a trailing slash

async function summarizePdf(
  prompt: { name: string; prompt: string },
  pdfInputPath: string,
  pdfOutputPath: string,
  extractText = false
) {
  try {
    const result = streamText({
      model: model,
      system: promptConfig.systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt.prompt,
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
    const file = await Deno.open(pdfOutputPath, {
      write: true,
      append: true,
    });
    const encoder = new TextEncoder();

    for await (const textPart of result.textStream) {
      await file.write(encoder.encode(textPart));
      characterCount += textPart.length;
      Deno.stdout.writeSync(
        new TextEncoder().encode(
          `\r    Writing in: ${pdfOutputPath} ${characterCount} characters`
        )
      );
    }
    console.log(
      `\r    ✅ Finished writing: ${pdfOutputPath} ${characterCount} characters`
    );
    file.close();
  } catch (error) {
    if (error instanceof Error) {
      console.error("    Error summarizing PDF:", error.message);
    } else {
      console.error("    Error summarizing PDF:", error);
    }
  }
}

console.log("Starting using prompt: ", Deno.env.get("PROMPT_USED"), "\n");

const pdfFiles: (Deno.DirEntry & { path: string })[] = [];

function scanDir(dirPath: string) {
  const items = [...Deno.readDirSync(dirPath)];
  for (const item of items) {
    if (item.isFile && item.name.endsWith(".pdf")) {
      pdfFiles.push({ ...item, path: `${dirPath}/${item.name}` });
    }
    if (item.isDirectory) {
      scanDir(`${dirPath}/${item.name}`);
    }
  }
}

scanDir(INPUT_PATH);

const totalFiles = pdfFiles.length;

for (const [index, file] of pdfFiles.entries()) {
  const outputPath = file.path
    .replace(INPUT_PATH, OUTPUT_PATH)
    .replace(".pdf", ".md");
  const percentage = (index / totalFiles) * 100;
  console.log(
    `\nProcessing (${index}/${totalFiles} - ${percentage.toFixed(0)}%): ${
      file.path
    } `
  );
  try {
    // Ensure output directory exists
    const outputDir = outputPath.substring(0, outputPath.lastIndexOf("/"));
    await Deno.mkdir(outputDir, { recursive: true });

    const fileInfo = await Deno.stat(outputPath);
    if (fileInfo.isFile) {
      console.log("  ⏭️  Skipping file: output already exists");
      continue;
    }
    const encoder = new TextEncoder();
    const f = await Deno.open(outputPath, {
      write: true,
      create: true,
    });
    await f.write(
      encoder.encode(`---
title: ${file.name}
---
      
# ${prompt.name}\n\n`)
    );
    f.close();
  } catch {
    // File doesn't exist, continue with processing
  }
  const prompts = promptConfig.prompts.map((p) => ({
    name: p.name,
    prompt: `${promptConfig.prefixForEach}\n${p.prompt}\n${promptConfig.suffixForEach}`,
  }));

  for (const prompt of prompts) {
    console.log("  Processing prompt:", prompt.name);
    await summarizePdf(prompt, file.path, outputPath, EXTRACT_TEXT);
  }
}
