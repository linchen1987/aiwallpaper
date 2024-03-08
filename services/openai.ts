import OpenAI from "openai";
import { HttpsProxyAgent } from 'https-proxy-agent';

export function getOpenAIClient() {
  const openai = new OpenAI({
    httpAgent: process.env.https_proxy ? new HttpsProxyAgent(process.env.https_proxy || '') : undefined,
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openai;
}
