import { useCallback } from 'react';

export const useClipboard = () => {
    const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy text:', error);
            return false;
        }
    }, []);

    return { copyToClipboard };
};
