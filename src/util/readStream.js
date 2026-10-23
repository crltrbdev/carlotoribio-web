// Reads a streamed text response to the end, reporting the text so far after each chunk.
export async function readStream(reader, onText) {
    const decoder = new TextDecoder("utf-8");
    let text = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        onText?.(text);
    }

    return text;
}
