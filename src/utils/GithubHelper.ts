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
            id: "1",
            link: "https://github.com/haolingdong-msft/azure-dataplane-sdk-helper/compare"
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
            id: "1",
            link: "https://github.com/haolingdong-msft/azure-dataplane-sdk-helper/compare"
        };
    }

    /**
     * Extract the files which need to be review, only readme & sample and testing files need to be reviewed
     * @param pr the pr id
     * @returns 
     */
    async getReviewIncludedFiles(prId: string): Promise<string[]> {
        return ["https://mockurl"];
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