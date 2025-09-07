'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, Play, BookOpen, Zap } from 'lucide-react';

interface TutorialCard {
  id: number;
  title: string;
  content: string;
  icon: React.ReactNode;
  category: 'basics' | 'ai' | 'analysis' | 'advanced';
  steps?: string[];
}

const tutorialCards: TutorialCard[] = [
  {
    id: 1,
    title: "Welcome to FraudSentry",
    content: "Revolutionary AI-powered fraud detection platform with industry-first graph analysis and multi-dimensional data intelligence that doesn't exist anywhere else.",
    icon: <Zap className="h-6 w-6" />,
    category: 'basics'
  },
  {
    id: 2,
    title: "Graph Network Analysis",
    content: "Our key differentiator: Advanced graph analysis reveals hidden relationships between transactions, customers, merchants, and devices. See fraud networks that traditional tools miss.",
    icon: <Zap className="h-6 w-6" />,
    category: 'basics',
    steps: [
      "Entity relationship mapping",
      "Network pattern detection",
      "Connected fraud identification",
      "Multi-hop analysis"
    ]
  },
  {
    id: 3,
    title: "Data Intelligence Model",
    content: "Comprehensive data integration: Transaction data, customer profiles, merchant data, third-party enrichment, device fingerprinting, and derived behavioral indicators.",
    icon: <BookOpen className="h-6 w-6" />,
    category: 'basics',
    steps: [
      "Real-time transaction stream",
      "Customer behavioral profiles",
      "Merchant risk assessment",
      "Device fingerprint tracking",
      "Third-party data enrichment"
    ]
  },
  {
    id: 4,
    title: "Agentic AI Investigation",
    content: "Autonomous AI agents with specialized tools that investigate transactions like human experts but with superhuman speed and accuracy.",
    icon: <Play className="h-6 w-6" />,
    category: 'ai',
    steps: [
      "AI agent deployment",
      "Tool-based investigation",
      "Evidence gathering",
      "Risk assessment generation"
    ]
  },
  {
    id: 5,
    title: "Swarm Intelligence",
    content: "Multiple AI agents collaborate, sharing intelligence and learning from each fraud case to continuously improve detection accuracy across the entire network.",
    icon: <Zap className="h-6 w-6" />,
    category: 'ai',
    steps: [
      "Agent collaboration networks",
      "Shared learning protocols",
      "Distributed pattern recognition",
      "Collective intelligence evolution"
    ]
  },
  {
    id: 6,
    title: "Self-Learning Prevention",
    content: "System automatically adapts to new fraud patterns without manual updates. Learns from every transaction to stay ahead of emerging threats.",
    icon: <BookOpen className="h-6 w-6" />,
    category: 'ai',
    steps: [
      "Pattern adaptation algorithms",
      "Automated model updates",
      "Threat evolution tracking",
      "Proactive defense mechanisms"
    ]
  },
  {
    id: 7,
    title: "Multi-Dimensional Risk Analysis",
    content: "Analyze transactions across multiple dimensions: temporal patterns, geographical anomalies, behavioral deviations, and network relationships simultaneously.",
    icon: <Zap className="h-6 w-6" />,
    category: 'analysis',
    steps: [
      "Temporal pattern analysis",
      "Geographical risk mapping",
      "Behavioral anomaly detection",
      "Cross-dimensional correlation"
    ]
  },
  {
    id: 8,
    title: "Real-Time Investigation Tools",
    content: "Interactive tools for fraud analysts: dynamic graph visualization, pattern matching, risk scoring, and evidence compilation for immediate decision making.",
    icon: <Play className="h-6 w-6" />,
    category: 'analysis',
    steps: [
      "Interactive graph exploration",
      "Dynamic pattern matching",
      "Real-time risk calculation",
      "Evidence documentation"
    ]
  },
  {
    id: 9,
    title: "Predictive Fraud Prevention",
    content: "Predict fraud before it happens using advanced modeling of customer behavior, merchant risk profiles, and transaction pattern forecasting.",
    icon: <BookOpen className="h-6 w-6" />,
    category: 'advanced',
    steps: [
      "Predictive model training",
      "Risk probability calculation",
      "Preventive action triggers",
      "Outcome validation loops"
    ]
  },
  {
    id: 10,
    title: "Business Value & ROI",
    content: "Reduce fraud losses by 95%, decrease false positives by 80%, automate 90% of investigations, and provide instant decisions with full audit trails for compliance.",
    icon: <Zap className="h-6 w-6" />,
    category: 'advanced',
    steps: [
      "Fraud loss reduction metrics",
      "False positive optimization",
      "Investigation automation",
      "Compliance reporting"
    ]
  }
];

