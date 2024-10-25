import axios from 'axios';
import { Lambda, InvokeWithResponseStreamCommand } from "@aws-sdk/client-lambda"

const accessKeyId = process.env.REACT_APP_AWS_ACCESS_KEY;
const secretAccessKey = process.env.REACT_APP_AWS_SECRET_KEY;
const lambdaBaseUrl = process.env.REACT_APP_LAMBDA_API_BASE_URL;
const lambdaRegion = process.env.REACT_APP_AWS_REGION;

class OpenAIService {

    constructor() {
        this.client = axios.create({
            baseUrl: lambdaBaseUrl
        });
    }

    async streamAnswer(prompt, chat_history) {
        const lambda = new Lambda({
            region: lambdaRegion,
            credentials: {
                accessKeyId,
                secretAccessKey
            }
        });

        return lambda.send(new InvokeWithResponseStreamCommand(
            {
                FunctionName: 'streamAnswerDotIO',
                Payload: JSON.stringify({
                    prompt,
                    chat_history
                })
            }
        ));
    }
}

const openAIService = new OpenAIService();

export default openAIService;