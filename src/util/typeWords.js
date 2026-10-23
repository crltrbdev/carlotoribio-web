// Reveals text one word at a time, like a streamed answer.
// Returns a cancel function so callers can clean up on unmount.
export function typeWords(text, onUpdate, { delay = 50, onDone } = {}) {
    const words = text.split(' ');
    const timers = [];
    let current = '';

    words.forEach((word, index) => {
        timers.push(setTimeout(() => {
            current += (current ? ' ' : '') + word;
            onUpdate(current);

            if (index === words.length - 1 && onDone) {
                onDone(current);
            }
        }, index * delay));
    });

    return () => timers.forEach(clearTimeout);
}