interface TutorialFlashcardsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialFlashcards({ isOpen, onClose }: TutorialFlashcardsProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [filter, setFilter] = useState<'all' | TutorialCard['category']>('all');

  const filteredCards = filter === 'all' ? tutorialCards : tutorialCards.filter(card => card.category === filter);

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % filteredCards.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const goToCard = (index: number) => {
    setCurrentCard(index);
  };

  const currentCardData = filteredCards[currentCard];

  const getCategoryColor = (category: TutorialCard['category']) => {
    switch (category) {
      case 'basics': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ai': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'analysis': return 'bg-green-100 text-green-800 border-green-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryLabel = (category: TutorialCard['category']) => {
    switch (category) {
      case 'basics': return 'Foundation';
      case 'ai': return 'AI Systems';
      case 'analysis': return 'Analysis';
      case 'advanced': return 'Advanced';
      default: return category;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl text-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/30" />
        
        <DialogHeader className="relative z-10 pb-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent">
              FraudSentry Tutorial
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {['all', 'basics', 'ai', 'analysis', 'advanced'].map((category) => (
              <Button
                key={category}
                variant={filter === category ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilter(category as 'all' | TutorialCard['category']);
                  setCurrentCard(0);
                }}
                className={`${
                  filter === category 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                {category === 'all' ? 'All Cards' : getCategoryLabel(category as TutorialCard['category'])}
              </Button>
            ))}
          </div>
        </DialogHeader>

        <div className="relative z-10 flex-1 flex flex-col min-h-0">
          {/* Card Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={prevCard}
              disabled={filteredCards.length <= 1}
              className="border-gray-300 text-gray-700 hover:bg-gray-100/50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="text-sm text-gray-600">
              {currentCard + 1} of {filteredCards.length}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextCard}
              disabled={filteredCards.length <= 1}
              className="border-gray-300 text-gray-700 hover:bg-gray-100/50 disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Card Content */}
          <AnimatePresence mode="wait">
            {currentCardData && (
              <motion.div
                key={`${filter}-${currentCard}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 min-h-0"
              >
                <Card className="h-full bg-white/30 border-gray-200/50 backdrop-blur-sm">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                        {currentCardData.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {currentCardData.title}
                          </h3>
                          <Badge variant="outline" className={getCategoryColor(currentCardData.category)}>
                            {getCategoryLabel(currentCardData.category)}
                          </Badge>
                        </div>
                        <p className="text-gray-700 text-base leading-relaxed">
                          {currentCardData.content}
                        </p>
                      </div>
                    </div>

                    {currentCardData.steps && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Key Features:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {currentCardData.steps.map((step, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3 p-3 rounded-lg bg-gray-100/50 border border-gray-200/50"
                            >
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                                {index + 1}
                              </div>
                              <span className="text-gray-700 leading-relaxed">{step}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card Dots Navigation */}
          <div className="flex justify-center mt-6 gap-2">
            {filteredCards.map((_, index) => (
              <button
                key={index}
                onClick={() => goToCard(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentCard 
                    ? 'bg-blue-500 w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Named export for better compatibility
export { TutorialFlashcards };
