'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Brain, 
  Users, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  MousePointer,
  Keyboard,
  Smartphone,
  MessageCircle,
  Network
} from 'lucide-react';

interface BiometricData {
  biometricScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  anomalies: string[];
  profiles: {
    keystroke: { score: number; avgDwellTime: number };
    mouse: { score: number; velocity: number };
    touch: { score: number; avgPressure: number };
    timing: { score: number; avgTiming: number };
  };
  confidence: number;
  recommendations: string[];
}

interface EmotionalData {
  emotionalState: string;
  stressLevel: number;
  fraudRiskIndicators: string[];
  recommendations: string[];
  confidence: number;
  detailedAnalysis: {
    voice: { stressLevel: number; flags: string[] } | null;
    text: { stressLevel: number; flags: string[] } | null;
    behavior: { stressLevel: number; flags: string[] } | null;
  };
}

interface SocialNetworkData {
  fraudRingScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  suspiciousConnections: string[];
  fraudRingIndicators: string[];
  recommendations: string[];
  networkInsights: {
    connectionRisk: { riskScore: number; metrics: any };
    communicationRisk: { riskScore: number; metrics: any };
    transactionRisk: { riskScore: number; metrics: any };
  };
}

export default function InnovativeFraudDemo() {
  const [activeTab, setActiveTab] = useState('biometrics');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [biometricData, setBiometricData] = useState<BiometricData | null>(null);
  const [emotionalData, setEmotionalData] = useState<EmotionalData | null>(null);
  const [socialData, setSocialData] = useState<SocialNetworkData | null>(null);

  // Simulate real-time data collection
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'biometrics' && !biometricData) {
        simulateBiometricAnalysis();
      } else if (activeTab === 'emotional' && !emotionalData) {
        simulateEmotionalAnalysis();
      } else if (activeTab === 'social' && !socialData) {
        simulateSocialAnalysis();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeTab, biometricData, emotionalData, socialData]);

  const simulateBiometricAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setBiometricData({
        biometricScore: 0.85,
        riskLevel: 'low',
        anomalies: ['Slightly elevated typing speed'],
        profiles: {
          keystroke: { score: 0.92, avgDwellTime: 118 },
          mouse: { score: 0.88, velocity: 145 },
          touch: { score: 0.95, avgPressure: 0.72 },
          timing: { score: 0.79, avgTiming: 2100 }
        },
        confidence: 0.94,
        recommendations: ['User behavior matches known patterns', 'Continue with normal flow']
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const simulateEmotionalAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setEmotionalData({
        emotionalState: 'Slightly Elevated Stress',
        stressLevel: 0.35,
        fraudRiskIndicators: ['Minor hesitation detected in responses'],
        recommendations: ['Slight concern - normal monitoring protocols'],
        confidence: 0.78,
        detailedAnalysis: {
          voice: { stressLevel: 0.3, flags: ['Slightly elevated pitch variation'] },
          text: { stressLevel: 0.2, flags: [] },
          behavior: { stressLevel: 0.55, flags: ['Extended hesitation before actions'] }
        }
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const simulateSocialAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setSocialData({
        fraudRingScore: 0.15,
        riskLevel: 'low',
        suspiciousConnections: [],
        fraudRingIndicators: [],
        recommendations: ['No significant fraud ring indicators', 'Continue normal operations'],
        networkInsights: {
          connectionRisk: { riskScore: 0.1, metrics: { totalConnections: 45, unknownRatio: 0.2 } },
          communicationRisk: { riskScore: 0.15, metrics: { averageResponseTime: 45000, nightCommunicationRatio: 0.1 } },
          transactionRisk: { riskScore: 0.2, metrics: { sharedMerchantCount: 3, deviceOverlapCount: 0 } }
        }
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const resetAnalysis = () => {
    setBiometricData(null);
    setEmotionalData(null);
    setSocialData(null);
    setIsAnalyzing(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Revolutionary Fraud Detection Demo
          </h1>
          <p className="text-gray-300 text-lg">
            Experience industry-first AI innovations in real-time fraud detection
          </p>
          <Button 
            onClick={resetAnalysis}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Reset All Analysis
          </Button>
        </div>

        {/* Innovation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger 
              value="biometrics" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Behavioral Biometrics
            </TabsTrigger>
            <TabsTrigger 
              value="emotional" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Brain className="w-4 h-4 mr-2" />
              Emotional AI
            </TabsTrigger>
            <TabsTrigger 
              value="social" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <Network className="w-4 h-4 mr-2" />
              Social Network Analysis
            </TabsTrigger>
          </TabsList>

          {/* Behavioral Biometrics */}
          <TabsContent value="biometrics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-400">
                    <Activity className="w-5 h-5" />
                    Real-time Biometric Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isAnalyzing ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-300">Analyzing behavioral patterns...</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Keystroke Dynamics</span>
                          <span>Analyzing...</span>
                        </div>
                        <Progress value={85} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Mouse Patterns</span>
                          <span>Processing...</span>
                        </div>
                        <Progress value={70} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Touch Pressure</span>
                          <span>Complete</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                    </div>
                  ) : biometricData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Biometric Score</span>
                        <Badge className={getRiskColor(biometricData.riskLevel)}>
                          {(biometricData.biometricScore * 100).toFixed(1)}% Match
                        </Badge>
                      </div>
                      <Progress value={biometricData.biometricScore * 100} className="h-3" />
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center p-3 rounded-lg bg-gray-700/30">
                          <Keyboard className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                          <div className="text-sm text-gray-300">Keystroke</div>
                          <div className="font-semibold">{(biometricData.profiles.keystroke.score * 100).toFixed(0)}%</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-gray-700/30">
                          <MousePointer className="w-6 h-6 mx-auto mb-2 text-green-400" />
                          <div className="text-sm text-gray-300">Mouse</div>
                          <div className="font-semibold">{(biometricData.profiles.mouse.score * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Start typing or moving mouse to begin analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-400">
                    <Eye className="w-5 h-5" />
                    Biometric Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {biometricData ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {biometricData.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {biometricData.anomalies.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 text-yellow-400">Anomalies Detected</h4>
                          <ul className="space-y-1">
                            {biometricData.anomalies.map((anomaly, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300">{anomaly}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-700">
                        <div className="flex justify-between text-sm">
                          <span>Confidence Level</span>
                          <span className="font-semibold">{(biometricData.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <p>Insights will appear after analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Emotional AI */}
          <TabsContent value="emotional" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-400">
                    <Brain className="w-5 h-5" />
                    Emotional State Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isAnalyzing ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="animate-pulse w-16 h-16 bg-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Brain className="w-8 h-8 text-purple-400" />
                        </div>
                        <p className="text-gray-300">Analyzing emotional patterns...</p>
                      </div>
                    </div>
                  ) : emotionalData ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400 mb-2">
                          {emotionalData.emotionalState}
                        </div>
                        <Progress value={emotionalData.stressLevel * 100} className="h-3" />
                        <div className="text-sm text-gray-300 mt-2">
                          Stress Level: {(emotionalData.stressLevel * 100).toFixed(0)}%
                        </div>
                      </div>

                      {emotionalData.detailedAnalysis.voice && (
                        <div className="p-3 rounded-lg bg-gray-700/30">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">Voice Analysis</span>
                          </div>
                          <div className="text-sm text-gray-300">
                            Stress: {(emotionalData.detailedAnalysis.voice.stressLevel * 100).toFixed(0)}%
                          </div>
                        </div>
                      )}

                      {emotionalData.detailedAnalysis.behavior && (
                        <div className="p-3 rounded-lg bg-gray-700/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-green-400" />
                            <span className="font-medium">Behavior Analysis</span>
                          </div>
                          <div className="text-sm text-gray-300">
                            Stress: {(emotionalData.detailedAnalysis.behavior.stressLevel * 100).toFixed(0)}%
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Speak or interact to begin emotional analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-400">
                    <AlertTriangle className="w-5 h-5" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {emotionalData ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Fraud Risk Indicators</h4>
                        {emotionalData.fraudRiskIndicators.length > 0 ? (
                          <ul className="space-y-1">
                            {emotionalData.fraudRiskIndicators.map((indicator, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300">{indicator}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-green-400 text-sm">No significant risk indicators detected</p>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {emotionalData.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <p>Risk assessment will appear after analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Network Analysis */}
          <TabsContent value="social" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Network className="w-5 h-5" />
                    Network Fraud Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isAnalyzing ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="animate-pulse w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Network className="w-8 h-8 text-green-400" />
                        </div>
                        <p className="text-gray-300">Analyzing social network patterns...</p>
                      </div>
                    </div>
                  ) : socialData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Fraud Ring Score</span>
                        <Badge className={getRiskColor(socialData.riskLevel)}>
                          {(socialData.fraudRingScore * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress value={socialData.fraudRingScore * 100} className="h-3" />

                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-lg bg-gray-700/30">
                          <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                          <div className="text-sm text-gray-300">Connections</div>
                          <div className="font-semibold">{(socialData.networkInsights.connectionRisk.riskScore * 100).toFixed(0)}%</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-gray-700/30">
                          <MessageCircle className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                          <div className="text-sm text-gray-300">Communication</div>
                          <div className="font-semibold">{(socialData.networkInsights.communicationRisk.riskScore * 100).toFixed(0)}%</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-gray-700/30">
                          <Zap className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                          <div className="text-sm text-gray-300">Transactions</div>
                          <div className="font-semibold">{(socialData.networkInsights.transactionRisk.riskScore * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Connect with others to begin network analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-400">
                    <Eye className="w-5 h-5" />
                    Network Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {socialData ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Network Status</h4>
                        <p className="text-green-400 text-sm">Healthy social network patterns detected</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {socialData.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-gray-700">
                        <div className="text-sm text-gray-300">
                          Network connections analyzed: {socialData.networkInsights.connectionRisk.metrics.totalConnections}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <p>Network insights will appear after analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
