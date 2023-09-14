// import { Octokit } from "octokit";
import { Octokit } from "@octokit/rest";

export class GithubHelper {
    octokit: Octokit;
    DEFAULT_OWNER: string = "marygao";
    DEFAULT_REPO: string = "azure-sdk-for-js-pr";
    constructor(token?: string) {
        this.octokit = new Octokit({
            auth: token ?? "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",
        });
    }

    async getContextFromRawUrl(filename: string, commit_id: string) {
        const response = await this.octokit.rest.repos.getContent({
            owner: this.DEFAULT_OWNER,
            repo: this.DEFAULT_REPO,
            path: filename,
            ref: commit_id
        });
        if (!Array.isArray(response.data) && (response.data as any).content) {
            return atob((response.data as any).content)
        }
        return undefined;
    }

    /**
     * Create a pull request
     * https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#create-a-pull-request
     * @param head the branch name of the pr
     * @param options optional bags
     * @returns PR details or undefined if failed
     */
    /**
     * 
    {
      url: 'https://api.github.com/repos/MaryGao/azure-sdk-for-js-pr/pulls/3',
      id: 1513245646,
      node_id: 'PR_kwDOKS1NE85aMkvO',
      html_url: 'https://github.com/MaryGao/azure-sdk-for-js-pr/pull/3',
      diff_url: 'https://github.com/MaryGao/azure-sdk-for-js-pr/pull/3.diff',
      patch_url: 'https://github.com/MaryGao/azure-sdk-for-js-pr/pull/3.patch',
      issue_url: 'https://api.github.com/repos/MaryGao/azure-sdk-for-js-pr/issues/3',
      number: 3,
      state: 'open'
    }
     */
    async createPr(serivceName: string, headOrBranchName: string, options: CreatePrOptions = {}): Promise<PullRequest | undefined> {
        try {
            const result = await this.octokit.rest.pulls.create({
                owner: options.owner ?? this.DEFAULT_OWNER,
                repo: this.DEFAULT_REPO,
                title: `Auto generated pr for ${serivceName}`,
                body: options.body ?? 'Please pull these awesome changes in!',
                head: headOrBranchName,
                base: options.base ?? 'main',
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })

            if (result.status === 201) {
                return result.data;
            }
            return undefined;
        } catch (e: any) {
            console.log(e);
            return undefined;
        }
    }



    /**
     * Create a review comment in a pr
     * https://docs.github.com/en/rest/pulls/comments?apiVersion=2022-11-28#create-a-review-comment-for-a-pull-request
     * @param prId pr id
     * @param filePath the relevat file path in that pr
     * @param comment the comment detail
     * @param options optional bags
     * @returns 
     */
    /**
     * 
  {
    url: 'https://api.github.com/repos/MaryGao/azure-sdk-for-js-pr/pulls/comments/1324007885',
    pull_request_review_id: 1623746708,
    id: 1324007885,
    node_id: 'PRRC_kwDOKS1NE85O6sHN'
  }
     */
    async createReviewComment(pull_number: number, filename: string, comment: string, commit_id: string, line: number, options: CreateReviewCommentOptions = {}): Promise<PullReviewComment | undefined> {
        try {
            const result = await this.octokit.rest.pulls.createReviewComment({
                owner: options.owner ?? this.DEFAULT_OWNER,
                repo: this.DEFAULT_REPO,
                pull_number: pull_number,
                body: comment ?? 'Great stuff!',
                commit_id: commit_id,
                path: filename,
                line: line ?? 1,
                side: options.side ?? 'RIGHT',
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            if (result.status === 201) {
                return result.data;
            }

        } catch (e: any) {
            console.log(e);
            return undefined;
        }
    }

    /**
     * Extract the files which need to be review, only readme & sample and testing files need to be reviewed
     * @param pr the pr id
     * @returns 
     */
    /**
     [{
      commit_id: '46dfdc00e4d2a24eb39249a7955d748743035eae',
      filename: 'README.md',
      status: 'modified',
      blob_url: 'https://github.com/MaryGao/azure-sdk-for-js-pr/blob/46dfdc00e4d2a24eb39249a7955d748743035eae/README.md',
      raw_url: 'https://github.com/MaryGao/azure-sdk-for-js-pr/raw/46dfdc00e4d2a24eb39249a7955d748743035eae/README.md'
    },
    {
      commit_id: '46dfdc00e4d2a24eb39249a7955d748743035eae',
      filename: 'sdk/advisor/arm-advisor/samples-dev/configurationsCreateInResourceGroupSample.ts',        
      status: 'modified',
      blob_url: 'https://github.com/MaryGao/azure-sdk-for-js-pr/blob/46dfdc00e4d2a24eb39249a7955d748743035eae/sdk%2Fadvisor%2Farm-advisor%2Fsamples-dev%2FconfigurationsCreateInResourceGroupSample.ts',
      raw_url: 'https://github.com/MaryGao/azure-sdk-for-js-pr/raw/46dfdc00e4d2a24eb39249a7955d748743035eae/sdk%2Fadvisor%2Farm-advisor%2Fsamples-dev%2FconfigurationsCreateInResourceGroupSample.ts'
    }
  ]
     */
    async getReviewIncludedFiles(pull_number: number): Promise<PRFile[] | undefined> {
        try {
            const res = await this.octokit.rest.pulls.listFiles({ pull_number, owner: this.DEFAULT_OWNER, repo: this.DEFAULT_REPO });
            return res.data.filter(file => this.filterOnlyReviewed(file.filename)).map(item => {
                return {
                    ...item,
                    commit_id: this.getCommitIdFromUrl(item.raw_url),
                    pull_number: pull_number
                };
            });
        } catch (e) {
            console.log(e);
            return undefined;
        }

    }

    filterOnlyReviewed(filename?: string) {
        if (!filename) {
            return false;
        }
        // const includedFiles = ["readme.md", "samples-dev", ".spec.ts"];
        const includedFiles = ["readme.md"];
        return includedFiles.some(i => filename.toLowerCase().includes(i));
    }

    getCommitIdFromUrl(url: string) {
        if (!url) {
            return undefined;
        }
        const parts = url.split("/");
        const indexOfRaw = parts.indexOf("raw");
        return parts[indexOfRaw + 1];
    }

}

export interface CreatePrOptions {
    owner?: string;
    base?: string;
    body?: string;
}

export interface PullRequest {
    /**
     * pr id
     */
    id?: number;
    /**
     * pull request number
     */
    number?: number;
    /**
     * pull request link
     */
    url?: string;
    diff_url?: string;
}

export interface CreateReviewCommentOptions {
    side?: "LEFT" | "RIGHT";
    commitId?: string;
    owner?: string;

}

export interface PullReviewComment {
    url: string;
}

export interface PRFile {
    raw_url: string;
    filename: string; // relative file path name
    commit_id?: string;
    pull_number?: number;
}