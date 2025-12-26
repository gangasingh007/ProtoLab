'use client';

import { useState } from 'react';
import { aiAPI } from '@/lib/api';
import Button from '@/components/shared/Button';
import toast from 'react-hot-toast';

interface AIInsightsProps {
  experimentId: string;
}

export default function AIInsights({ experimentId }: AIInsightsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [keyInfo, setKeyInfo] = useState<any>(null);

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    try {
      const { data } = await aiAPI.suggestNextSteps(experimentId);
      setSuggestion(data.suggestion);
      toast.success('AI suggestion generated!');
    } catch (error) {
      toast.error('Failed to generate suggestion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractInfo = async () => {
    setIsLoading(true);
    try {
      const { data } = await aiAPI.extractKeyInfo(experimentId);
      setKeyInfo(data);
      toast.success('Key information extracted!');
    } catch (error) {
      toast.error('Failed to extract information');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Insights</h3>

      <div className="space-y-4">
        <div>
          <Button
            onClick={handleGetSuggestion}
            isLoading={isLoading}
            className="w-full"
          >
            Get AI Suggestions for Next Steps
          </Button>
          
          {suggestion && (
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{suggestion}</p>
            </div>
          )}
        </div>

        <div>
          <Button
            onClick={handleExtractInfo}
            isLoading={isLoading}
            variant="secondary"
            className="w-full"
          >
            Extract Key Information
          </Button>
          
          {keyInfo && (
            <div className="mt-3 space-y-3">
              {keyInfo.methods.length > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="font-medium text-sm text-green-900 mb-1">Methods:</p>
                  <ul className="list-disc list-inside text-sm text-green-800">
                    {keyInfo.methods.map((method: string, i: number) => (
                      <li key={i}>{method}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {keyInfo.metrics.length > 0 && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                  <p className="font-medium text-sm text-purple-900 mb-1">Metrics:</p>
                  <ul className="list-disc list-inside text-sm text-purple-800">
                    {keyInfo.metrics.map((metric: string, i: number) => (
                      <li key={i}>{metric}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {keyInfo.findings.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="font-medium text-sm text-yellow-900 mb-1">Findings:</p>
                  <ul className="list-disc list-inside text-sm text-yellow-800">
                    {keyInfo.findings.map((finding: string, i: number) => (
                      <li key={i}>{finding}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
