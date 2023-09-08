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

    // create pr
    // add comment (pr, fileUrl, comment)
    
}