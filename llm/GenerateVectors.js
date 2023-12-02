// 1. Import document loaders for different file formats
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// 3. Import Tiktoken for token counting
import { Tiktoken } from "@dqbd/tiktoken/lite";
import { load } from "@dqbd/tiktoken/load";
import registry from "@dqbd/tiktoken/registry.json" assert { type: "json" };
import models from "@dqbd/tiktoken/model_to_encoding.json" assert { type: "json" };

// 4. Import dotenv for loading environment variables and fs for file system operations
import dotenv from "dotenv";
dotenv.config();

const VECTOR_STORE_PATH = "Documents.index";

const COST_LIMIT = 1;
// 5. Initialize the document loader with supported file formats
const loader = new DirectoryLoader("./documents", {
    ".json": (path) => new JSONLoader(path),
    ".txt": (path) => new TextLoader(path),
    ".csv": (path) => new CSVLoader(path),
    ".pdf": (path) => new PDFLoader(path),
});

// 7. Define a function to calculate the cost of tokenizing the documents
async function calculateCost(docs) {
    const modelName = "text-embedding-ada-002";
    const modelKey = models[modelName];
    const model = await load(registry[modelKey]);
    const encoder = new Tiktoken(
        model.bpe_ranks,
        model.special_tokens,
        model.pat_str
    );
    const tokens = encoder.encode(JSON.stringify(docs));
    const tokenCount = tokens.length;
    const ratePerThousandTokens = 0.0004;
    const cost = (tokenCount / 1000) * ratePerThousandTokens;
    encoder.free();
    return cost;
}

// 8. Define a function to normalize the content of the documents
function normalizeDocuments(docs) {
    return docs.map((doc) => {
        if (typeof doc.pageContent === "string") {
        return doc.pageContent;
        } else if (Array.isArray(doc.pageContent)) {
        return doc.pageContent.join("\n");
        }
    });
}

export const generateVectors = async () => {
    console.log("Loading docs... GM");
    const docs = await loader.load();
    console.log("Docs loaded.");

    const cost = await calculateCost(docs);
    if (cost > COST_LIMIT) {
        throw new Error('Training cost exceeded the threshold cost aborting.');
    }

    console.log("cost "+cost);

    console.log("Creating new vector store...");
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
    });

    const normalizedDocs = normalizeDocuments(docs);
    const splitDocs = await textSplitter.createDocuments(normalizedDocs);

    // 16. Generate the vector store from the documents
    let vectorStore = await HNSWLib.fromDocuments(
        splitDocs,
        new OpenAIEmbeddings()
    );

    await vectorStore.save(VECTOR_STORE_PATH);
}
