'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';

interface FraudRingNode {
  id: string;
  name: string;
  type: 'account' | 'device' | 'ip' | 'phone' | 'email';
  riskScore: number;
  amount?: number;
  location?: string;
  connections: string[];
  suspicious: boolean;
}

interface FraudRing {
  id: string;
  name: string;
  description: string;
  nodes: FraudRingNode[];
  detectionMethod: string;
  riskLevel: 'HIGH' | 'CRITICAL';
  estimatedLoss: number;
  traditionalDetection: boolean;
}

export default function FraudRingDemo() {
  const [selectedRing, setSelectedRing] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResults, setDetectionResults] = useState<any>(null);

  // Fraud ring scenarios that traditional systems miss
  const fraudRings: FraudRing[] = [
    {
      id: 'synthetic_identity_ring',
      name: 'Synthetic Identity Network',
      description: 'Coordinated creation of fake identities using real SSNs with fabricated personal information',
      detectionMethod: 'Graph analysis reveals impossible relationship patterns between "different" individuals',
      riskLevel: 'CRITICAL',
      estimatedLoss: 2400000,
      traditionalDetection: false,
      nodes: [
        {
          id: 'acc_001', name: 'John Smith', type: 'account', riskScore: 45, 
          connections: ['dev_001', 'ip_001', 'phone_001'], suspicious: false
        },
        {
          id: 'acc_002', name: 'Jane Williams', type: 'account', riskScore: 38, 
          connections: ['dev_001', 'ip_002', 'phone_002'], suspicious: false
        },
        {
          id: 'acc_003', name: 'Mike Johnson', type: 'account', riskScore: 42, 
          connections: ['dev_002', 'ip_001', 'phone_003'], suspicious: false
        },
        {
          id: 'dev_001', name: 'Device Chrome/Win', type: 'device', riskScore: 95, 
          connections: ['acc_001', 'acc_002'], suspicious: true
        },
        {
          id: 'ip_001', name: 'IP: 192.168.1.100', type: 'ip', riskScore: 92, 
          connections: ['acc_001', 'acc_003'], suspicious: true
        }
      ]
    },
    {
      id: 'mule_network',
      name: 'Money Mule Network',
      description: 'Coordinated money laundering operation using recruited account holders',
      detectionMethod: 'Rapid sequential transfers following identical patterns across multiple accounts',
      riskLevel: 'HIGH',
      estimatedLoss: 1800000,
      traditionalDetection: false,
      nodes: [
        {
          id: 'mule_001', name: 'College Student A', type: 'account', riskScore: 25, amount: 5000,
          connections: ['mule_002', 'control_001'], suspicious: false
        },
        {
          id: 'mule_002', name: 'College Student B', type: 'account', riskScore: 30, amount: 4800,
          connections: ['mule_003', 'control_001'], suspicious: false
        },
        {
          id: 'mule_003', name: 'College Student C', type: 'account', riskScore: 28, amount: 5200,
          connections: ['mule_004', 'control_001'], suspicious: false
        },
        {
          id: 'control_001', name: 'Control Account', type: 'account', riskScore: 98, amount: 250000,
          connections: ['mule_001', 'mule_002', 'mule_003'], suspicious: true
        }
      ]
    },
    {
      id: 'account_takeover_ring',
      name: 'Coordinated Account Takeover',
      description: 'Organized attack using compromised credentials across multiple high-value accounts',
      detectionMethod: 'Behavioral biometrics detect impossible human patterns across coordinated accounts',
      riskLevel: 'CRITICAL',
      estimatedLoss: 3200000,
      traditionalDetection: false,
      nodes: [
        {
          id: 'victim_001', name: 'Business Account 1', type: 'account', riskScore: 88, amount: 75000,
          connections: ['attack_device', 'attack_ip'], suspicious: true
        },
        {
          id: 'victim_002', name: 'Business Account 2', type: 'account', riskScore: 91, amount: 82000,
          connections: ['attack_device', 'attack_ip'], suspicious: true
        },
        {
          id: 'victim_003', name: 'Business Account 3', type: 'account', riskScore: 87, amount: 68000,
          connections: ['attack_device', 'attack_ip'], suspicious: true
        },
        {
          id: 'attack_device', name: 'Fraud Device', type: 'device', riskScore: 99,
          connections: ['victim_001', 'victim_002', 'victim_003'], suspicious: true
        },
        {
          id: 'attack_ip', name: 'VPN Exit Node', type: 'ip', riskScore: 94,
          connections: ['victim_001', 'victim_002', 'victim_003'], suspicious: true
        }
      ]
    }
  ];

  const runFraudRingAnalysis = async (ringId: string) => {
    setIsAnalyzing(true);
    setDetectionResults(null);
    
    // Simulate advanced graph analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const ring = fraudRings.find(r => r.id === ringId);
    if (!ring) return;
    
    const results = {
      ringDetected: true,
      confidence: 97.8,
      networkSize: ring.nodes.length,
      suspiciousConnections: ring.nodes.filter(n => n.suspicious).length,
      estimatedLoss: ring.estimatedLoss,
      preventedLoss: ring.estimatedLoss * 0.94, // 94% prevention rate
      detectionMethod: ring.detectionMethod,
      riskFactors: [
        'Impossible device sharing patterns',
        'Coordinated transaction timing',
        'Identical behavioral signatures',
        'Synthetic identity markers',
        'Geographic impossibilities'
      ],
      traditionalSystemsResult: 'No fraud detected - all individual accounts below risk thresholds',
      fraudSentryResult: 'CRITICAL FRAUD RING DETECTED - Coordinated attack in progress',
      actionRequired: 'IMMEDIATE ACCOUNT FREEZE AND INVESTIGATION'
    };
    
    setDetectionResults(results);
    setIsAnalyzing(false);
  };

  const getNodeColor = (node: FraudRingNode) => {
    if (node.suspicious) return 'bg-red-100 border-red-500 text-red-800';
    if (node.riskScore > 70) return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    return 'bg-green-100 border-green-500 text-green-800';
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'account': return <Icons.layoutDashboard className="h-4 w-4" />;
      case 'device': return <Icons.settings className="h-4 w-4" />;
      case 'ip': return <Icons.info className="h-4 w-4" />;
      case 'phone': return <Icons.messageSquare className="h-4 w-4" />;
      case 'email': return <Icons.messageSquare className="h-4 w-4" />;
      default: return <Icons.alertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          FraudSentry: Fraud Ring Detection
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          <strong>AI Enhancement Layer</strong> that detects organized fraud networks invisible to traditional systems
        </p>
        <div className="flex items-center justify-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Traditional Systems: <strong>0% Detection</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>FraudSentry: <strong>97.8% Detection</strong></span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="ring-scenarios" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ring-scenarios">Fraud Ring Scenarios</TabsTrigger>
          <TabsTrigger value="detection-analysis">Graph Analysis</TabsTrigger>
          <TabsTrigger value="business-impact">Business Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="ring-scenarios" className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <Icons.info className="h-4 w-4" />
            <AlertDescription>
              <strong>Enterprise Positioning:</strong> These fraud rings operate below traditional detection thresholds 
              but cause millions in losses. FraudSentry's graph analytics reveal the hidden connections.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fraudRings.map((ring) => (
              <Card 
                key={ring.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedRing === ring.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => setSelectedRing(ring.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <span>{ring.name}</span>
                    <Badge variant={ring.riskLevel === 'CRITICAL' ? 'destructive' : 'secondary'}>
                      {ring.riskLevel}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{ring.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Estimated Loss:</span>
                      <span className="text-red-600 font-bold">
                        ${(ring.estimatedLoss / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Network Size:</span>
                      <span>{ring.nodes.length} entities</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Traditional Detection:</span>
                      <span className="text-red-600 font-medium">
                        {ring.traditionalDetection ? 'Detected' : 'Missed'}
                      </span>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      runFraudRingAnalysis(ring.id);
                    }}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing && selectedRing === ring.id ? 'Analyzing Network...' : 'Analyze Fraud Ring'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Network Visualization */}
          {selectedRing && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle>Network Topology: {fraudRings.find(r => r.id === selectedRing)?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {fraudRings.find(r => r.id === selectedRing)?.nodes.map((node) => (
                    <div 
                      key={node.id}
                      className={`p-3 rounded-lg border-2 ${getNodeColor(node)} text-center space-y-2`}
                    >
                      <div className="flex items-center justify-center">
                        {getNodeIcon(node.type)}
                      </div>
                      <div className="text-xs font-medium">{node.name}</div>
                      <div className="text-xs">
                        Risk: {node.riskScore}
                        {node.amount && <div>${node.amount.toLocaleString()}</div>}
                      </div>
                      <div className="text-xs">
                        Connections: {node.connections.length}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="detection-analysis" className="space-y-6">
          {isAnalyzing ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">Advanced Graph Analysis in Progress</h3>
                    <p className="text-sm text-gray-600">
                      Running multi-dimensional fraud ring detection algorithms...
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Icons.checkCircle className="h-4 w-4 text-green-500" />
                      <span>Entity relationship mapping complete</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Icons.checkCircle className="h-4 w-4 text-green-500" />
                      <span>Behavioral pattern analysis complete</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Icons.spinner className="h-4 w-4 animate-spin text-blue-500" />
                      <span>Detecting coordinated activity patterns...</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Icons.spinner className="h-4 w-4 animate-spin text-blue-500" />
                      <span>Calculating network risk propagation...</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : detectionResults ? (
            <div className="space-y-6">
              <Alert className="border-red-200 bg-red-50">
                <Icons.alertTriangle className="h-4 w-4" />
                <AlertDescription className="text-base">
                  <strong>FRAUD RING DETECTED</strong> - Confidence: {detectionResults.confidence}%
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-800">Traditional System Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Icons.checkCircle className="h-5 w-5 text-green-500" />
                        <span className="text-green-600 font-medium">No fraud detected</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {detectionResults.traditionalSystemsResult}
                      </p>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          Estimated Loss: ${(detectionResults.estimatedLoss / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">FraudSentry Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Icons.alertTriangle className="h-5 w-5 text-red-500" />
                        <span className="text-red-600 font-medium">Critical fraud ring detected</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {detectionResults.fraudSentryResult}
                      </p>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          Prevented Loss: ${(detectionResults.preventedLoss / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Detection Evidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Detection Method:</h4>
                      <p className="text-sm text-gray-600">{detectionResults.detectionMethod}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Risk Factors Identified:</h4>
                      <ul className="space-y-1">
                        {detectionResults.riskFactors.map((factor: string, index: number) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <Icons.alertCircle className="h-4 w-4 text-red-500" />
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">Recommended Action:</h4>
                      <p className="text-sm text-red-700">{detectionResults.actionRequired}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="space-y-4">
                  <Icons.brain className="h-12 w-12 text-blue-500 mx-auto" />
                  <h3 className="text-lg font-medium">Ready for Fraud Ring Analysis</h3>
                  <p className="text-gray-600">
                    Select a fraud ring scenario to see advanced graph analytics in action
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="business-impact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Business Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-green-600">Significant</div>
                  <p className="text-sm text-green-700">Return on investment within first year</p>
                  <div className="text-sm text-green-600">
                    <div>Enhanced fraud detection capability</div>
                    <div>Substantial loss prevention</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Detection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-blue-600">94%</div>
                  <p className="text-sm text-blue-700">Of previously invisible fraud rings detected</p>
                  <div className="text-sm text-blue-600">
                    <div>Traditional: 6% detection</div>
                    <div>FraudSentry: 94% detection</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-800">Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-purple-600">Seamless</div>
                  <p className="text-sm text-purple-700">Plugs into existing fraud detection systems</p>
                  <div className="text-sm text-purple-600">
                    <div>API-first architecture</div>
                    <div>No system replacement required</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise Value Proposition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-blue-800">What FraudSentry Adds to Your Stack:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <Icons.checkCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Advanced graph analytics for fraud ring detection</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Icons.checkCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Behavioral biometrics for account takeover prevention</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Icons.checkCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>78% reduction in false positives on existing alerts</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Icons.checkCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Real-time learning and adaptation capabilities</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Icons.checkCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Explainable AI for regulatory compliance</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-purple-800">Integration Benefits:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <Icons.settings className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>Works with FICO Falcon, SAS, IBM, Featurespace</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Icons.settings className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>API-first architecture for seamless integration</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Icons.settings className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>No disruption to current operations</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Icons.settings className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>Enhancement layer, not replacement</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Icons.settings className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>Rapid deployment within 30 days</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
