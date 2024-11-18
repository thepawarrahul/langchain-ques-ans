import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { RetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "@langchain/openai";

dotenv.config();

const VECTOR_STORE_PATH = "Documents.index";

export const queryAi = async (question) => {
    const model = new ChatOpenAI({
      model: "gpt-4o",
    });

    let vectorStore;

    console.log("Loading existing vector store...");
      vectorStore = await HNSWLib.load(
      VECTOR_STORE_PATH,
      new OpenAIEmbeddings()
    );
    
    console.log("Vector store loaded.");

    // 18. Create a retrieval chain using the language model and vector store
    console.log("Creating retrieval chain...");
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

    // 19. Query the retrieval chain with the specified question
    console.log("Querying chain...");

    console.log("Question that was send : "+question);
    const res = await chain.call({ query: question });
    console.log({ res });

    return res.text;
}
