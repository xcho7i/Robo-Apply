import { CoinsIcon, Bell, User, MoreVertical } from 'lucide-react';

export default function Header() {
    return (
        <div className="bg-[#000] shadow-sm border-b border-gray-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-40 h-10">
                            <img src="/logo.svg" alt="AI Interview Copilot" className="h-10 w-40" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">AI Interview Copilot</h1>
                            <p className="text-sm text-gray-300">Real-time interview question analysis & response generation</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Session Stats */}
                        <div className="hidden md:flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <CoinsIcon className="h-8 w-8 text-white p-1 border border-white rounded-[10px]" />
                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex flex-col items-center gap-1`}>
                                    <span className="text-white font-bold">
                                        0
                                    </span>
                                    <span className="text-gray-300 text-xs">
                                        Credits
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2 relative">
                                <Bell className="h-8 w-8 text-white p-1 border border-white rounded-[10px]" />
                                <span className="text-gray-300 text-xs bg-red-500 rounded-full px-2 py-1 absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-white">
                                    1
                                </span>
                            </div>
                            <div className="flex items-center gap-2 cursor-pointer bg-[#1a1a1a] rounded-lg p-2">
                                <User className="h-8 w-8 text-white p-1 border border-white rounded-[10px]" />
                                <div className="flex flex-col">
                                    <span className="text-white text-sm font-medium">
                                        Testing Testing2
                                    </span>
                                    <span className="text-gray-300 text-xs">
                                        testingtesting211@gmail.com
                                    </span>
                                </div>
                                <MoreVertical className="h-4 w-4 text-white" />
                            </div>  
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
