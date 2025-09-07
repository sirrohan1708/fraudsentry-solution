'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

// TypeScript interface for chargeback data
interface ChargebackCase {
  id: string;
  transactionId: string;
  customerId: string;
  amount: number;
  reasonCode: string;
  description: string;
  classification: 'FriendlyFraud' | 'Genuine' | 'TrueFraud' | 'ReviewNeeded';
  confidence: number;
  winProbability: number;
  recommendedAction: 'Dispute' | 'AutoAccept' | 'Investigate' | 'Settle';
  urgencyLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  friendlyFraudRisk: number;
  estimatedCost: number;
  timeToResolve: number;
  customerTone: 'Aggressive' | 'Neutral' | 'Polite' | 'Confused';
  transactionDate: string;
  chargebackDate: string;
  merchantCategory: string;
}

// Mock chargeback data demonstrating the AI intelligence
const mockChargebacks: ChargebackCase[] = [
  {
    id: 'CB_001',
    transactionId: 'TXN_789123',
    customerId: 'CUST_456',
    amount: 299.99,
    reasonCode: '4855',
    description: "I don't remember making this purchase and it's not in my records",
    classification: 'FriendlyFraud',
    confidence: 87,
    winProbability: 78,
    recommendedAction: 'Dispute',
    urgencyLevel: 'High',
    friendlyFraudRisk: 85,
    estimatedCost: 89.45,
    timeToResolve: 12,
    customerTone: 'Aggressive',
    transactionDate: '2024-11-15',
    chargebackDate: '2024-12-01',
    merchantCategory: 'Electronics',
  },
  {
    id: 'CB_002',
    transactionId: 'TXN_567890',
    customerId: 'CUST_789',
    amount: 45.00,
    reasonCode: '10.4',
    description: "Item never arrived at my address, tracking shows delivered but I wasn't home",
    classification: 'Genuine',
    confidence: 92,
    winProbability: 25,
    recommendedAction: 'AutoAccept',
    urgencyLevel: 'Low',
    friendlyFraudRisk: 15,
    estimatedCost: 70.00,
    timeToResolve: 3,
    customerTone: 'Polite',
    transactionDate: '2024-11-20',
    chargebackDate: '2024-11-28',
    merchantCategory: 'Retail',
  },
  {
    id: 'CB_003',
    transactionId: 'TXN_345678',
    customerId: 'CUST_123',
    amount: 1299.99,
    reasonCode: '4837',
    description: "Unauthorized transaction - my card was stolen and used for this purchase",
    classification: 'TrueFraud',
    confidence: 95,
    winProbability: 85,
    recommendedAction: 'Dispute',
    urgencyLevel: 'Critical',
    friendlyFraudRisk: 5,
    estimatedCost: 234.50,
    timeToResolve: 21,
    customerTone: 'Neutral',
    transactionDate: '2024-11-25',
    chargebackDate: '2024-11-27',
    merchantCategory: 'Software',
  },
  {
    id: 'CB_004',
    transactionId: 'TXN_901234',
    customerId: 'CUST_555',
    amount: 89.99,
    reasonCode: '4834',
    description: "Duplicate charge appeared on my statement twice for the same purchase",
    classification: 'Genuine',
    confidence: 98,
    winProbability: 15,
    recommendedAction: 'AutoAccept',
    urgencyLevel: 'Low',
    friendlyFraudRisk: 8,
    estimatedCost: 104.99,
    timeToResolve: 2,
    customerTone: 'Confused',
    transactionDate: '2024-11-22',
    chargebackDate: '2024-11-26',
    merchantCategory: 'Subscription',
  },
  {
    id: 'CB_005',
    transactionId: 'TXN_123789',
    customerId: 'CUST_888',
    amount: 599.99,
    reasonCode: '4863',
    description: "Item significantly different from description, poor quality, requesting refund",
    classification: 'ReviewNeeded',
    confidence: 65,
    winProbability: 55,
    recommendedAction: 'Investigate',
    urgencyLevel: 'Medium',
    friendlyFraudRisk: 45,
    estimatedCost: 295.75,
    timeToResolve: 10,
    customerTone: 'Neutral',
    transactionDate: '2024-11-18',
    chargebackDate: '2024-11-29',
    merchantCategory: 'Fashion',
  },
];

