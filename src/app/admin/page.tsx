'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Icons } from '@/components/icons';
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

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      </main>
    </div>
  );
}
