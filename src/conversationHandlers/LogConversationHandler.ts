import { Activity, TurnContext, TeamsInfo } from "botbuilder";
import { CommandMessage, TeamsFxBotCommandHandler, TriggerPatterns } from "@microsoft/teamsfx";

export class LogConversationHandler implements TeamsFxBotCommandHandler {
  triggerPatterns: TriggerPatterns = ".*";

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage
  ): Promise<string | Partial<Activity> | void> {

    console.log(`[LogConversationHandler]App received message: ${message.text}`);
    
  }
}
