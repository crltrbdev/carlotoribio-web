class OpenAIService {

    async streamAnswer(prompt, chat_history) {
        const res = await fetch(process.env.REACT_APP_STREAM_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, chat_history }),
        });
        if (!res.ok) {
            throw new Error(`Stream request failed with status ${res.status}`);
        }
        return res.body.getReader();
    }
}

const openAIService = new OpenAIService();

export default openAIService;