import { JavaScriptConversationHandler } from "../conversationHandlers/JavaScriptConversationHandler";

import { BotBuilderCloudAdapter } from "@microsoft/teamsfx";
import config from "./config";
import ConversationBot = BotBuilderCloudAdapter.ConversationBot;
import { CodeReviewHelper } from "../utils/CodeReviewHelper";
import { GithubHelper } from "../utils/GithubHelper";
const { OpenAI } = require("langchain/llms/openai");
const { ChatOpenAI } = require("langchain/chat_models/openai");


// Create the command bot and register the command handlers for your app.
// You can also use the commandApp.command.registerCommands to register other commands
// if you don't want to register all of them in the constructor
export const commandApp = new ConversationBot({
  // The bot id and password to create CloudAdapter.
  // See https://aka.ms/about-bot-adapter to learn more about adapters.
  adapterConfig: {
    MicrosoftAppId: config.botId,
    MicrosoftAppPassword: config.botPassword,
    MicrosoftAppType: "MultiTenant",
  },
  command: {
    enabled: true,
    commands: [new JavaScriptConversationHandler()],
  },
});

export const chat = new ChatOpenAI({
  temperature: 0,
  // azureOpenAIBasePath: "https://westeurope.api.cognitive.microsoft.com/openai/deployments",
  max_tokens: 1024
});

export const codeReviewHelper = new CodeReviewHelper();

export const githubHelper = new GithubHelper(config.github_pat);
