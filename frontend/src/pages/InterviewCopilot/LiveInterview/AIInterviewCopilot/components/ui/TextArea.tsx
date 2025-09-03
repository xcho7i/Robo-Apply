import React from 'react';
import { Edit3, Copy } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';

interface TextAreaProps {
    title: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    showEdit: boolean;
    onToggleEdit: () => void;
    onSave?: (value: string) => void;
    onCancel?: () => void;
    colorScheme: 'purple' | 'orange';
    rows?: number;
}

const colorSchemes = {
    purple: {
        bg: 'bg-gray-800',
        border: 'border-purple-200',
        text: 'text-gray-200',
        focus: '',
        button: 'text-white',
        icon: ''
    },
    orange: {
        bg: 'bg-gray-800',
        border: 'border-orange-200',
        text: 'text-gray-200',
        focus: 'focus:ring-orange-500 focus:border-orange-500',
        button: 'bg-orange-500 hover:bg-orange-600',
        icon: 'text-orange-600'
    }
};

export const TextArea: React.FC<TextAreaProps> = ({
    title,
    placeholder,
    value,
    onChange,
    //@ts-ignore
    onClear,
    showEdit,
    onToggleEdit,
    onSave,
    onCancel,
    colorScheme,
    rows = 4
}) => {
    const { copyToClipboard } = useClipboard();
    const colors = colorSchemes[colorScheme];

    const handleCopyText = async () => {
        await copyToClipboard(value);
    };

    if (!value && !showEdit) {
        return (
            <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Add any additional context for better responses</p>
                <button
                    onClick={onToggleEdit}
                    className={`${colors.button} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto`}
                >
                    <Edit3 className="h-4 w-4" />
                    Add {title}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {showEdit && (
                <div>
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={`w-full p-3 border text-gray-300 bg-[#202020] border-gray-300 rounded-lg text-sm`}
                        style={colorScheme === 'purple' ? { boxShadow: '0 0 0 1px transparent' } : undefined}
                        rows={rows}
                    />
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                            {value.length} characters
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (onCancel) onCancel();
                                    else onToggleEdit();
                                }}
                                className="text-gray-600 hover:text-gray-700 px-3 py-1 text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (onSave) onSave(value);
                                    else onToggleEdit();
                                }}
                                className={`px-3 py-1 rounded text-xs ${colors.button}`}
                                style={colorScheme === 'purple' ? { backgroundColor: '#8b5cf6' } : undefined}
                                disabled={!value.trim()}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {value && !showEdit && (
                <div className={`${colors.bg} border ${colors.border} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Edit3 className={`h-4 w-4 ${colors.icon}`} style={colorScheme === 'purple' ? { color: '#9333ea' } : undefined} />
                            <span className={`text-sm font-medium ${colors.text}`}>
                                {title} Loaded
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopyText}
                                className={`${colors.text} hover:${colors.text.replace('text-', 'text-')} p-1`}
                                title={`Copy ${title.toLowerCase()}`}
                            >
                                <Copy className={`h-3 w-3 ${colors.icon}`} style={colorScheme === 'purple' ? { color: '#9333ea' } : undefined} />
                            </button>
                            <button
                                onClick={onToggleEdit}
                                className={`${colors.text} hover:${colors.text.replace('text-', 'text-')} p-1`}
                                title={`Edit ${title.toLowerCase()}`}
                            >
                                <Edit3 className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                    <div className={`text-xs ${colors.text}`}>
                        ✓ {value.length} characters • Entered manually • Click edit to modify
                    </div>
                    <div className={`mt-2 text-xs ${colors.text} ${colors.bg} rounded p-2 max-h-20 overflow-y-auto`}>
                        {value.substring(0, 200)}
                        {value.length > 200 && '...'}
                    </div>
                </div>
            )}
        </div>
    );
};
