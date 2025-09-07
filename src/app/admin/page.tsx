'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
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
import { Icons } from '@/components/icons';
import ChargebackIntelligence from '@/components/chargeback-intelligence';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

// Mock data - in a real app, this would come from your database
const mockStats = {
  totalTransactions: 1247,
  fraudBlocked: 89,
  suspiciousReviewed: 156,
  safeTransactions: 1002,
  fraudRate: 7.1,
  avgResponseTime: 0.3,
};

// Mock transaction data for network visualization
const mockTransactions = [
  { id: 'TXN001', userId: 'U1001', merchantId: 'M001', amount: 150, riskScore: 85, timestamp: new Date(Date.now() - 3600000) },
  { id: 'TXN002', userId: 'U1002', merchantId: 'M001', amount: 200, riskScore: 90, timestamp: new Date(Date.now() - 3000000) },
  { id: 'TXN003', userId: 'U1003', merchantId: 'M001', amount: 175, riskScore: 88, timestamp: new Date(Date.now() - 2400000) },
  { id: 'TXN004', userId: 'U1001', merchantId: 'M002', amount: 300, riskScore: 25, timestamp: new Date(Date.now() - 7200000) },
  { id: 'TXN005', userId: 'U1004', merchantId: 'M003', amount: 450, riskScore: 15, timestamp: new Date(Date.now() - 1800000) },
  { id: 'TXN006', userId: 'U1002', merchantId: 'M004', amount: 800, riskScore: 92, timestamp: new Date(Date.now() - 1200000) },
  { id: 'TXN007', userId: 'U1005', merchantId: 'M001', amount: 120, riskScore: 87, timestamp: new Date(Date.now() - 900000) },
  { id: 'TXN008', userId: 'U1006', merchantId: 'M005', amount: 75, riskScore: 12, timestamp: new Date(Date.now() - 600000) },
  { id: 'TXN009', userId: 'U1003', merchantId: 'M002', amount: 250, riskScore: 82, timestamp: new Date(Date.now() - 300000) },
  { id: 'TXN010', userId: 'U1007', merchantId: 'M001', amount: 180, riskScore: 89, timestamp: new Date(Date.now() - 180000) },
];

const mockUsers = [
  { id: 'U1001', name: 'John Smith', riskLevel: 'high' },
  { id: 'U1002', name: 'Jane Doe', riskLevel: 'high' },
  { id: 'U1003', name: 'Mike Johnson', riskLevel: 'high' },
  { id: 'U1004', name: 'Sarah Wilson', riskLevel: 'low' },
  { id: 'U1005', name: 'David Brown', riskLevel: 'high' },
  { id: 'U1006', name: 'Lisa Garcia', riskLevel: 'low' },
  { id: 'U1007', name: 'Tom Anderson', riskLevel: 'high' },
];

const mockMerchants = [
  { id: 'M001', name: 'SUSPICIOUS_ELECTRONICS', riskLevel: 'high' },
  { id: 'M002', name: 'AMAZON_US', riskLevel: 'low' },
  { id: 'M003', name: 'WALMART_STORE', riskLevel: 'low' },
  { id: 'M004', name: 'CRYPTO_EXCHANGE_X', riskLevel: 'high' },
  { id: 'M005', name: 'LOCAL_COFFEE_SHOP', riskLevel: 'low' },
];

const mockTimeSeriesData = [
  { time: '00:00', safe: 45, suspicious: 8, fraudulent: 2 },
  { time: '04:00', safe: 32, suspicious: 5, fraudulent: 1 },
  { time: '08:00', safe: 78, suspicious: 12, fraudulent: 4 },
  { time: '12:00', safe: 95, suspicious: 18, fraudulent: 7 },
  { time: '16:00', safe: 87, suspicious: 15, fraudulent: 5 },
  { time: '20:00', safe: 67, suspicious: 11, fraudulent: 3 },
];

const mockRiskDistribution = [
  { name: 'Safe (0-29)', value: 1002, color: '#10b981' },
  { name: 'Suspicious (30-69)', value: 156, color: '#f59e0b' },
  { name: 'Fraudulent (70-100)', value: 89, color: '#ef4444' },
];

