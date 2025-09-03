"use client";

import { CheckCircle } from "lucide-react";

interface SuccessDisplayProps {
  message: string;
  className?: string;
}

export default function SuccessDisplay({
  message,
  className = "",
}: SuccessDisplayProps) {
  return (
    <div
      className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-green-700">{message}</p>
        </div>
      </div>
    </div>
  );
}
