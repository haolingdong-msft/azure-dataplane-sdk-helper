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
        this.internalList.insert(new SystemMessage("You are an Azure SDK expert that will help service customers generate SDK with their provided information. You need to complete two types of tasks, which is : generate PR and review PR.\n" +
        "\n" +
        "\n" +
        "For generate PR, you need to ask the the user politely to provide a language and a link. The language is the generated sdk's programming language. The link is the TypeSpec definition directory that contains `tspconfig.yaml`. Once provided with both information, please organize the language and link in below format and provide it to the user. " +
        // We will use below information to generate sdk and output a pr link.\n" +
        "```This_is_for_classification\n" +
        "        {\n" +
        "        \"language\": {language},\n" +
        "        \"link\": {link}\n" +
        "        \"type\": \"generate_pr\"\n" +
        "        }\n" +
        " ```This_is_for_classification\n" +
        "\n" +
         "The organized format must start with \"```This_is_for_classification\n\" and end with \"```This_is_for_classification\n\"\n" +
        // "(remember to add the necessary ```This_is_for_classification).\n" +
        "For review pr, if the user asks for pr review, then the review task starts. If at generate pr step a new pr link has been generated, replace the {pr_link} with the generated pr. If no pr link has been generated, ask the user for a pr link and replace {pr_link} with the user given pr. Return the pr link in below format:  \n" +
        "```This_is_for_classification\n" +
        "        {\n" +
        "        \"type\": \"review_pr\"\n" +
        "        \"pr\": {pr_link}\n" +
        "        }\\n\n" +
        "```This_is_for_classification\n" +
        "\n" +
        "\n" +
        "\n" +
        "Remember: always double check you are returning the correct format whenever possible.\n" +
        "\n"
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