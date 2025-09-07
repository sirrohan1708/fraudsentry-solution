import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/icons';
import { UnifiedDetectionOutput } from '@/ai/flows/unified-fraud-detection';

interface UnifiedResultsDisplayProps {
  result: UnifiedDetectionOutput;
  transactionId: string;
}

export function UnifiedResultsDisplay({ result, transactionId }: UnifiedResultsDisplayProps) {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'SAFE': return 'bg-green-100 text-green-800 border-green-200';
      case 'SUSPICIOUS': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FRAUDULENT': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 35) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Main Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Enhanced Detection Results</span>
            <Badge className={getRiskLevelColor(result.riskLevel)}>
              {result.riskLevel}
            </Badge>
          </CardTitle>
          <CardDescription>
            Transaction {transactionId} analyzed with multi-layer fraud detection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score and Confidence */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Fraud Risk Score</div>
              <div className={`text-2xl font-bold ${getScoreColor(result.fraudRiskScore)}`}>
                {result.fraudRiskScore}%
              </div>
              <Progress 
                value={result.fraudRiskScore} 
                className="mt-2"
                // @ts-ignore
                indicatorClassName={result.fraudRiskScore >= 70 ? 'bg-red-500' : result.fraudRiskScore >= 35 ? 'bg-yellow-500' : 'bg-green-500'}
              />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Confidence Level</div>
              <div className="text-2xl font-bold text-blue-600">
                {result.confidence}%
              </div>
              <Progress 
                value={result.confidence} 
                className="mt-2"
                // @ts-ignore
                indicatorClassName="bg-blue-500"
              />
            </div>
          </div>

          {/* Detection Layers */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Detection Layer Breakdown</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Scripted Rules:</span>
                <span className="font-medium">{result.detectionLayers.scriptedScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">AI Enhancement:</span>
                <span className="font-medium">{result.detectionLayers.agentScore}%</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-medium text-gray-700">Final Fused Score:</span>
                <span className="font-bold text-blue-600">{result.detectionLayers.fusedScore}%</span>
              </div>
            </div>
          </div>

          {/* Processing Time */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Processing Time:</span>
            <span className="font-medium">{(result.processingTime / 1000).toFixed(2)}s</span>
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icons.brain className="h-5 w-5 mr-2" />
            Behavioral Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Behavior Pattern</div>
            <div className="text-gray-800">{result.behaviorPattern}</div>
          </div>
          
          {result.riskTags.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Risk Indicators</div>
              <div className="flex flex-wrap gap-2">
                {result.riskTags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Agent Insights */}
      {result.agentInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icons.info className="h-5 w-5 mr-2" />
              AI Agent Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.agentInsights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div className="text-sm text-gray-700">{insight}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detection Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icons.shieldCheck className="h-5 w-5 mr-2" />
            Detection Methods Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {result.detectionMethods.map((method, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-700">{method}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-500 mb-2">AI Explanation</div>
            <div className="text-gray-800 text-sm leading-relaxed">{result.explanation}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500 mb-2">Transaction Insights</div>
            <div className="text-gray-800 text-sm leading-relaxed">{result.insights}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
