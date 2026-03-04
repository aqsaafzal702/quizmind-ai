import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { chunkText } from "@/lib/chunker";
import { embedBatch } from "@/lib/embedder";
import { saveDocument, saveChunk, initDb } from "@/lib/db";
import type { ApiResponse, IngestResponse } from "@/types";
import { extractText } from 'unpdf'

export async function POST(req: NextRequest) {
  try {
    // Initialize Turso DB
    await initDb()

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "text/html",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".md")) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Only PDF, TXT, MD and HTML files allowed" },
        { status: 400 },
      );
    }

    console.log(`Processing file: ${file.name} (${file.type})`);

    // Extract text based on file type
    let text = "";
    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      const { text: pdfText } = await extractText(uint8Array, { mergePages: true })
      text = pdfText
    } else if (file.type === "text/html") {
      const htmlContent = await file.text();
      const cheerio = await import("cheerio");
      const $ = cheerio.load(htmlContent);
      $("script, style").remove();
      text = $("body").text();
    } else {
      // Handle TXT and MD
      text = await file.text();
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Could not extract text from file" },
        { status: 400 },
      );
    }

    console.log(`Extracted ${text.length} characters from ${file.name}`);

    // Generate document ID
    const documentId = randomUUID();

    // Save document to database
    await saveDocument(documentId, file.name, text);

    // Chunk the text
    const chunks = chunkText(text, file.name);
    console.log(`Created ${chunks.length} chunks`);

    // Embed all chunks
    console.log("Embedding chunks...");
    const chunkTexts = chunks.map((c) => c.text);
    const embeddings = await embedBatch(chunkTexts);

    // Save all chunks to database
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];

      await saveChunk(
        chunk.id,
        documentId,
        chunk.text,
        chunk.metadata.chunkIndex,
        chunk.metadata.totalChunks,
        chunk.metadata.startChar,
        chunk.metadata.endChar,
        embedding,
      );
    }

    console.log(`Successfully ingested ${file.name}`);

    return NextResponse.json<ApiResponse<IngestResponse>>({
      success: true,
      data: {
        documentId,
        filename: file.name,
        totalChunks: chunks.length,
      },
    });
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process file",
      },
      { status: 500 },
    );
  }
}