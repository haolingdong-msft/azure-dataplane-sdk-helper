import { ProgrammingLanguage, PullRequest } from "./GithubHelper";

const { SystemMessage } = require("langchain/schema");

export class FixedLengthList<T> {
    private list: T[];
    private maxSize: number;

    constructor(maxSize: number) {
        this.list = [];
        this.maxSize = maxSize;
    }

    insert(item: T): void {
        if (this.list.length >= this.maxSize) {
            this.list.shift(); // remove the first item
        }
        this.list.push(item);
    }

    getList(): T[] {
        return this.list;
    }

    clear(): void {
        this.list = [];
    }

    length(): number {
        return this.list.length;
    }
}

export class FixedLengthMemory<T> {
    private internalList: FixedLengthList<T>;
    private pr: PullRequest;

    constructor(maxSize: number) {
        this.internalList = new FixedLengthList(maxSize);
    }

    isEmpty(): boolean {
        return this.internalList.length() == 0;
    }

    refresh(): void {
        this.pr = null;
        this.internalList.clear();
        // 1. add sample demonstration
        // 2. split into multiple chat models
        this.internalList.insert(new SystemMessage("You are an Azure SDK expert that will help service customers generate SDK with their provide information. First, you'll need to classify customer's request into following categories: {\n\"generate_pr\": \"The customer wants to generate SDK.\",\n\"review_pr\": \"The customer asks you to review the PR that we created for them.\",\n\"none\": \"Any other requests the customer requests or information he/she provides\"}.\n" + 
        "Next, according to the category that you identify, you will do the following:" +
        "1. If \"generate_pr\", you'll need to know which language does he/she want to generate, and a link to the Typespec definition, e.g. https://github.com/Azure/azure-rest-api-specs/tree/main/specification/cognitiveservices/HealthInsights. If user doesn't provide the above information, please ask him/her politely to provide." +
        "Once provided with both information, please return the information in below format:\n" +
        "```This_is_for_classification\n" +
        "{\n" +
        " \"language\": \"{language}\",\n" +
        " \"link\": \"{link}\"" +
        " \"type\": \"generate_pr\"" +
        "}\n"+
        "```This_is_for_classification\n"+
        "(remember to add the necessary ```This_is_for_classification).\n" +
        "2. If \"review_pr\", you don't have to review the PR yourself. Instead, just provide what you know in below format:\n" +  
        "```This_is_for_classification\n" +
        "{\n" +
        " \"type\": \"review_pr\"" +
        " \"pr\": \"{pr_link}\"" +
        "}\n" +
        "```This_is_for_classification\n" +
        "Remember: always double check you are returning the correct format whenever possible. The {pr_link} is the one we generated for them in \"generate_pr\" step.\n" +
        "For example: \n Assistant: Here's the PR link we created for you: https://github.com/MaryGao/azure-sdk-for-js-pr/pull/15.\n Customer: Please help review my PR.\n Assistant: \n"+
        "```This_is_for_classification\n" +
        "{\n" +
        " \"type\": \"review_pr\"" +
        " \"pr\": \"https://github.com/MaryGao/azure-sdk-for-js-pr/pull/15\"" +
        "}\n" +
        "```This_is_for_classification" +
        "3. If \"none\", do as you see fit.\n" + 
        "Remember: Always classify current user's request into above three categories: \"generate_pr\", \"review_pr\" or \"none\" as mentioned above."
        ))
        }

    getAll(): T[] {
        return [...this.internalList.getList()];
    }

    add(element: T): void {
        this.internalList.insert(element);
    }

    getPr(): PullRequest {
        return this.pr;
    }

    setPr(pr: PullRequest) {
        this.pr = pr;
    }
}

export class Classifier {
    static classifyChat(chatContent: string): ClassifyResult  {
        const classificationRegex = /```This_is_for_classification\n({[^}]*})\n```This_is_for_classification/;
        let result: ClassifyResult = {
            "type": ChatType.NONE
        }
        if (classificationRegex.test(chatContent)){
            const content = chatContent.match(classificationRegex)[1];
            result = JSON.parse(content);
        }
        return result;
    }
}

export interface ClassifyResult {
    type: ChatType;
    link?: string;
    language?: ProgrammingLanguage;
    pr?: PullRequest;
}

export enum ChatType {
    GENERATE_PR = "generate_pr",
    REVIEW_PR = "review_pr",
    NONE = "none"
}