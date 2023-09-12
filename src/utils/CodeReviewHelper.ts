import { GithubHelper, PRFile, PullRequest, ReviewComment } from "./GithubHelper";

const { HumanMessage, SystemMessage} = require("langchain/schema");
const { ChatOpenAI } = require("langchain/llms/openai");


export class CodeReviewHelper {
    codeReviewSystemMessage = "You are an AI assistant that helps to do code review. I will give you a code snippet. You will need to give code review comments. If it is markdown file, you will need to verify if all href has corresponding link, the structure of the file, whether the description is fluent in natural language perspective, the code snippet provided in the file is correct and easy to understand. You will need to list the review comments with the code line.";
    async run(pr: PullRequest) {
        try {
            const chat = new ChatOpenAI({
                temperature: 0
            });
            let githubHelper: GithubHelper = new GithubHelper();
            // 1. get review included files
            let reviewIncludedFiles: PRFile[] = await githubHelper.getReviewIncludedFiles(pr.id);
            // 2. add review comments for each file
            for (let i = 0; i < reviewIncludedFiles.length; i++) {
                const context = await githubHelper.getContextFromRawUrl(reviewIncludedFiles[i].rawUrl);
                const result = await chat.predictMessages([
                    new SystemMessage(this.codeReviewSystemMessage),
                    new HumanMessage(context)
                ]);
                await githubHelper.createReviewComment(pr.id, reviewIncludedFiles[i].filePath, result.text);
            }
            return "The code review process is completed.";
        } catch(e) {
            console.log(e);
            return "The code review process failed. Please try again."
        }
    }
}