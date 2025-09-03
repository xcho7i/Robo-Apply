import { useState, useEffect } from 'react';
import { Settings, Key, CheckCircle, AlertCircle, Info } from 'lucide-react';
import claudeService from '../services/claude';

interface OpenAIConfigProps {
    onConfigChange?: (configured: boolean) => void;
}

export default function OpenAIConfig({ onConfigChange }: OpenAIConfigProps) {
    const [apiKey, setApiKey] = useState('');
    const [isConfigured, setIsConfigured] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);

    useEffect(() => {
        const configured = claudeService.isConfigured();
        setIsConfigured(configured);
        if (!configured) {
            setShowConfig(true);
        }
        onConfigChange?.(configured);
    }, [onConfigChange]);

    const handleSaveConfig = () => {
        if (apiKey.trim()) {
            // Update the Claude service with the new API key (server-managed)

            // Update local state
            setIsConfigured(true);
            setApiKey('');
            setShowConfig(false);

            // Notify parent component
            onConfigChange?.(true);
        }
    };

    const testConnection = async () => {
        setTestingConnection(true);
        try {
            await claudeService.generateInterviewResponse('Test question: What is your name?');
            alert('✅ Claude connection successful!');
        } catch (error: any) {
            alert(`❌ Connection failed: ${error.message}`);
        } finally {
            setTestingConnection(false);
        }
    };

    const usageInfo = claudeService.getUsageInfo();

    return (
        <div className="bg-[#2c2c2c] rounded-md shadow-lg border border-gray-500 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Claude Configuration
                </h3>
                <button
                    onClick={() => setShowConfig(!showConfig)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    {showConfig ? 'Hide' : 'Show'} Config
                </button>
            </div>

            {/* Status Indicator */}
            <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${isConfigured
                ? 'bg-green-400 text-gray-700 border border-green-200'
                : 'bg-red-400 text-gray-200 border border-red-200'
                }`}>
                {isConfigured ? (
                    <>
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Claude Connected</span>
                        <span className="text-xs">({usageInfo.model} • {usageInfo.source})</span>
                    </>
                ) : (
                    <>
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Claude Not Configured</span>
                    </>
                )}
            </div>

            {showConfig && (
                <div className="space-y-4">
                    <div className="bg-[#2c2c2c] border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-200">
                                <p className="font-medium mb-1">If this plugin is not working, please try the following:</p>
                                <ol className="list-decimal list-inside space-y-1 text-xs">
                                    <li>Get API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">Anthropic Console</a></li>
                                    <li>Enter your API key below and click "Save Configuration"</li>
                                    <li>Restart the plugin</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Claude API Key
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full pl-10 pr-4 py-2 bg-[#202020] text-gray-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                            <button
                                onClick={handleSaveConfig}
                                disabled={!apiKey.trim()}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>

                    {isConfigured && (
                        <div className="flex gap-2">
                            <button
                                onClick={testConnection}
                                disabled={testingConnection}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                {testingConnection ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Testing...
                                    </>
                                ) : (
                                    'Test Connection'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}