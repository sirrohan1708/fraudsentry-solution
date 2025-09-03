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
    content: "Your revolutionary AI-powered fraud detection platform. Experience next-generation fraud prevention with cutting-edge technology that doesn't exist anywhere else in the market.",
    icon: <Zap className="h-6 w-6" />,
    category: 'basics'
  },
  {
    id: 2,
    title: "Submit Your First Transaction",
    content: "Start by entering transaction details in the form. Our AI will analyze it using 4 revolutionary systems working in harmony.",
    icon: <Play className="h-6 w-6" />,
    category: 'basics',
    steps: [
      "Enter transaction amount",
      "Fill in merchant and location details",
      "Choose payment method",
      "Click 'Analyze Transaction'"
    ]
  },
  {
    id: 3,
    title: "🧠 Swarm Intelligence",
    content: "5 specialized AI agents work together: Behavioral Analysis, Emotional Intelligence, Biometric Behavior, Quantum-Inspired Risk, and Predictive Prevention.",
    icon: <BookOpen className="h-6 w-6" />,
    category: 'ai',
    steps: [
      "Emotional AI detects stress & deception",
      "Biometric analysis tracks typing patterns",
      "Behavioral agent monitors user patterns",
      "Quantum engine calculates risk probabilities"
    ]
  },
  {
    id: 4,
    title: "🔮 Predictive Prevention",
    content: "World's first fraud prevention system that stops fraud before it happens. Predicts risk 24 hours in advance with intervention strategies.",
    icon: <Zap className="h-6 w-6" />,
    category: 'ai',
    steps: [
      "24-hour risk prediction",
      "Real-time risk evolution tracking",
      "Intervention window calculation",
      "Prevention strategy generation"
    ]
  },
  {
    id: 5,
    title: "🌱 Self-Learning System",
    content: "AI that continuously evolves and adapts. Discovers new fraud patterns, learns from every transaction, and improves over time.",
    icon: <BookOpen className="h-6 w-6" />,
    category: 'ai',
    steps: [
      "Zero-day fraud detection",
      "Pattern recognition engine",
      "Adversarial learning defense",
      "Continuous model adaptation"
    ]
  },
  {
    id: 6,
    title: "⚛️ Quantum Analysis",
    content: "Revolutionary quantum-inspired fraud detection using quantum computing principles for complex risk calculations.",
    icon: <Zap className="h-6 w-6" />,
    category: 'ai',
    steps: [
      "Quantum superposition risk assessment",
      "Entanglement network analysis",
      "Quantum interference detection",
      "Tunneling fraud breakthrough detection"
    ]
  },
  {
    id: 7,
    title: "Reading Transaction Analysis",
    content: "Click 'Details' on any analyzed transaction to explore the Revolutionary AI Systems. Switch between tabs to see different analysis perspectives.",
    icon: <BookOpen className="h-6 w-6" />,
    category: 'analysis',
    steps: [
      "Submit a transaction for analysis",
      "Click 'Details' button on result",
      "Explore the 4 AI system tabs",
      "View comprehensive fraud insights"
    ]
  },
  {
    id: 8,
    title: "Agent vs Scripted Mode",
    content: "Toggle between dynamic AI agent analysis and scripted analysis. Agent mode provides more detailed, contextual fraud investigation.",
    icon: <Play className="h-6 w-6" />,
    category: 'analysis',
    steps: [
      "Find the toggle switch in header",
      "Switch to 'Agent Mode'",
      "Submit a transaction",
      "Compare results with scripted mode"
    ]
  },
  {
    id: 9,
    title: "Revolutionary Dashboard",
    content: "Experience the world's most advanced fraud analysis dashboard with real-time AI insights, emotional intelligence, and quantum calculations.",
    icon: <Zap className="h-6 w-6" />,
    category: 'advanced',
    steps: [
      "Multi-dimensional risk scoring",
      "Real-time emotional analysis",
      "Quantum uncertainty measurements",
      "Predictive risk evolution charts"
    ]
  },
  {
    id: 10,
    title: "Industry Leadership",
    content: "FraudSentry is the world's first platform to combine emotional intelligence, quantum computing, predictive prevention, and swarm intelligence.",
    icon: <BookOpen className="h-6 w-6" />,
    category: 'advanced',
    steps: [
      "Pioneer in emotional AI for fraud",
      "First quantum-inspired risk engine",
      "Revolutionary predictive prevention",
      "Multi-agent swarm intelligence"
    ]
  }
];

interface TutorialFlashcardsProps {
  isOpen: boolean;
  onClose: () => void;
}

function TutorialFlashcards({ isOpen, onClose }: TutorialFlashcardsProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [filter, setFilter] = useState<'all' | TutorialCard['category']>('all');

  const filteredCards = filter === 'all' 
    ? tutorialCards 
    : tutorialCards.filter(card => card.category === filter);

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % filteredCards.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const getCategoryColor = (category: TutorialCard['category']) => {
    switch (category) {
      case 'basics': return 'bg-green-100 text-green-800 border-green-200';
      case 'ai': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'analysis': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-0 gap-0 mx-4">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex-shrink-0">
                <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold truncate">FraudSentry Tutorial</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">
                  Master the world's most advanced fraud detection platform
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6 pt-2 sm:pt-4">
          {/* Filter Tabs - Mobile Responsive */}
          <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
            {['all', 'basics', 'ai', 'analysis', 'advanced'].map((category) => (
              <Button
                key={category}
                variant={filter === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilter(category as any);
                  setCurrentCard(0);
                }}
                className="capitalize whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9 flex-shrink-0"
              >
                {category === 'all' ? 'All' : category === 'ai' ? 'AI' : category}
              </Button>
            ))}
          </div>

          {/* Flashcard - Mobile Responsive */}
          <div className="relative min-h-[350px] sm:min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${filter}-${currentCard}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Card className="h-full border-2 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
                  <CardContent className="p-4 sm:p-8 h-full flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl text-white flex-shrink-0">
                          {filteredCards[currentCard]?.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2">
                            {filteredCards[currentCard]?.title}
                          </h3>
                          <Badge variant="outline" className={getCategoryColor(filteredCards[currentCard]?.category)}>
                            {filteredCards[currentCard]?.category === 'ai' ? 'AI Systems' : filteredCards[currentCard]?.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground self-start">
                        {currentCard + 1} / {filteredCards.length}
                      </div>
                    </div>

                    <div className="flex-1 space-y-4 sm:space-y-6">
                      <p className="text-sm sm:text-lg text-gray-700 leading-relaxed">
                        {filteredCards[currentCard]?.content}
                      </p>

                      {filteredCards[currentCard]?.steps && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                            Key Steps:
                          </h4>
                          <div className="grid grid-cols-1 gap-2 sm:gap-3">
                            {filteredCards[currentCard].steps!.map((step, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white/60 rounded-lg border border-gray-200/50"
                              >
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </div>
                                <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{step}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation - Mobile Responsive */}
                    <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={prevCard}
                        disabled={filteredCards.length <= 1}
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-9"
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </Button>

                      <div className="flex gap-1 sm:gap-2">
                        {filteredCards.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentCard(index)}
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                              index === currentCard 
                                ? 'bg-purple-600' 
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        onClick={nextCard}
                        disabled={filteredCards.length <= 1}
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-9"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { TutorialFlashcards };
