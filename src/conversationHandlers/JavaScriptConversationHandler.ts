import { Activity, TurnContext } from "botbuilder";
import { CommandMessage, TeamsFxBotCommandHandler, TriggerPatterns } from "@microsoft/teamsfx";
import { chat, codeReviewHelper, githubHelper } from "../internal/initialize";

import {
  ActivityTypes,
} from 'botframework-schema';
import {FixedLengthMemory, ChatType, Classifier, ClassifyResult } from "../utils/ChatHelper";
const { HumanMessage, SystemMessage, AIChatMessage } = require("langchain/schema");
const Git = require("nodegit")

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
      const history = this.memory.getAll();
      history.push(new HumanMessage(message.text))
      const result = await chat.call(history);
      const classifyResult = Classifier.classifyChat(result.text);
      switch (classifyResult.type) {
        case ChatType.GENERATE_PR:
          const branch = await this.generateCodeAndPush(classifyResult.language, classifyResult.link)
          const prResult = await githubHelper.createPr(branch, {})
          msg.text = "Here's the PR link we created for you: " + prResult.link
          this.memory.setPr(classifyResult.pr)
          break
        case ChatType.REVIEW_PR:
          if (this.memory.getPr() == null) {
            msg.text = "Sorry, there's no PR link available."
          } else {
            await codeReviewHelper.run(this.memory.getPr())
            msg.text = "We've added some reviews to your PR. Please take a look, thanks!"
          }
          break
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
    Git.Repository.open("tmp")
  }
}
