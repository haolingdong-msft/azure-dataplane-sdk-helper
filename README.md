# azure-dataplane-sdk-helper

This project leverages [Teams Bot Framework](https://github.com/OfficeDev/TeamsFx/wiki/Respond-to-chat-commands-in-Teams#How-to-create-a-command-response-bot) and [langchain typescript](https://js.langchain.com/docs/).
It uses langchain's [ConversationalRetrievalQA](https://js.langchain.com/docs/modules/chains/index_related_chains/conversational_retrieval) to load documents into vector store for future retrieval and also deals with chat history.

## Quick start

### Prerequisites

* [Teams Toolkit Visual Studio Code Extension](https://aka.ms/teams-toolkit) version 5.0.0 and higher or [TeamsFx CLI](https://aka.ms/teamsfx-cli)
* [nodejs >=16](https://nodejs.org/en)
* [Visual Studio Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools) for node-gyp if running on Windows. Install 'Desktop development with C++'.

### Run(debug) locally with Visual Studio Code

1. Fill in necessary configs in `env/.env.local` and `env/.env.local.user`. You can leave 'Bot-related paramters' as empty, the pipeline will create new teams app id for you.
2. In Debug tag, choose `Debug(Edge)` and start debugging.
3. On Edge popup, select `Add` to add the bot to Teams.
4. Start conversation with the Bot.

### Project structure

1. `env`
    1. .env.local contains configs that can be pushed to remote git repository
    2. .env.local.user contains sensitive configs that can be pushed to remote git repository, e.g. api keys, passwords, secrets, etc
2. `docs` contains documents that need to be loaded into vector store
3. Conversation handlers under `src/conversationHandlers`(e.g. `DotNetConversationHandler`) is the main logic for handling chats, vector stores and OpenAI calls

## Additional information and references

- [Manage multiple environments](https://docs.microsoft.com/microsoftteams/platform/toolkit/teamsfx-multi-env)
- [Collaborate with others](https://docs.microsoft.com/microsoftteams/platform/toolkit/teamsfx-collaboration)
- [Teams Toolkit Documentations](https://docs.microsoft.com/microsoftteams/platform/toolkit/teams-toolkit-fundamentals)
- [Teams Toolkit CLI](https://docs.microsoft.com/microsoftteams/platform/toolkit/teamsfx-cli)
- [TeamsFx SDK](https://docs.microsoft.com/microsoftteams/platform/toolkit/teamsfx-sdk)
- [Teams Toolkit Samples](https://github.com/OfficeDev/TeamsFx-Samples)
