import { useState, useCallback } from 'react';
import mammoth from 'mammoth';
import { api } from '../services/backend';

interface UseFileUploadOptions {
    onSuccess: (text: string, file?: File) => void;
    onError: (error: string) => void;
}

interface UseFileUploadReturn {
    isUploading: boolean;
    error: string | null;
    uploadFile: (file: File) => Promise<void>;
    clearError: () => void;
}

export const useFileUpload = ({ onSuccess, onError }: UseFileUploadOptions): UseFileUploadReturn => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const extractTextFromFile = useCallback(async (file: File): Promise<string> => {
        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
            return await file.text();
        }
        else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });

                if (result.messages.length > 0) {
                    console.warn('Mammoth warnings:', result.messages);
                }

                return result.value || 'No text content found in the document.';
            } catch (error: any) {
                console.error('Error parsing Word document:', error);
                throw new Error(`Failed to parse Word document: ${error.message}. Please try copying and pasting the text instead.`);
            }
        }
        else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            const form = new FormData();
            form.append('file', file);
            const resp = await api.post('/api/files/extract-text', form, { headers: { 'Content-Type': 'multipart/form-data' } });
            const text = resp.data?.text || '';
            if (!text) throw new Error('No text extracted from PDF');
            return text;
        }
        else {
            throw new Error('Unsupported file type. Please use .txt, .doc, .docx files or copy and paste your resume text.');
        }
    }, []);

    const uploadFile = useCallback(async (file: File) => {
        setIsUploading(true);
        setError(null);

        try {
            const text = await extractTextFromFile(file);
            onSuccess(text, file);
        } catch (error: any) {
            const errorMessage = error.message;
            setError(errorMessage);
            onError(errorMessage);
        } finally {
            setIsUploading(false);
        }
    }, [extractTextFromFile, onSuccess, onError]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isUploading,
        error,
        uploadFile,
        clearError
    };
};
