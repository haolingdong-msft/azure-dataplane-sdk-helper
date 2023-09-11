import { Activity, TurnContext, TeamsInfo } from "botbuilder";
import { CommandMessage, TeamsFxBotCommandHandler, TriggerPatterns } from "@microsoft/teamsfx";
import { openAI } from "../internal/initialize";

import {
  ActivityTypes,
} from 'botframework-schema';
import {FixedLengthList} from "../utils/FixedLengthList";
const { HumanMessage, SystemMessage, AIChatMessage } = require("langchain/schema");

export class JavaScriptConversationHandler implements TeamsFxBotCommandHandler {
  triggerPatterns: TriggerPatterns = ".*";
  memory = new FixedLengthList(100);

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage
  ): Promise<string | Partial<Activity> | void> {

    console.log(`[JavaScriptConversationHandler]App received message: ${message.text}`);

    const msg: Partial<Activity> = {
      type: ActivityTypes.Message,
    };

    if (this.memory.length() == 0) {
      this.refreshMemory()
    }

    if (message.text.toLocaleLowerCase().startsWith("bye")){
      this.refreshMemory()
      return "Glad to help. Bye!"
    }

    try {
      const history = [...this.memory.getList()];
      history.push(new HumanMessage(message.text))
      const result = await openAI.predictMessages(history);
      msg.text = result.text;
      this.memory.insert(new HumanMessage(message.text));
      this.memory.insert(new AIChatMessage(result.text));
    } catch(e) {
      console.log(e)
      msg.text = "Sorry, we've encountered some internal issues. Please try again."
    }

    return msg
  }

  refreshMemory(): void {
    this.memory.clear();
    this.memory.insert(new SystemMessage("You are an Azure SDK expert that will help service customers generate SDK with their provide information. If you don't know, please ask user for clarification."+
    "In order to generate SDK, you'll need to know which language does he/she want to generate, and a link to the swagger readme file that the SDK generator is based on. If user doesn't provide the above information, please ask him/her politely to provide. And please make sure the given link is a valid github repo link."+
    "Once provided with both information, please return the information in below format:\n" +
    "```\n"+
    "{\n"+
    " \"language\": \"{language}\",\n"+
    " \"link\": \"{link}\""+
    "}\n"+
    "```\n"+
    "(remember to add the necessary ```)"))
  }
}
