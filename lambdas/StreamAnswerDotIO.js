/*global fetch, awslambda*/
import { SYSTEM_PROMPT } from './systemPrompt.mjs';

const MAX_PROMPT_CHARS = 500;
const MAX_HISTORY_ITEMS = 10;
const MAX_HISTORY_ITEM_CHARS = 2000;
const ALLOWED_ROLES = ['user', 'assistant'];
const FALLBACK_MESSAGE = 'Service unavailable. Please try again later.';

const parseRequest = (event) => {
    if (!event.body) {
        return { prompt: event.prompt, chatHistory: event.chat_history };
    }

    const raw = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString('utf-8')
        : event.body;
    const body = JSON.parse(raw);

    return { prompt: body.prompt, chatHistory: body.chat_history };
};

// Only "[user] " and "[assistant] " items are accepted, so a client can't inject a system message.
const toMessages = (chatHistory) => {
    if (!Array.isArray(chatHistory)) {
        return [];
    }

    return chatHistory
        .slice(-MAX_HISTORY_ITEMS)
        .map(item => {
            const match = typeof item === 'string' && item.match(/^\[([^\]]+)\] ?([\s\S]*)$/);
            if (!match || !ALLOWED_ROLES.includes(match[1])) {
                return null;
            }
            return {
                role: match[1],
                content: match[2].slice(0, MAX_HISTORY_ITEM_CHARS)
            };
        })
        .filter(Boolean);
};

export const handler = awslambda.streamifyResponse(
    async (event, responseStream, context) => {
        responseStream.setContentType('text/plain');

        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        const completionsApiUrl = 'https://api.openai.com/v1/chat/completions';
        const apiKey = process.env.OPENAI_KEY;
        const maxTokens = 500;

        let prompt;
        let chatHistory;

        try {
            ({ prompt, chatHistory } = parseRequest(event));
        }
        catch (error) {
            console.error('Invalid request body', error);
            responseStream.write('Invalid request.');
            responseStream.end();
            return;
        }

        if (typeof prompt !== 'string' || prompt.trim() === '') {
            responseStream.write('Please ask a question.');
            responseStream.end();
            return;
        }

        prompt = prompt.slice(0, MAX_PROMPT_CHARS);

        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...toMessages(chatHistory),
            { role: 'user', content: prompt }
        ];

        console.info({ prompt, historyItems: messages.length - 2 });

        try {
            const response = await fetch(completionsApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + apiKey
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature: 0.6,
                    stream: true,
                    max_tokens: maxTokens
                })
            });

            if (!response.ok) {
                console.error('OpenAI error', response.status, await response.text());
                responseStream.write(FALLBACK_MESSAGE);
                responseStream.end();
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }

                // stream: true keeps multi-byte characters intact across chunks.
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Last piece may be incomplete; keep it for the next chunk.

                for (const line of lines) {
                    const data = line.replace(/^data: /, '').trim();
                    if (data === '' || data === '[DONE]') {
                        continue;
                    }

                    const text = JSON.parse(data).choices?.[0]?.delta?.content;
                    if (text) {
                        responseStream.write(text);
                    }
                }
            }

            responseStream.end();
        }
        catch (error) {
            console.error(error);
            responseStream.write('\n\n' + FALLBACK_MESSAGE);
            responseStream.end();
        }
    }
);
