import axios from 'axios';
import { Lambda, InvokeWithResponseStreamCommand } from "@aws-sdk/client-lambda"

const lambdaBaseUrl = process.env.REACT_APP_LAMBDA_API_BASE_URL;

class OpenAIService {

    constructor() {
        this.client = axios.create({
            baseUrl: lambdaBaseUrl
        });
    }

    async streamAnswer(prompt, chat_history) {
        const res = await fetch(process.env.REACT_APP_STREAM_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, chat_history }),
        });
        return res.body.getReader();
    }

    async sendResumEmail(email) {
        return fetch(process.env.REACT_APP_EMAIL_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
    }
}

const openAIService = new OpenAIService();

export default openAIService;