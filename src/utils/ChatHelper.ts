import { PullRequest } from "./GithubHelper";

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
        this.internalList.insert(new SystemMessage("You are an Azure SDK expert that will help service customers generate SDK with their provide information. Customer will ask you to help generate and review PR. Always use information in chat history. If you really don't know, please ask user for clarification."+
        "There are some special scenarios that need extra formatting: generate_pr and review_pr. 1. In order to generate SDK, you'll need to know which language does he/she want to generate, and a link to the typespec directory that contains tspconfig.yaml file that the SDK generator is based on. If user doesn't provide the above information, please ask him/her politely to provide. And please make sure the given link is a valid github repo link."+
        "Once provided with both information, please return the information in below format:\n" +
        "```This_is_for_classification\n" +
        "{\n" +
        " \"language\": \"{language}\",\n" +
        " \"link\": \"{link}\"" +
        " \"type\": \"generate_pr\"" +
        "}\n"+
        "```This_is_for_classification\n"+
        "(remember to add the necessary ```This_is_for_classification).\n" +
        "2. If the customer asked you to review the PR, don't review it, instead, return information in below format:\n" + 
        "```This_is_for_classification\n" +
        "{\n" +
        " \"type\": \"review_pr\"" +
        " \"pr\": \"{pr_link}\"" +
        "}\n" +
        "```This_is_for_classification\n" +
        "Remember: always double check you are returning the correct format whenever possible.\n" +
        "For example: \n Assistant: Here's the PR link we created for you: https://github.com/MaryGao/azure-sdk-for-js-pr/pull/12\n Customer: Please help review my PR.\n Assistant: \n"+
        "```This_is_for_classification\n" +
        "{\n" +
        " \"type\": \"review_pr\"" +
        " \"pr\": \"https://github.com/MaryGao/azure-sdk-for-js-pr/pull/12\"" +
        "}\n" +
        "```This_is_for_classification"
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
    language?: string;
    pr?: PullRequest;
}

export enum ChatType {
    GENERATE_PR = "generate_pr",
    REVIEW_PR = "review_pr",
    NONE = "none"
}