const mockTopMerchants = [
  { name: 'AMAZON_US', transactions: 234, fraudRate: 2.1 },
  { name: 'PAYPAL_INT', transactions: 189, fraudRate: 3.7 },
  { name: 'STRIPE_CHECKOUT', transactions: 167, fraudRate: 1.8 },
  { name: 'SUSPICIOUS_STORE', transactions: 78, fraudRate: 23.1 },
  { name: 'CRYPTO_EXCHANGE', transactions: 56, fraudRate: 12.5 },
];

const mockRecentAlerts = [
  {
    id: '1',
    type: 'HIGH_RISK',
    message: 'Multiple transactions from high-risk location',
    timestamp: new Date(Date.now() - 300000),
    severity: 'critical',
  },
  {
    id: '2',
    type: 'VELOCITY',
    message: 'Unusual transaction velocity detected',
    timestamp: new Date(Date.now() - 900000),
    severity: 'warning',
  },
  {
    id: '3',
    type: 'PATTERN',
    message: 'Suspicious behavioral pattern identified',
    timestamp: new Date(Date.now() - 1800000),
    severity: 'info',
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Network visualization filters
  const [dateRange, setDateRange] = useState('24h');
  const [selectedMerchant, setSelectedMerchant] = useState('all');
  const [minRiskScore, setMinRiskScore] = useState(0);

  // Filtered data for network visualization
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(tx => {
      const matchesRisk = tx.riskScore >= minRiskScore;
      const matchesMerchant = selectedMerchant === 'all' || tx.merchantId === selectedMerchant;
      return matchesRisk && matchesMerchant;
    });
  }, [minRiskScore, selectedMerchant]);

  const highRiskUsers = useMemo(() => {
    return mockUsers.filter(user => user.riskLevel === 'high');
  }, []);

  const highRiskMerchants = useMemo(() => {
    return mockMerchants.filter(merchant => merchant.riskLevel === 'high');
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Network visualization logic with memoization
  const { nodes, edges } = useMemo(() => {
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];
    const addedNodes = new Set<string>();

    // Take first 20 transactions for performance
    const displayedTransactions = filteredTransactions.slice(0, 20);
    
    // Get unique users and merchants from displayed transactions
    const displayedUsers = new Map<string, any>();
    const displayedMerchants = new Map<string, any>();
    
    displayedTransactions.forEach(tx => {
      const user = mockUsers.find(u => u.id === tx.userId);
      const merchant = mockMerchants.find(m => m.id === tx.merchantId);
      if (user) displayedUsers.set(user.id, user);
      if (merchant) displayedMerchants.set(merchant.id, merchant);
    });

    // Create User Nodes (left side)
    let userYPosition = 50;
    Array.from(displayedUsers.values()).forEach(user => {
      if (!addedNodes.has(user.id)) {
        initialNodes.push({
          id: user.id,
          type: 'input',
          position: { x: 50, y: userYPosition },
          data: { 
            label: `User: ${user.name} (${user.id.substring(0, 4)})`,
          },
          style: {
            background: user.riskLevel === 'high' ? '#fecaca' : '#dbeafe',
            border: user.riskLevel === 'high' ? '2px solid #ef4444' : '2px solid #3b82f6',
            borderRadius: '50%',
            width: 120,
            height: 60,
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        });
        addedNodes.add(user.id);
        userYPosition += 80;
      }
    });

    // Create Merchant Nodes (right side)
    let merchantYPosition = 50;
    Array.from(displayedMerchants.values()).forEach(merchant => {
      if (!addedNodes.has(merchant.id)) {
        initialNodes.push({
          id: merchant.id,
          type: 'output',
          position: { x: 650, y: merchantYPosition },
          data: { 
            label: `${merchant.name} (${merchant.id})`,
          },
          style: {
            background: merchant.riskLevel === 'high' ? '#fed7aa' : '#fef3c7',
            border: merchant.riskLevel === 'high' ? '2px solid #f97316' : '2px solid #f59e0b',
            borderRadius: '8px',
            width: 140,
            height: 50,
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        });
        addedNodes.add(merchant.id);
        merchantYPosition += 80;
      }
    });

    // Create Transaction Nodes (center)
    let transactionYPosition = 50;
    displayedTransactions.forEach(tx => {
      const txNodeId = `tx-${tx.id}`;
      if (!addedNodes.has(txNodeId)) {
        initialNodes.push({
          id: txNodeId,
          position: { x: 350, y: transactionYPosition },
          data: { 
            label: `Tx: ${tx.id} ($${tx.amount})`,
          },
          style: {
            background: tx.riskScore > 70 ? '#fca5a5' : tx.riskScore > 30 ? '#fed7aa' : '#bbf7d0',
            border: tx.riskScore > 70 ? '2px solid #dc2626' : tx.riskScore > 30 ? '2px solid #ea580c' : '2px solid #16a34a',
            borderRadius: '8px',
            width: 100,
            height: 40,
            fontSize: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        });
        addedNodes.add(txNodeId);
        transactionYPosition += 80;
      }
    });

    // Create Transactional Edges
    displayedTransactions.forEach(tx => {
      const txNodeId = `tx-${tx.id}`;
      
      // User to Transaction edge
      initialEdges.push({
        id: `${tx.userId}-${txNodeId}`,
        source: tx.userId,
        target: txNodeId,
        type: 'smoothstep',
        animated: tx.riskScore > 70,
        style: {
          stroke: tx.riskScore > 70 ? '#dc2626' : '#6b7280',
          strokeWidth: tx.riskScore > 85 ? 3 : 2,
        },
      });

      // Transaction to Merchant edge
      initialEdges.push({
        id: `${txNodeId}-${tx.merchantId}`,
        source: txNodeId,
        target: tx.merchantId,
        type: 'smoothstep',
        animated: tx.riskScore > 70,
        style: {
          stroke: tx.riskScore > 70 ? '#dc2626' : '#6b7280',
          strokeWidth: tx.riskScore > 85 ? 3 : 2,
        },
      });
    });

    // Create Fraud Ring Linkages (Advanced feature)
    const usersArray = Array.from(displayedUsers.values());
    for (let i = 0; i < usersArray.length; i++) {
      for (let j = i + 1; j < usersArray.length; j++) {
        const user1 = usersArray[i];
        const user2 = usersArray[j];
        
        // Check if they share merchants
        const user1Merchants = displayedTransactions
          .filter(tx => tx.userId === user1.id)
          .map(tx => tx.merchantId);
        const user2Merchants = displayedTransactions
          .filter(tx => tx.userId === user2.id)
          .map(tx => tx.merchantId);
        
        const sharedMerchants = user1Merchants.filter(m => user2Merchants.includes(m));
        
        if (sharedMerchants.length > 0) {
          initialEdges.push({
            id: `fraud-link-${user1.id}-${user2.id}`,
            source: user1.id,
            target: user2.id,
            type: 'straight',
            style: {
              stroke: '#dc2626',
              strokeWidth: 3,
              strokeDasharray: '5,5',
            },
            label: `${sharedMerchants.length} shared merchant${sharedMerchants.length > 1 ? 's' : ''}`,
            labelStyle: {
              fontSize: '10px',
              fontWeight: 'bold',
              fill: '#dc2626',
            },
            labelBgStyle: {
              fill: '#fee2e2',
              fillOpacity: 0.8,
            },
          });
        }
      }
    }

    return { nodes: initialNodes, edges: initialEdges };
  }, [filteredTransactions, highRiskUsers, highRiskMerchants]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="mr-2"
            >
              <Icons.arrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 shadow-inner">
              <Icons.shieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent tracking-tight">
                FraudSentry Admin
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Real-time Fraud Detection Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
            <Button variant="outline" size="sm">
              <Icons.settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="fraud-detection" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fraud-detection">Fraud Detection</TabsTrigger>
            <TabsTrigger value="chargeback-intelligence">Chargeback Intelligence</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fraud-detection" className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Transactions
                </CardTitle>
                <Icons.receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockStats.totalTransactions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last hour
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Fraud Blocked
                </CardTitle>
                <Icons.shieldCheck className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {mockStats.fraudBlocked}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mockStats.fraudRate}% fraud rate
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Response Time
                </CardTitle>
                <Icons.brain className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {mockStats.avgResponseTime}s
                </div>
                <p className="text-xs text-muted-foreground">
                  -0.1s improvement
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Safe Transactions
                </CardTitle>
                <Icons.checkCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {mockStats.safeTransactions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((mockStats.safeTransactions / mockStats.totalTransactions) * 100).toFixed(1)}% safe rate
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Fraud Network Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Icons.brain className="mr-2 h-5 w-5 text-primary" />
                    Fraud Network Visualization
                  </CardTitle>
                  <CardDescription>
                    Interactive graph showing transaction relationships and fraud ring detection
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedMerchant}
                    onChange={(e) => setSelectedMerchant(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="all">All Merchants</option>
                    {mockMerchants.map(merchant => (
                      <option key={merchant.id} value={merchant.id}>
                        {merchant.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minRiskScore}
                    onChange={(e) => setMinRiskScore(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-xs text-muted-foreground min-w-[60px]">
                    Risk: {minRiskScore}+
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] border rounded-lg overflow-hidden">
                {isClient ? (
                  nodes.length > 0 ? (
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      connectionMode={ConnectionMode.Loose}
                      fitView
                      proOptions={{ hideAttribution: true }}
                    >
                      <Background color="#aaa" gap={16} />
                      <Controls />
                      <MiniMap 
                        nodeColor={(node) => {
                          if (node.id.startsWith('U')) return '#3b82f6'; // Users: blue
                          if (node.id.startsWith('M')) return '#f59e0b'; // Merchants: yellow
                          return '#ef4444'; // Transactions: red
                        }}
                        nodeStrokeWidth={2}
                        position="top-right"
                      />
                    </ReactFlow>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <Icons.search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No transactions match your filters</p>
                        <p className="text-sm">Try adjusting the risk score or merchant filters</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
              
              {/* Legend */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm mb-2">Node Types</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-200 border-2 border-blue-500"></div>
                      <span>Users (Left)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-200 border-2 border-yellow-500"></div>
                      <span>Merchants (Right)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-200 border-2 border-red-500"></div>
                      <span>Transactions (Center)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Risk Indicators</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-0.5 bg-red-600"></div>
                      <span>High Risk (70+)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-0.5 bg-red-600" style={{strokeDasharray: '2,2'}}></div>
                      <span>Fraud Ring Link</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-0.5 bg-gray-600"></div>
                      <span>Normal Transaction</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Detection Stats</h4>
                  <div className="space-y-1 text-xs">
                    <div>Nodes: {nodes.length}</div>
                    <div>Connections: {edges.length}</div>
                    <div>Fraud Links: {edges.filter(e => e.id.startsWith('fraud-link')).length}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Transaction Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Icons.history className="mr-2 h-5 w-5 text-primary" />
                  Transaction Activity (24h)
                </CardTitle>
                <CardDescription>
                  Real-time transaction monitoring and risk classification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockTimeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="safe"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Safe"
                    />
                    <Line
                      type="monotone"
                      dataKey="suspicious"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Suspicious"
                    />
                    <Line
                      type="monotone"
                      dataKey="fraudulent"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Fraudulent"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-6"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Icons.alertCircle className="mr-2 h-5 w-5 text-primary" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={mockRiskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {mockRiskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {mockRiskDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Icons.alertTriangle className="mr-2 h-5 w-5 text-primary" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {mockRecentAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border bg-card"
                      >
                        <Badge
                          variant="outline"
                          className={cn('text-xs', getSeverityColor(alert.severity))}
                        >
                          {alert.type}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-card-foreground">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {alert.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Merchant Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icons.code className="mr-2 h-5 w-5 text-primary" />
                Top Merchants by Risk
              </CardTitle>
              <CardDescription>
                Merchant analysis showing transaction volume and fraud rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockTopMerchants}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="transactions" fill="#3b82f6" name="Transactions" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {mockTopMerchants.map((merchant, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{merchant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {merchant.transactions} transactions
                        </p>
                      </div>
                      <Badge
                        variant={merchant.fraudRate > 10 ? 'destructive' : merchant.fraudRate > 5 ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {merchant.fraudRate}% fraud
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
          </TabsContent>
          
          <TabsContent value="chargeback-intelligence">
            <ChargebackIntelligence />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
