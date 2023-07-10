import { Activity, TurnContext, TeamsInfo } from "botbuilder";
import { CommandMessage, TeamsFxBotCommandHandler, TriggerPatterns } from "@microsoft/teamsfx";
const { OpenAI } = require("langchain/llms/openai");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { BufferMemory } = require("langchain/memory");

import {
  ActivityTypes,
} from 'botframework-schema';
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
import * as fs from "fs";
const { ConversationalRetrievalQAChain } = require("langchain/chains");

export class ConversationHandler implements TeamsFxBotCommandHandler {
  triggerPatterns: TriggerPatterns = ".*";
  chain;

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage
  ): Promise<string | Partial<Activity> | void> {

    console.log(`App received message: ${message.text}`);

    const msg: Partial<Activity> = {
      type: ActivityTypes.Message,
    };

    if(!this.chain) {
      const chat = new OpenAI({ maxTokens: 256 })
      const embeddings = new OpenAIEmbeddings({
        azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
        modelName: process.env.AZURE_OPENAI_EMBEDDING_MODEL_NAME,
      });
      const content = fs.readFileSync("docs/docs.txt", "utf8");

      const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
      const docs = await textSplitter.createDocuments([content]);
      /* Create the vectorstore */
      const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);
      this.chain = ConversationalRetrievalQAChain.fromLLM(
        chat,
        vectorStore.asRetriever(),
        {
          returnSourceDocuments: false,
          memory: new BufferMemory({
            memoryKey: "chat_history", // Must be set to "chat_history"
            inputKey: "question", // The key for the input to the chain
            outputKey: "text", // The key for the final conversational output of the chain
          }),
          verbose: true // display internal logs inside the chains
        },
      );
    }

    const caller = await TeamsInfo.getMember(context, context.activity.from.id);

    const text = await this.chain.call({question: message.text})
    console.log(text)

    msg.text = "@" + caller.name + " " + text.text
    return msg
  }
}
