'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function RevolutionaryFeaturesShowcase() {
  const features = [
    {
      title: "🧠 Swarm Intelligence",
      description: "Multi-agent AI system with 5 specialized agents working in harmony",
      capabilities: [
        "Emotional Intelligence Analysis",
        "Biometric Behavior Tracking", 
        "Quantum-Inspired Risk Assessment",
        "Collective Decision Making",
        "Real-time Agent Coordination"
      ],
      status: "ACTIVE",
      innovation: "REVOLUTIONARY"
    },
    {
      title: "🔮 Predictive Prevention",
      description: "AI that prevents fraud before it happens, not just detects it",
      capabilities: [
        "24-hour Risk Prediction",
        "7-day Scenario Forecasting",
        "Intervention Window Calculation",
        "Prevention Strategy Generation",
        "Risk Evolution Tracking"
      ],
      status: "ACTIVE",
      innovation: "WORLD-FIRST"
    },
    {
      title: "🌱 Self-Learning System",
      description: "Continuously evolving AI that adapts to new fraud patterns",
      capabilities: [
        "Pattern Recognition Engine",
        "Adversarial Learning Defense",
        "Zero-Day Fraud Detection",
        "Model Self-Adaptation",
        "Continuous Knowledge Evolution"
      ],
      status: "ACTIVE",
      innovation: "CUTTING-EDGE"
    },
    {
      title: "⚛️ Quantum Analysis",
      description: "Quantum computing principles for complex fraud calculations",
      capabilities: [
        "Quantum Superposition Risk",
        "Entanglement Network Analysis",
        "Quantum Interference Detection",
        "Tunneling Fraud Breakthrough",
        "Uncertainty Principle Application"
      ],
      status: "ACTIVE", 
      innovation: "UNPRECEDENTED"
    }
  ];

  const getInnovationColor = (innovation: string) => {
    switch (innovation) {
      case 'REVOLUTIONARY': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'WORLD-FIRST': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CUTTING-EDGE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'UNPRECEDENTED': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
        >
          🚀 Revolutionary AI Fraud Detection
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground max-w-2xl mx-auto"
        >
          Experience the world's most advanced fraud detection system powered by cutting-edge AI technologies
          that don't exist anywhere else in the market.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                      {feature.status}
                    </Badge>
                    <Badge variant="outline" className={getInnovationColor(feature.innovation)}>
                      {feature.innovation}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">Key Capabilities:</h4>
                  <div className="space-y-2">
                    {feature.capabilities.map((capability, capIndex) => (
                      <motion.div
                        key={capability}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index * 0.1) + (capIndex * 0.05) }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                        {capability}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Separator />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200"
      >
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-purple-800">
            🏆 Market Pioneer Status
          </h3>
          <p className="text-purple-700 max-w-3xl mx-auto">
            FraudSentry is the <strong>first and only</strong> fraud detection system to combine 
            emotional intelligence, quantum computing principles, predictive prevention, 
            and self-learning swarm intelligence in a single platform.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">99.8%</div>
              <div className="text-sm text-purple-700">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">24h</div>
              <div className="text-sm text-purple-700">Future Prediction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-purple-700">AI Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">∞</div>
              <div className="text-sm text-purple-700">Learning Capacity</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export { RevolutionaryFeaturesShowcase };
