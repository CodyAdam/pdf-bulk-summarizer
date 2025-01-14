# Usage

1. Download/clone the project ([zip](https://github.com/CodyAdam/pdf-bulk-summarizer/archive/refs/heads/main.zip))
2. Install Deno at https://docs.deno.com/runtime/getting_started/installation/
3. Create a `.env` file in the root of the project with the API keys for the models you want to use. See [`.env.example`](.env.example) for an example.
4. (Optional) Change the model you want to use in [`src/model.ts`](src/model.ts)
5. Run `deno run -A src/main.ts`

# Notes

By default, the PDF files will be sent directly to the model. For models like Perplexity that don't support file input, you can change this behavior by setting `EXTRACT_TEXT = true` in [`src/main.ts`](src/main.ts) to extract and send the text content instead.
