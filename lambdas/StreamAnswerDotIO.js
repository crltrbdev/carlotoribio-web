/*global fetch*/

export const handler = awslambda.streamifyResponse(
    async (event, responseStream, context) => {
        responseStream.setContentType('text/plain');

        let prompt = 'no prompt';
        let chatHistory = [];
        const model = 'gpt-4o-mini';
        const completionsApiUrl = 'https://api.openai.com/v1/chat/completions';
        const apiKey = process.env.OPENAI_KEY;
        const maxTokens = 500;

        if (event.body) {
            const body = JSON.parse(event.body);
            prompt = body.prompt;
            chatHistory = body.chat_history;
        }
        else {
            prompt = event.prompt;
            chatHistory = event.chat_history;
        }

        chatHistory = chatHistory.map(item => {
            const role = item.match(/\[([^\]]+)\]/)[1]; // Extracts role between square brackets
            const content = item.replace(/\[([^\]]+)\] /, ''); // Removes the role part from the string
            return {
                role: role,
                content: content
            };
        });
        
        const systemPromptMessage = {
            'role': 'assistant',
            'content': SYSTEM_PROMPT
        };
        
        chatHistory.splice(0, 0, systemPromptMessage);
        
        chatHistory.push({
            'role': 'user',
            'content': prompt
        });

        console.info(prompt);
        console.info(chatHistory);

        try {
            const response = await fetch(completionsApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + apiKey
                },
                body: JSON.stringify({
                    model,
                    messages: chatHistory,
                    temperature: 1.0,
                    stream: true,
                    max_tokens: maxTokens
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let split_line = '';

            while (true) {
                const chunk = await reader.read();
                const { done, value } = chunk;
                if (done) {
                    break;
                }

                const decodedChunk = decoder.decode(value);
                const lines = decodedChunk.split("\n");

                const parsedLines = lines
                    .map((line) => {
                        return line.replace(/^data: /, "").trim();
                    })
                    .filter(line => line !== "" && line !== "[DONE]")
                    .map(line => {
                        // [CT TODO] GPT4 is sending partial chunks. I wrote this code to handle that,
                        // but I haven't seen it happen again.
                        // Keep an eye on this. The logs should show when this heppens.
                        try {
                            if (split_line != '') {
                                const complete_line = JSON.parse(split_line + line);
                                split_line = '';

                                return complete_line;
                            }
                            return JSON.parse(line);
                        }
                        catch (error) {
                            split_line += line;
                        }
                    });

                for (const parsedLine of parsedLines) {
                    if (!parsedLine) {
                        continue; // [CT] Omit empty lines returned by Try/Catch above.
                    }
                    const { choices } = parsedLine;
                    const text = choices[0].delta.content;
                    if (text) {
                        responseStream.write(text);
                    }
                }
            }

            responseStream.end();
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
);

const SYSTEM_PROMPT = ``;