// Analytics data
const chargebackTrends = [
  { month: 'Jul', total: 156, won: 45, lost: 89, settled: 22 },
  { month: 'Aug', total: 143, won: 52, lost: 76, settled: 15 },
  { month: 'Sep', total: 167, won: 78, lost: 65, settled: 24 },
  { month: 'Oct', total: 134, won: 82, lost: 42, settled: 10 },
  { month: 'Nov', total: 98, won: 67, lost: 21, settled: 10 },
];

const classificationDistribution = [
  { name: 'Friendly Fraud', value: 45, color: '#ef4444' },
  { name: 'Genuine', value: 28, color: '#10b981' },
  { name: 'True Fraud', value: 18, color: '#f59e0b' },
  { name: 'Review Needed', value: 9, color: '#6b7280' },
];

const impactMetrics = {
  totalSaved: 125680,
  winRateImprovement: 34,
  processingTimeReduction: 67,
  analystProductivity: 89,
};

export default function ChargebackIntelligence() {
  const [selectedChargeback, setSelectedChargeback] = useState<ChargebackCase | null>(null);
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'FriendlyFraud': return 'bg-red-100 text-red-800 border-red-300';
      case 'TrueFraud': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Genuine': return 'bg-green-100 text-green-800 border-green-300';
      case 'ReviewNeeded': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-600';
      case 'High': return 'bg-red-400';
      case 'Medium': return 'bg-yellow-400';
      case 'Low': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Dispute': return 'bg-blue-500 hover:bg-blue-600';
      case 'AutoAccept': return 'bg-green-500 hover:bg-green-600';
      case 'Investigate': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Settle': return 'bg-purple-500 hover:bg-purple-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const filteredChargebacks = mockChargebacks.filter(cb => {
    if (filterBy === 'all') return true;
    return cb.classification === filterBy;
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          FraudSentry: AI-Powered Chargeback Intelligence
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          <strong>Revolutionary chargeback management</strong> that automatically classifies disputes, 
          predicts win probability, and generates evidence packages - solving the $100B industry problem
        </p>
        <div className="flex items-center justify-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Industry Win Rate: <strong>23%</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>FraudSentry Win Rate: <strong>76%</strong></span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Intelligence Dashboard</TabsTrigger>
          <TabsTrigger value="cases">Active Cases</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & ROI</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Impact Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${impactMetrics.totalSaved.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">This quarter</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Win Rate Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    +{impactMetrics.winRateImprovement}%
                  </div>
                  <p className="text-xs text-muted-foreground">vs. industry average</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    -{impactMetrics.processingTimeReduction}%
                  </div>
                  <p className="text-xs text-muted-foreground">Faster resolution</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Analyst Productivity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    +{impactMetrics.analystProductivity}%
                  </div>
                  <p className="text-xs text-muted-foreground">Cases per analyst</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions for High Priority Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icons.alertTriangle className="mr-2 h-5 w-5 text-red-500" />
                Critical & High Priority Cases
              </CardTitle>
              <CardDescription>
                AI-prioritized cases requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockChargebacks
                  .filter(cb => cb.urgencyLevel === 'Critical' || cb.urgencyLevel === 'High')
                  .map((cb) => (
                    <div key={cb.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={cn('w-3 h-3 rounded-full', getUrgencyColor(cb.urgencyLevel))}></div>
                        <div>
                          <p className="font-medium">{cb.id} - ${cb.amount}</p>
                          <p className="text-sm text-muted-foreground">{cb.description.substring(0, 50)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getClassificationColor(cb.classification)}>
                          {cb.classification}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">{cb.winProbability}% Win Rate</p>
                          <p className="text-xs text-muted-foreground">{cb.timeToResolve} days</p>
                        </div>
                        <Button 
                          size="sm" 
                          className={getActionColor(cb.recommendedAction)}
                          onClick={() => setSelectedChargeback(cb)}
                        >
                          {cb.recommendedAction}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Classification Distribution */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Chargeback Classification</CardTitle>
                <CardDescription>AI-powered automatic classification</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={classificationDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {classificationDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {classificationDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Win Rate Trends</CardTitle>
                <CardDescription>Monthly chargeback resolution outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chargebackTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="won" fill="#10b981" name="Won" />
                    <Bar dataKey="lost" fill="#ef4444" name="Lost" />
                    <Bar dataKey="settled" fill="#f59e0b" name="Settled" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cases" className="space-y-6">
          {/* Filters and Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Classifications</option>
                <option value="FriendlyFraud">Friendly Fraud</option>
                <option value="TrueFraud">True Fraud</option>
                <option value="Genuine">Genuine</option>
                <option value="ReviewNeeded">Review Needed</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="urgency">Sort by Urgency</option>
                <option value="amount">Sort by Amount</option>
                <option value="winProbability">Sort by Win Probability</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>
            <Badge variant="outline">{filteredChargebacks.length} cases</Badge>
          </div>

          {/* Cases List */}
          <div className="grid gap-4">
            {filteredChargebacks.map((cb) => (
              <motion.div
                key={cb.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group"
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                      onClick={() => setSelectedChargeback(cb)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium">{cb.id}</h3>
                          <Badge className={getClassificationColor(cb.classification)}>
                            {cb.classification}
                          </Badge>
                          <div className={cn('w-2 h-2 rounded-full', getUrgencyColor(cb.urgencyLevel))}></div>
                        </div>
                        <p className="text-sm text-muted-foreground">{cb.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Amount: ${cb.amount}</span>
                          <span>Reason: {cb.reasonCode}</span>
                          <span>Filed: {cb.chargebackDate}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div>
                          <p className="text-sm font-medium">Win Probability</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={cb.winProbability} className="w-20 h-2" />
                            <span className="text-sm font-bold">{cb.winProbability}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Confidence: {cb.confidence}%</p>
                          <p className="text-xs text-muted-foreground">Cost: ${cb.estimatedCost}</p>
                        </div>
                        <Button 
                          size="sm" 
                          className={getActionColor(cb.recommendedAction)}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle action
                          }}
                        >
                          {cb.recommendedAction}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* ROI Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>ROI Analysis</CardTitle>
                <CardDescription>Financial impact of AI-powered chargeback management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">$1.2M</p>
                    <p className="text-sm text-muted-foreground">Annual Savings</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">340%</p>
                    <p className="text-sm text-muted-foreground">ROI</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Processing Cost Reduction</span>
                    <span className="text-sm font-medium">67%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Win Rate Improvement</span>
                    <span className="text-sm font-medium">+34%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Manual Review Reduction</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Industry Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Industry Benchmarking</CardTitle>
                <CardDescription>FraudSentry vs. industry standards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Win Rate</span>
                      <span className="text-sm">76% vs 23% industry</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="flex-1 bg-gray-200 rounded h-2">
                        <div className="bg-blue-500 h-2 rounded" style={{width: '76%'}}></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Processing Speed</span>
                      <span className="text-sm">3x faster</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="flex-1 bg-gray-200 rounded h-2">
                        <div className="bg-green-500 h-2 rounded" style={{width: '85%'}}></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Cost Efficiency</span>
                      <span className="text-sm">4.2x better</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="flex-1 bg-gray-200 rounded h-2">
                        <div className="bg-purple-500 h-2 rounded" style={{width: '90%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Impact */}
          <Card>
            <CardHeader>
              <CardTitle>Revolutionary Features Impact</CardTitle>
              <CardDescription>How each AI feature contributes to success</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <Icons.brain className="h-8 w-8 text-blue-500 mx-auto" />
                  <h4 className="font-medium">AI Classification</h4>
                  <p className="text-2xl font-bold text-blue-600">94%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
                <div className="text-center space-y-2">
                  <Icons.target className="h-8 w-8 text-green-500 mx-auto" />
                  <h4 className="font-medium">Win Prediction</h4>
                  <p className="text-2xl font-bold text-green-600">±8%</p>
                  <p className="text-sm text-muted-foreground">Prediction Error</p>
                </div>
                <div className="text-center space-y-2">
                  <Icons.fileText className="h-8 w-8 text-purple-500 mx-auto" />
                  <h4 className="font-medium">Auto Evidence</h4>
                  <p className="text-2xl font-bold text-purple-600">89%</p>
                  <p className="text-sm text-muted-foreground">Time Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Case Modal would go here */}
      {selectedChargeback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Chargeback Intelligence Report - {selectedChargeback.id}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedChargeback(null)}
                >
                  <Icons.x className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* This would contain the detailed AI analysis, evidence package, etc. */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">AI Classification</h4>
                  <Badge className={getClassificationColor(selectedChargeback.classification)}>
                    {selectedChargeback.classification} ({selectedChargeback.confidence}% confidence)
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Win Probability</h4>
                  <div className="flex items-center space-x-2">
                    <Progress value={selectedChargeback.winProbability} className="flex-1" />
                    <span className="font-bold">{selectedChargeback.winProbability}%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Recommended Action</h4>
                <Button className={getActionColor(selectedChargeback.recommendedAction)}>
                  {selectedChargeback.recommendedAction}
                </Button>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedChargeback.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
