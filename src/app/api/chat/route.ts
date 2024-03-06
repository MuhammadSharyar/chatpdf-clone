// import { NextRequest } from "next/server";
// import {
//   Message as VercelChatMessage,
//   StreamingTextResponse,
//   LangChainStream,
// } from "ai";
// import { ChatOpenAI } from "langchain/chat_models/openai";
// import { BytesOutputParser } from "@langchain/core/output_parsers";
// import { PromptTemplate } from "@langchain/core/prompts";
// import { Pinecone } from "@pinecone-database/pinecone";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
// import { PineconeStore } from "@langchain/pinecone";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
// import { createRetrievalChain } from "langchain/chains/retrieval";

// // export const runtime = "edge";

// const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

// const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

// const textSplitter = new RecursiveCharacterTextSplitter();

// /**
//  * Basic memory formatter that stringifies and passes
//  * message history directly into the model.
//  */
// const formatMessage = (message: VercelChatMessage) => {
//   return `${message.role}: ${message.content}`;
// };

// const TEMPLATE = `Retrieve relevant contextual information from the data source and augment it with the user's prompt. Use this information to improve the model's output by incorporating external knowledge.

// <context>
// {context}
// </context>

// Current conversation:
// {chat_history}

// User: {input}
// AI:`;

// /*
//  * This handler initializes and calls a simple chain with a prompt,
//  * chat model, and output parser. See the docs for more information:
//  *
//  * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
//  */
// export async function POST(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const fileLink = searchParams.get("file-link");

//   const blob = await fetch(fileLink!).then((res) => res.blob());

//   const loader = new WebPDFLoader(blob);

//   const docs = await loader.load();

//   const splitDocs = await textSplitter.splitDocuments(docs);

//   const vectorstore = await PineconeStore.fromDocuments(
//     splitDocs,
//     new OpenAIEmbeddings({
//       openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
//     }),
//     {
//       pineconeIndex,
//       maxConcurrency: 5, // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
//     }
//   );

//   const body = await req.json();
//   const messages = body.messages ?? [];
//   const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
//   const currentMessageContent = messages[messages.length - 1].content;

//   const prompt = PromptTemplate.fromTemplate(TEMPLATE);
//   /**
//    * See a full list of supported models at:
//    * https://js.langchain.com/docs/modules/model_io/models/
//    */

//   const { stream, handlers } = LangChainStream();

//   const model = new ChatOpenAI({
//     openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
//     temperature: 0.8,
//   });

//   /**
//    * Chat models stream message chunks rather than bytes, so this
//    * output parser handles serialization and encoding.
//    */
//   const outputParser = new BytesOutputParser();

//   /*
//    * Can also initialize as:
//    *
//    * import { RunnableSequence } from "langchain/schema/runnable";
//    * const chain = RunnableSequence.from([prompt, model, outputParser]);
//    */
//   const chain = prompt.pipe(model).pipe(outputParser);

//   const documentChain = await createStuffDocumentsChain({
//     llm: model,
//     prompt,
//   });

//   const retriever = vectorstore.asRetriever();

//   const retrievalChain = await createRetrievalChain({
//     combineDocsChain: documentChain,
//     retriever,
//   });

//   retrievalChain.stream(
//     {
//       chat_history: formattedPreviousMessages.join("\n"),
//       input: currentMessageContent,
//     },
//     handlers
//   );

//   // const stream = await chain.stream({
//   //   chat_history: formattedPreviousMessages.join("\n"),
//   //   input: currentMessageContent,
//   // });

//   return new StreamingTextResponse(stream);
// }

import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { db } from "../../../../db";
import { chatMessages } from "../../../../db/schema";
import { asc, eq } from "drizzle-orm";

const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 1.5,
});

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

const textSplitter = new RecursiveCharacterTextSplitter();

const prompt = ChatPromptTemplate.fromTemplate(
  `Answer by retrieving relevant contextual information from the data source and augment it with the user's prompt:

<context>
{context}
</context>

Question: {input}`
);

type ReqDataType = {
  prompt: string;
  fileLink: string;
  chatId: string;
};

export async function POST(req: NextRequest) {
  const reqData: ReqDataType = await req.json();

  if (!reqData.fileLink)
    return Response.json(
      { error: "file link is missing in body" },
      { status: 400 }
    );

  if (!reqData.prompt)
    return Response.json({ error: "prompt is empty" }, { status: 400 });

  try {
    const blob = await fetch(reqData.fileLink).then((res) => res.blob());

    const loaders = new WebPDFLoader(blob);

    const docs = await loaders.load();

    const splitDocs = await textSplitter.splitDocuments(docs);

    const vectorstore = await PineconeStore.fromDocuments(
      splitDocs,
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      {
        pineconeIndex,
        maxConcurrency: 5, // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
      }
    );

    const documentChain = await createStuffDocumentsChain({
      llm: chatModel,
      prompt,
    });

    const retriever = vectorstore.asRetriever();

    const retrievalChain = await createRetrievalChain({
      combineDocsChain: documentChain,
      retriever,
    });

    const result = await retrievalChain.invoke({
      input: reqData.prompt,
    });

    await db.insert(chatMessages).values({
      chatId: reqData.chatId,
      role: "user",
      content: reqData.prompt,
    });

    await db.insert(chatMessages).values({
      chatId: reqData.chatId,
      role: "ai",
      content: result.answer,
    });

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatId, reqData.chatId))
      .orderBy(asc(chatMessages.createdAt));

    console.log(messages);

    return Response.json(
      {
        message: "request successful",
        messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(`ERROR: ${error}`);
    return Response.json({ message: "request failed", error });
  }
}
