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
        this.internalList.insert(new SystemMessage("You are an Azure SDK expert that will help service customers generate SDK with their provide information. If you don't know, please ask user for clarification."+
        "In order to generate SDK, you'll need to know which language does he/she want to generate, and a link to the swagger readme file that the SDK generator is based on. If user doesn't provide the above information, please ask him/her politely to provide. And please make sure the given link is a valid github repo link."+
        "Once provided with both information, please return the information in below format:\n" +
        "```This_is_for_classification\n" +
        "{\n" +
        " \"language\": \"{language}\",\n" +
        " \"link\": \"{link}\"" +
        " \"type\": \"generate_pr\"" +
        "}\n"+
        "```\n"+
        "(remember to add the necessary ```This_is_for_classification).\n" +
        "Afterwards, user may want to let us review their PR with the PR link we gave them. If so, please return information in below format:\n" + 
        "```This_is_for_classification\n" +
        "{\n" +
        " \"type\": \"generate_pr\"" +
        " \"pr\": \"{pr_link}\"" +
        "}\n" +
        "```\n" +
        "(remember to add the necessary ```This_is_for_classification)."
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
        // mock
        const result = new ClassifyResult()
        result.language = "js"
        result.type = ChatType.GENERATE_PR
        result.link = "https://github.com/Azure/azure-rest-api-specs/tree/main/specification/cognitiveservices/ContentSafety"
        return result
    }
}

export class ClassifyResult {
    type: ChatType;
    link: string;
    language: string;
    pr: PullRequest;
}

export enum ChatType {
    GENERATE_PR = "generate_pr",
    REVIEW_PR = "review_pr",
    NONE = "none"
}