'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { revolutionaryFraudEngine } from '@/ai/revolutionary/advanced-swarm-intelligence';
import { predictiveFraudPrevention } from '@/ai/revolutionary/predictive-prevention';
import { selfLearningFraudSystem } from '@/ai/revolutionary/self-learning-system';
import { quantumFraudEngine } from '@/ai/revolutionary/quantum-fraud-engine';

interface RevolutionaryAnalysisProps {
  transaction: any;
  relatedTransactions?: any[];
}

interface RevolutionaryInsights {
  swarmAnalysis?: any;
  predictiveAnalysis?: any;
  learningAnalysis?: any;
  quantumAnalysis?: any;
  overallThreatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  revolutionaryScore: number;
  isLoading: boolean;
}

export function RevolutionaryFraudDashboard({ transaction, relatedTransactions = [] }: RevolutionaryAnalysisProps) {
  const [insights, setInsights] = useState<RevolutionaryInsights>({
    overallThreatLevel: 'LOW',
    revolutionaryScore: 0,
    isLoading: true
  });

  const [activeSystem, setActiveSystem] = useState<'swarm' | 'predictive' | 'learning' | 'quantum'>('swarm');

  useEffect(() => {
    if (transaction) {
      analyzeWithRevolutionarySystems();
    }
  }, [transaction]);

  const analyzeWithRevolutionarySystems = async () => {
    setInsights(prev => ({ ...prev, isLoading: true }));

    try {
      // Run all revolutionary systems in parallel
      const [swarmAnalysis, predictiveAnalysis, learningAnalysis, quantumAnalysis] = await Promise.all([
        revolutionaryFraudEngine.analyzeTransaction(transaction),
        predictiveFraudPrevention.predictAndPrevent(transaction, 50), // Default risk of 50
        selfLearningFraudSystem.analyzeAndLearn(transaction),
        quantumFraudEngine.analyzeQuantumFraud(transaction, relatedTransactions)
      ]);

      // Calculate overall revolutionary score
      const revolutionaryScore = calculateRevolutionaryScore({
        swarmAnalysis,
        predictiveAnalysis,
        learningAnalysis,
        quantumAnalysis
      });

      // Determine overall threat level
      const overallThreatLevel = determineOverallThreatLevel(revolutionaryScore);

      setInsights({
        swarmAnalysis,
        predictiveAnalysis,
        learningAnalysis,
        quantumAnalysis,
        overallThreatLevel,
        revolutionaryScore,
        isLoading: false
      });

    } catch (error) {
      console.error('Revolutionary analysis failed:', error);
      setInsights(prev => ({ ...prev, isLoading: false }));
    }
  };

  const calculateRevolutionaryScore = (analyses: any): number => {
    const scores = [
      analyses.swarmAnalysis?.overallRiskScore || 0,
      analyses.predictiveAnalysis?.currentRiskScore || 0,
      analyses.learningAnalysis?.riskScore || 0,
      analyses.quantumAnalysis?.quantumRiskScore || 0
    ];

    // Weighted average with emphasis on quantum and predictive analysis
    const weights = [0.2, 0.3, 0.2, 0.3];
    const weightedScore = scores.reduce((sum, score, index) => sum + score * weights[index], 0);
    
    return Math.round(weightedScore);
  };

  const determineOverallThreatLevel = (score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'default';
      default: return 'default';
    }
  };

  if (insights.isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Revolutionary AI Analysis in Progress...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revolutionary Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Revolutionary Fraud Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{insights.revolutionaryScore}%</span>
                <Badge variant={getThreatLevelColor(insights.overallThreatLevel)}>
                  {insights.overallThreatLevel}
                </Badge>
              </div>
              <Progress value={insights.revolutionaryScore} className="h-2" />
              <p className="text-sm text-muted-foreground">
                AI-powered multi-dimensional fraud analysis
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Quantum Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.quantumAnalysis?.quantumRiskScore?.toFixed(1) || '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">Quantum uncertainty factor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Predictive Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.predictiveAnalysis?.riskEvolution?.next24Hours?.toFixed(1) || '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">24h prediction</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revolutionary Systems Tabs */}
      <Tabs value={activeSystem} onValueChange={(value) => setActiveSystem(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="swarm">🤖 Swarm AI</TabsTrigger>
          <TabsTrigger value="predictive">🔮 Predictive</TabsTrigger>
          <TabsTrigger value="learning">🧠 Self-Learning</TabsTrigger>
          <TabsTrigger value="quantum">⚛️ Quantum</TabsTrigger>
        </TabsList>

        <TabsContent value="swarm" className="space-y-4">
          <SwarmIntelligencePanel analysis={insights.swarmAnalysis} />
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <PredictiveAnalysisPanel analysis={insights.predictiveAnalysis} />
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <SelfLearningPanel analysis={insights.learningAnalysis} />
        </TabsContent>

        <TabsContent value="quantum" className="space-y-4">
          <QuantumAnalysisPanel analysis={insights.quantumAnalysis} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Swarm Intelligence Panel Component
function SwarmIntelligencePanel({ analysis }: { analysis: any }) {
  if (!analysis) return <div>No swarm analysis available</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emotional Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Stress Level</span>
              <span className="font-semibold">{analysis.emotionalAnalysis?.stressLevel?.toFixed(1) || '0.0'}%</span>
            </div>
            <div className="flex justify-between">
              <span>Deception Score</span>
              <span className="font-semibold">{analysis.emotionalAnalysis?.deceptionIndicators?.toFixed(1) || '0.0'}%</span>
            </div>
            <div className="flex justify-between">
              <span>Confidence</span>
              <span className="font-semibold">{analysis.emotionalAnalysis?.confidenceLevel?.toFixed(1) || '0.0'}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Biometric Behavior</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Typing Pattern</span>
              <Badge>{analysis.biometricAnalysis?.typingPattern || 'Normal'}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Device Trust</span>
              <span className="font-semibold">{analysis.biometricAnalysis?.deviceFingerprint?.confidence?.toFixed(1) || '0.0'}%</span>
            </div>
            <div className="flex justify-between">
              <span>Behavioral Match</span>
              <span className="font-semibold">{analysis.biometricAnalysis?.behaviorConsistency?.toFixed(1) || '0.0'}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Swarm Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {analysis.swarmInsights?.map((insight: string, index: number) => (
                <div key={index} className="text-sm p-2 bg-muted rounded">
                  {insight}
                </div>
              )) || <div className="text-sm text-muted-foreground">No insights available</div>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Predictive Analysis Panel Component
function PredictiveAnalysisPanel({ analysis }: { analysis: any }) {
  if (!analysis) return <div>No predictive analysis available</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Risk Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Next 1 Hour</span>
              <span className="font-semibold">{analysis.riskEvolution?.next1Hour?.toFixed(1) || '0.0'}%</span>
            </div>
            <div className="flex justify-between">
              <span>Next 24 Hours</span>
              <span className="font-semibold">{analysis.riskEvolution?.next24Hours?.toFixed(1) || '0.0'}%</span>
            </div>
            <div className="flex justify-between">
              <span>Next 7 Days</span>
              <span className="font-semibold">{analysis.riskEvolution?.next7Days?.toFixed(1) || '0.0'}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Prevention Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Badge>{analysis.preventionStrategy?.strategyType || 'Standard'}</Badge>
            <div className="text-sm">
              <strong>Confidence:</strong> {analysis.preventionStrategy?.confidence?.toFixed(1) || '0.0'}%
            </div>
            <div className="text-sm">
              <strong>Window:</strong> {analysis.preventionStrategy?.interventionWindow || 'Unknown'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Predicted Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {analysis.scenarios?.slice(0, 3).map((scenario: any, index: number) => (
                <div key={index} className="p-2 border rounded">
                  <div className="font-semibold text-sm">{scenario.scenario}</div>
                  <div className="text-xs text-muted-foreground">
                    Probability: {scenario.probability?.toFixed(1) || '0.0'}%
                  </div>
                </div>
              )) || <div className="text-sm text-muted-foreground">No scenarios predicted</div>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Self-Learning Panel Component
function SelfLearningPanel({ analysis }: { analysis: any }) {
  if (!analysis) return <div>No learning analysis available</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Learning Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>System Maturity</span>
              <Badge>{analysis.modelPerformance ? 'EXPERT' : 'LEARNING'}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Adaptation Rate</span>
              <span className="font-semibold">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Pattern Discovery</span>
              <span className="font-semibold">Continuous</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Novel Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.novelPatterns ? (
              <>
                <div className="flex justify-between">
                  <span>Novelty Score</span>
                  <span className="font-semibold">{(analysis.novelPatterns.noveltyScore * 100).toFixed(1)}%</span>
                </div>
                <Badge variant={analysis.novelPatterns.isNovel ? 'destructive' : 'default'}>
                  {analysis.novelPatterns.isNovel ? 'Novel Pattern' : 'Known Pattern'}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Risk: {analysis.novelPatterns.riskAssessment}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No pattern analysis available</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Learning Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {analysis.learningInsights?.map((insight: string, index: number) => (
                <div key={index} className="text-sm p-2 bg-muted rounded">
                  {insight}
                </div>
              )) || <div className="text-sm text-muted-foreground">No insights available</div>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Quantum Analysis Panel Component
function QuantumAnalysisPanel({ analysis }: { analysis: any }) {
  if (!analysis) return <div>No quantum analysis available</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quantum Superposition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Uncertainty</span>
              <span className="font-semibold">{(analysis.uncertaintyFactor * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Entropy</span>
              <span className="font-semibold">{analysis.superpositionAnalysis?.quantumEntropy?.toFixed(3) || '0.000'}</span>
            </div>
            <div className="flex justify-between">
              <span>Decoherence Risk</span>
              <span className="font-semibold">{(analysis.decoherenceRisk * 100).toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quantum Tunneling</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Tunneling Probability</span>
              <span className="font-semibold">{(analysis.tunnelingAnalysis?.tunnelingProbability * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Barrier Penetration</span>
              <span className="font-semibold">{(analysis.tunnelingAnalysis?.barrierPenetration * 100).toFixed(1)}%</span>
            </div>
            <Badge variant={analysis.tunnelingAnalysis?.fraudBreakthrough ? 'destructive' : 'default'}>
              {analysis.tunnelingAnalysis?.fraudBreakthrough ? 'Breakthrough Detected' : 'Secure'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Quantum Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {analysis.quantumInsights?.map((insight: string, index: number) => (
                <div key={index} className="text-sm p-2 bg-muted rounded">
                  {insight}
                </div>
              )) || <div className="text-sm text-muted-foreground">No quantum insights available</div>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
