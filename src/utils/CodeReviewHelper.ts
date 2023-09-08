import { GithubHelper } from "./GithubHelper";

const { HumanMessage, SystemMessage} = require("langchain/schema");
const { OpenAI } = require("langchain/llms/openai");


export class CodeReviewHelper {
    

    async run(prLink?: string) {
        // console.log(m);
        const context = await GithubHelper.getContextFromRawUrl("https://raw.githubusercontent.com/asaflevi-ms/azure-sdk-for-js/a4a4b2b4ef59f2a14e66f1a8d9a9d00a9dd726c7/sdk/healthinsights/health-insights-clinicalmatching-rest/README.md");
        const chat = new OpenAI({
            temperature: 0
        });

        const result = await chat.predictMessages([
            new SystemMessage("You are an AI assistant that helps to do code review. I will give you a code snippet. You will need to give code review comments. If it is markdown file, you will need to verify if all href has corresponding link, the structure of the file, whether the description is fluent in natrual language perspective, the code snippet provided in the file is correct and easy to understand. You will need to list the review comments with the code line."),
            new HumanMessage(context)

        ]);
        // const result = await chat.predict(context)

        
        console.log(result);
        
    }
}