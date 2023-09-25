const config = {
  botId: process.env.BOT_ID,
  botPassword: process.env.BOT_PASSWORD,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
  embeddingModelName: process.env.AZURE_OPENAI_EMBEDDING_MODEL_NAME,
  github_pat: process.env.GITHUB_PAT
};

export default config;
