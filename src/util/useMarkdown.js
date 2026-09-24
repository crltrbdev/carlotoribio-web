import { useEffect, useState } from 'react';

// Fetches a bundled markdown asset (imported as a URL) and returns its text.
export function useMarkdown(url) {
    const [markdown, setMarkdown] = useState('');
    const [isLoading, setIsLoading] = useState(Boolean(url));

    useEffect(() => {
        let cancelled = false;

        if (!url) {
            setMarkdown('');
            setIsLoading(false);
            return () => { cancelled = true; };
        }

        setIsLoading(true);

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load markdown: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                if (!cancelled) {
                    setMarkdown(text);
                    setIsLoading(false);
                }
            })
            .catch(error => {
                console.error(error);
                if (!cancelled) {
                    setMarkdown('');
                    setIsLoading(false);
                }
            });

        return () => { cancelled = true; };
    }, [url]);

    return { markdown, isLoading };
}
