import { Activity, TurnContext, TeamsInfo } from "botbuilder";
import { CommandMessage, TeamsFxBotCommandHandler, TriggerPatterns } from "@microsoft/teamsfx";
import { chat } from "../internal/initialize";

import {
  ActivityTypes,
} from 'botframework-schema';
import {FixedLengthMemory} from "../utils/ChatHelper";
const { HumanMessage, SystemMessage, AIChatMessage } = require("langchain/schema");

export class JavaScriptConversationHandler implements TeamsFxBotCommandHandler {
  triggerPatterns: TriggerPatterns = ".*";
  memory = new FixedLengthMemory(100);

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage
  ): Promise<string | Partial<Activity> | void> {

    console.log(`[JavaScriptConversationHandler]App received message: ${message.text}`);

    const msg: Partial<Activity> = {
      type: ActivityTypes.Message,
    };

    if (this.memory.isEmpty()) {
      this.memory.refresh()
    }

    if (message.text.toLocaleLowerCase().startsWith("bye")){
      this.memory.refresh();
      return "Glad to help. Bye!"
    }

    try {
      const history = this.memory.getAll();
      history.push(new HumanMessage(message.text))
      const result = await chat.call(history);
      msg.text = result.text;
      this.memory.add(new HumanMessage(message.text));
      this.memory.add(new AIChatMessage(result.text));
    } catch(e) {
      console.log(e)
      msg.text = "Sorry, we've encountered some internal issues. Please try again."
    }

    return msg
  }
}
