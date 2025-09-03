import React from 'react';
import { Upload, FileText, X, Copy, AlertCircle } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useClipboard } from '../../hooks/useClipboard';

interface FileUploadProps {
    title: string;
    description: string;
    acceptedFileTypes: string[];
    onFileUpload: (text: string, file?: File) => void;
    onClear: () => void;
    currentFile: File | null;
    currentText: string;
    colorScheme: 'blue' | 'purple' | 'green';
}

const colorSchemes = {
    blue: {
        border: 'border-blue-400',
        bg: 'bg-gray-800',
        text: 'text-gray-200',
        hover: 'hover:border-blue-400',
        icon: 'text-blue-600'
    },
    purple: {
        border: 'border-purple-400',
        bg: 'bg-gray-800',
        text: 'text-gray-200',
        hover: 'hover:border-purple-400',
        icon: 'text-purple-600'
    },
    green: {
        border: 'border-green-400',
        bg: 'bg-green-50',
        text: 'text-green-600',
        hover: 'hover:border-green-400',
        icon: 'text-green-600'
    }
};

export const FileUpload: React.FC<FileUploadProps> = ({
    title,
    description,
    acceptedFileTypes,
    onFileUpload,
    onClear,
    currentFile,
    currentText,
    colorScheme
}) => {
    const { isUploading, error, uploadFile, clearError } = useFileUpload({
        onSuccess: (text: string, file?: File) => {
            onFileUpload(text, file);
        },
        onError: (errorMessage) => {
            console.log("Upload error:", errorMessage);
            // You could add a toast notification here
        },
    });

    const { copyToClipboard } = useClipboard();
    const colors = colorSchemes[colorScheme];

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            uploadFile(files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            uploadFile(files[0]);
        }
    };

    const handleCopyText = async () => {
        await copyToClipboard(currentText);
    };

    if (!currentFile) {
        return (
            <div className="space-y-3">
                <div
                    onDrop={handleFileDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className={`border border-dashed border-gray-500 ${colors.hover} transition-colors rounded-lg p-6 text-center cursor-pointer`}
                >
                    <input
                        type="file"
                        accept={acceptedFileTypes.join(',')}
                        onChange={handleFileInputChange}
                        className="hidden"
                        id={`${title.toLowerCase()}-upload`}
                        disabled={isUploading}
                    />
                    <label htmlFor={`${title.toLowerCase()}-upload`} className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">
                            {isUploading ? 'Processing...' : description}
                        </p>
                        <p className="text-xs text-gray-500">
                            Supports: {acceptedFileTypes.join(', ')} files
                        </p>
                    </label>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border rounded-lg" style={{ borderColor: '#fecaca' }}>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" style={{ color: '#dc2626' }} />
                            <span className="text-sm font-medium" style={{ color: '#991b1b' }}>Upload Error</span>
                        </div>
                        <p className="text-sm mt-1" style={{ color: '#b91c1c' }}>{error}</p>
                        <button
                            onClick={clearError}
                            className="text-xs mt-2 hover:underline"
                            style={{ color: '#dc2626' }}
                        >
                            Dismiss
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`${colors.bg} border border-${colorScheme}-200 rounded-lg p-4`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className={`h-4 w-4 ${colors.icon}`} />
                    <span className={`text-sm font-medium ${colors.text}`}>
                        {currentFile.name}
                    </span>
                    <span className="text-xs text-gray-600">
                        ({(currentFile.size / 1024).toFixed(1)} KB)
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopyText}
                        className={`${colors.text} hover:${colors.text.replace('text-', 'text-')} p-1`}
                        title={`Copy ${title.toLowerCase()} text`}
                    >
                        <Copy className="h-3 w-3" />
                    </button>
                    <button
                        onClick={onClear}
                        className="text-red-600 hover:text-red-700 p-1"
                        title={`Remove ${title.toLowerCase()}`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            </div>
            {currentText && (
                <div className="mt-2 text-xs text-green-700">
                    ✓ {title} content extracted ({currentText.length} characters)
                </div>
            )}
        </div>
    );
};
