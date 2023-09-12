export class GithubHelper {
    static async getContextFromRawUrl(rawUrl: string) {
        const response = await fetch(rawUrl);
        if (response.ok) {
            const text = await response.text();
            return text;
        } else {
            throw new Error(`HTTP Error: ${response.status}`);
        }
    }

    /**
     * Create a pull request
     * @param head the branch name of the pr
     * @param options optional bags
     * @returns PR details or undefined if failed
     */
    async createPr(head: string, options?: CreatePrOptions): Promise<PullRequest> {
        return {
            id: "7",
            link: "https://github.com/haolingdong-msft/azure-dataplane-sdk-helper/pull/7"
        };
    }

    /**
     * Create a review comment in a pr
     * @param prId pr id
     * @param filePath the relevat file path in that pr
     * @param comment the comment detail
     * @param options optional bags
     * @returns 
     */
    async createReviewComment(prId: string, filePath: string, comment: string, options?: CreateReviewCommentOptions): Promise<ReviewComment> {
        return {
            id: "r1322282884",
            link: "https://github.com/haolingdong-msft/azure-dataplane-sdk-helper/pull/7/files#r1322282884"
        };
    }

    /**
     * Extract the files which need to be review, only readme & sample and testing files need to be reviewed
     * @param pr the pr id
     * @returns 
     */
    async getReviewIncludedFiles(prId: string): Promise<PRFile[]> {
        return [
            {
                rawUrl: "https://raw.githubusercontent.com/haolingdong-msft/azure-dataplane-sdk-helper/922e97a5bcd221ec31febcee6acba7d3c3f8f8d4/env/.env.local",
                filePath: "env/.nv.local"
            }
        ];
    }

}

export interface CreatePrOptions {
    owner?: string;
}

export interface PullRequest {
    id: string;
    link: string;
}

export interface CreateReviewCommentOptions {
    line?: string;
    side?: "LEFT" | "RIGHT";
    commitId?: string;
}

export interface ReviewComment {
    id: string;
    link: string;
}

export interface PRFile {
    rawUrl: string;
    filePath: string;
}