import { Activity, TurnContext } from "botbuilder";
import { CommandMessage, TeamsFxBotCommandHandler, TriggerPatterns } from "@microsoft/teamsfx";
import { chat, codeReviewHelper, githubHelper } from "../internal/initialize";

import {
  ActivityTypes,
} from 'botframework-schema';
import {FixedLengthMemory, ChatType, Classifier, ClassifyResult } from "../utils/ChatHelper";
const { HumanMessage, SystemMessage, AIChatMessage } = require("langchain/schema");

/**
 * Entry point of the chat bot.
 */
export class JavaScriptConversationHandler implements TeamsFxBotCommandHandler {
  triggerPatterns: TriggerPatterns = ".*";
  memory = new FixedLengthMemory(100);

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage
  ): Promise<string | Partial<Activity> | void> {

    console.log(`[JavaScriptConversationHandler]App received message: ${message.text}`);

    if (this.memory.isEmpty()) {
      this.memory.refresh()
    }

    if (message.text.toLocaleLowerCase().startsWith("bye")){
      this.memory.refresh();
      return "Glad to help. Bye!"
    }

    return this.getResponse(message)
  }

  async getResponse(message: CommandMessage): Promise<Partial<Activity>> {

    const msg: Partial<Activity> = {
      type: ActivityTypes.Message,
    };

    try {
      // get chat history, append current user chat
      const history = this.memory.getAll();
      history.push(new HumanMessage(message.text))
      // call OpenAI chat
      const result = await chat.call(history);
      // classify chat type
      const classifyResult = Classifier.classifyChat(result.text);
      switch (classifyResult.type) {
        // generate pr
        case ChatType.GENERATE_PR:
          const branch = await this.generateCodeAndPush(classifyResult.language, classifyResult.link);
          const prResult = await githubHelper.createPr("Content Safety", branch, {
            "body": `This is auto-generated from TypeSpec repository: ${classifyResult.link}.`
          });
          // TODO add Codespaces link
          msg.text = `Here's the PR link we created for you: ${prResult.html_url}. You can directly edit it in Codespaces: ${prResult.codespaces_url}.` ;
          this.memory.setPr(prResult)
          break
        // review pr
        case ChatType.REVIEW_PR:
          if (this.memory.getPr() == null) {
            msg.text = "Sorry, there's no PR link available."
          } else {
            msg.text = await codeReviewHelper.run(this.memory.getPr());
          }
          break
        // others
        case ChatType.NONE:
          msg.text = result.text;
      }
      this.memory.add(new HumanMessage(message.text));
      this.memory.add(new AIChatMessage(msg.text));
    } catch(e) {
      console.log(e)
      msg.text = "Sorry, we've encountered some internal issues. Please try again."
    }
    return msg
  }

  async generateCodeAndPush(language: string, link: string): Promise<string> {
    // Mock, will use Azure Pipeline for future codegen
    return "sdk_dpg_contentsafety";
  }
}
