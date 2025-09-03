'use client';
import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useRouter} from 'next/navigation';
import {db} from '@/firebase/firebase-config';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {useToast} from '@/hooks/use-toast';
import {Switch} from '@/components/ui/switch';
import {Skeleton} from '@/components/ui/skeleton';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Badge} from '@/components/ui/badge';
import {Icons} from '@/components/icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Separator} from '@/components/ui/separator';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {TooltipProvider, TooltipContent, TooltipTrigger, Tooltip} from '@/components/ui/tooltip';
import {getTransactionInsights} from '@/ai/flows/get-transaction-insights';
import {getFraudRiskScore, FraudRiskScoreInput} from '@/ai/flows/get-fraud-risk-score';
import {generateAiExplanations} from '@/ai/flows/generate-ai-explanations';
import {investigateFraudAgent, FraudAgentInput} from '@/ai/flows/investigate-fraud-agent';
import {cn} from '@/lib/utils';
import {motion, AnimatePresence} from 'framer-motion';
import { RevolutionaryFraudDashboard } from '@/components/revolutionary-dashboard';
import { RevolutionaryFeaturesShowcase } from '@/components/revolutionary-features';
import { TutorialFlashcards } from '@/components/tutorial-flashcards';

const transactionFormSchema = z.object({
  amount: z.coerce.number().min(0.01, {message: 'Amount must be greater than 0'}),
  source: z.string().min(2, {message: 'Source must be at least 2 characters.'}),
  merchantId: z.string().min(2, {message: 'Merchant ID must be at least 2 characters.'}),
  paymentMethod: z.string().min(2, {message: 'Payment Method must be at least 2 characters.'}),
  location: z.string().min(2, {message: 'Location must be at least 2 characters.'}),
  userId: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionData extends Omit<TransactionFormValues, 'amount'> {
  id: string;
  amount: number;
  fraudRiskScore: number | null;
  aiExplanation: string;
  transactionInsights: string;
  timestamp: Timestamp;
  behavioralAnomalyScore?: number;
  entityTrustScore?: number;
  riskTags?: string[];
  behaviorPattern?: string;
  transactionTimestamp?: string;
  isAgent?: boolean;
}

interface AiExplanationDetails {
  transactionId: string;
  amount: number;
  location: string;
  merchantId: string;
  paymentMethod: string;
  fraudRiskScore: number;
  explanation: string;
  behaviorPattern?: string;
  riskTags?: string[];
  isAgent?: boolean;
}

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [fraudExplanationDetails, setFraudExplanationDetails] = useState<AiExplanationDetails | null>(null);
  const [aiDecisionLog, setAiDecisionLog] = useState<string[]>([]);
  const router = useRouter();
  const {toast} = useToast();
  const [useAgent, setUseAgent] = useState(false);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [selectedTransactionInsights, setSelectedTransactionInsights] = useState<TransactionData | null>(null);
  const [isInsightsDialogOpen, setIsInsightsDialogOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: 0,
      source: '',
      merchantId: '',
      paymentMethod: '',
      location: '',
      userId: '',
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleOpenInsights = useCallback((transaction: TransactionData) => {
    setSelectedTransactionInsights(transaction);
    setIsInsightsDialogOpen(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    setIsLoading(true);
    const transactionsCollection = collection(db, 'transactions');
    const q = query(transactionsCollection, orderBy('timestamp', 'desc'), limit(20));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const transactionList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString();
          return {
            id: doc.id,
            amount: data.amount ?? 0,
            source: data.source ?? '',
            merchantId: data.merchantId ?? '',
            paymentMethod: data.paymentMethod ?? '',
            location: data.location ?? '',
            userId: data.userId ?? '',
            behaviorPattern: data.behaviorPattern ?? '',
            fraudRiskScore: data.fraudRiskScore ?? null,
            aiExplanation: data.aiExplanation ?? '',
            transactionInsights: data.transactionInsights ?? '',
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp : Timestamp.now(),
            transactionTimestamp: timestamp,
            behavioralAnomalyScore: data.behavioralAnomalyScore,
            entityTrustScore: data.entityTrustScore,
            riskTags: data.riskTags,
            isAgent: data.isAgent ?? false,
          } as TransactionData;
        });

        setTransactions(transactionList);
        const logEntries = transactionList.slice(0, 10).map(t =>
             `[${t.timestamp?.toDate ? t.timestamp.toDate().toLocaleTimeString() : 'N/A'}] ${t.isAgent ? '[AGENT]' : '[SCRIPT]'} ID:${t.id.substring(0, 6)} Score:${t.fraudRiskScore ?? 'N/A'} (${getFraudStatus(t.fraudRiskScore)}) - ${t.aiExplanation || 'No explanation.'}`
        );
        setAiDecisionLog(logEntries);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching transactions:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load transaction history.',
        });
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [isClient, toast]);

  const onSubmit = async (values: TransactionFormValues) => {
    setAnalysisLoading(true);
    setFraudExplanationDetails(null);
    const startTime = performance.now();
    const tempTransactionId = 'TXN' + Date.now();
    const currentTimestamp = new Date();
    const currentTimestampISO = currentTimestamp.toISOString();

    let currentFraudScore: number;
    let determinedBehaviorPattern: string;
    let finalExplanation: string;
    let riskTags: string[] = [];
    let insightsResult: { insights: string; behavioralAnomalyScore?: number | undefined; entityTrustScore?: number | undefined; riskTags?: string[] | undefined };

    try {
        if (useAgent) {
            const agentInput: FraudAgentInput = { ...values, transactionTimestamp: currentTimestampISO };
            const agentResult = await investigateFraudAgent(agentInput);
            currentFraudScore = agentResult.fraudRiskScore;
            determinedBehaviorPattern = agentResult.behaviorPattern;
            finalExplanation = agentResult.justification;
            riskTags = agentResult.riskTags;
            insightsResult = {
                insights: `Agent analysis complete. Score: ${currentFraudScore}. Pattern: ${determinedBehaviorPattern}.`,
                riskTags: riskTags,
                behavioralAnomalyScore: undefined,
                entityTrustScore: undefined,
            };
        } else {
            const fraudScoreInput: FraudRiskScoreInput = { ...values, transactionTimestamp: currentTimestampISO };
            const fraudRiskResult = await getFraudRiskScore(fraudScoreInput);
            currentFraudScore = fraudRiskResult.fraudRiskScore;
            determinedBehaviorPattern = fraudRiskResult.behaviorPattern;
            riskTags = fraudRiskResult.riskTags || [];

            const [insightsRes, explanationRes] = await Promise.all([
                getTransactionInsights({
                    ...values, transactionId: tempTransactionId, fraudRiskScore: currentFraudScore, behaviorPattern: determinedBehaviorPattern,
                    riskTags: riskTags, transactionTimestamp: currentTimestampISO,
                    behavioralAnomalyScore: fraudRiskResult.behavioralAnomalyScore, entityTrustScore: fraudRiskResult.entityTrustScore,
                }),
                generateAiExplanations({
                    ...values, transactionId: tempTransactionId, fraudRiskScore: currentFraudScore, behaviorPattern: determinedBehaviorPattern,
                    riskTags: riskTags, transactionTimestamp: currentTimestampISO,
                })
            ]);
            insightsResult = insightsRes;
            finalExplanation = explanationRes.explanation;
        }

        setFraudExplanationDetails({
            transactionId: tempTransactionId,
            ...values,
            fraudRiskScore: currentFraudScore,
            explanation: finalExplanation,
            behaviorPattern: determinedBehaviorPattern,
            riskTags: riskTags,
            isAgent: useAgent,
        });

      const newTransactionDataForFirestore = {
        ...values,
        fraudRiskScore: currentFraudScore,
        behaviorPattern: determinedBehaviorPattern,
        aiExplanation: finalExplanation,
        transactionInsights: insightsResult?.insights ?? 'N/A',
        behavioralAnomalyScore: insightsResult?.behavioralAnomalyScore ?? null,
        entityTrustScore: insightsResult?.entityTrustScore ?? null,
        riskTags: riskTags ?? [],
        timestamp: serverTimestamp(),
        transactionTimestamp: currentTimestampISO,
        isAgent: useAgent,
      };
      const transactionsCollectionRef = collection(db, 'transactions');
      addDoc(transactionsCollectionRef, newTransactionDataForFirestore);

      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      toast({
         title: 'Analysis Complete',
         description: (
           <div className="flex flex-col space-y-1 text-sm">
             <span>
               Fraud Score:{' '}
               <strong className={getStatusColor(currentFraudScore)}>
                 {currentFraudScore}
               </strong>{' '}
               ({getFraudStatus(currentFraudScore)})
             </span>
              <span className="text-xs text-muted-foreground">Mode: {useAgent ? 'Agent' : 'Scripted'}</span>
              <span className="text-xs text-muted-foreground">Behavior: {determinedBehaviorPattern}</span>
              {(riskTags.length ?? 0) > 0 && (
                <span className="text-xs text-muted-foreground">
                  Tags: {riskTags.slice(0, 3).join(', ')}{riskTags.length > 3 ? '...' : ''}
                </span>
              )}
             <span className="text-xs text-muted-foreground">Time: {duration}s</span>
             <Button
               variant="link" size="sm" className="p-0 h-auto text-xs text-primary justify-start hover:underline"
               onClick={(e) => {
                 e.stopPropagation();
                 const detailData = {
                     ...newTransactionDataForFirestore,
                     id: tempTransactionId,
                     timestamp: Timestamp.now(),
                     transactionTimestamp: currentTimestampISO,
                 } as TransactionData;
                 handleOpenInsights(detailData);
               }}
             >
               View Details
             </Button>
           </div>
         ),
         duration: 7000,
       });
    } catch (error: any) {
      console.error('Error analyzing transaction:', error);
      toast({
        variant: 'destructive',
        title: 'Error Analyzing Transaction',
        description: `Analysis failed. ${error.message}`,
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleReset = useCallback(() => {
    form.reset({ amount: 0, source: '', merchantId: '', paymentMethod: '', location: '', userId: '' });
    setFraudExplanationDetails(null);
    toast({ title: 'Form Cleared', description: 'Transaction details reset.', duration: 3000 });
  }, [form, toast]);

  const getFraudStatus = (score: number | null): string => {
    if (score === null || isNaN(score)) return 'N/A';
    if (score < 30) return 'Safe';
    if (score < 70) return 'Suspicious';
    return 'Fraudulent';
  };

  const getStatusColor = (score: number | null): string => {
    if (score === null || isNaN(score)) return 'text-muted-foreground';
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBorderColor = (score: number | null): string => {
    if (score === null || isNaN(score)) return 'border-muted';
    if (score < 30) return 'border-green-300';
    if (score < 70) return 'border-yellow-300';
    return 'border-red-300';
  };

  const getStatusBgColor = (score: number | null): string => {
    if (score === null || isNaN(score)) return 'bg-muted/30';
    if (score < 30) return 'bg-green-50';
    if (score < 70) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getStatusIcon = (score: number | null): React.ReactNode => {
    if (score === null || isNaN(score)) return <Icons.help className="h-4 w-4 text-muted-foreground stroke-current"/>;
    if (score < 30) return <Icons.checkCircle className="h-4 w-4 text-green-600 stroke-current" />;
    if (score < 70) return <Icons.alertCircle className="h-4 w-4 text-yellow-600 stroke-current" />;
    return <Icons.alertTriangle className="h-4 w-4 text-red-600 stroke-current" />;
  };

  if (!isClient) return <div className="flex items-center justify-center min-h-screen"><Icons.spinner className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/30">
       {/* Revolutionary Header with Glassmorphism */}
       <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
         <div className="container mx-auto flex items-center justify-between h-20 px-6">
           {/* Logo Section with Animation */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex items-center space-x-4"
           >
             <div className="relative">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl blur-sm opacity-20"></div>
               <div className="relative p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg">
                 <Icons.shieldCheck className="h-8 w-8 text-white" />
               </div>
             </div>
             <div>
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent tracking-tight"
                >
                  FraudSentry
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm font-medium text-gray-600 flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Next-Gen AI Fraud Detection Platform
                </motion.p>
             </div>
           </motion.div>

           {/* Center Navigation */}
           <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="hidden md:flex items-center space-x-1 bg-white/50 backdrop-blur-sm rounded-full p-2 border border-white/30"
           >
              <Tooltip>
                 <TooltipTrigger asChild>
                     <div className="flex items-center space-x-3 px-4 py-2 rounded-full hover:bg-white/60 transition-colors cursor-pointer">
                         <div className="flex items-center space-x-2">
                           <div className={`w-3 h-3 rounded-full ${useAgent ? 'bg-purple-500' : 'bg-blue-500'} animate-pulse`}></div>
                           <Label htmlFor="useAgent" className="text-sm font-medium text-gray-700 cursor-pointer">
                             {useAgent ? '🤖 Agent Mode' : '📋 Scripted Mode'}
                           </Label>
                         </div>
                         <Switch
                             id="useAgent" 
                             checked={useAgent} 
                             onCheckedChange={setUseAgent}
                             className="data-[state=checked]:bg-purple-500"
                         />
                     </div>
                 </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-sm bg-white/90 backdrop-blur-sm">
                    {useAgent ? "Dynamic AI agent with advanced reasoning" : "High-speed scripted analysis"}
                  </TooltipContent>
              </Tooltip>
           </motion.div>

           {/* Action Buttons */}
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.5 }}
             className="flex items-center space-x-3"
           >
             {/* Tutorial Button */}
             <Button 
               onClick={() => setIsTutorialOpen(true)}
               variant="outline" 
               size="sm" 
               className="group relative overflow-hidden border-purple-200 bg-white/60 backdrop-blur-sm hover:bg-purple-50 transition-all duration-300"
             >
               <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
               <Icons.help className="mr-2 h-4 w-4 text-purple-600" />
               <span className="text-purple-700 font-medium">Tutorial</span>
             </Button>

             {/* Admin Button */}
             <Button 
               onClick={() => router.push('/admin')} 
               variant="outline" 
               size="sm" 
               className="group relative overflow-hidden border-blue-200 bg-white/60 backdrop-blur-sm hover:bg-blue-50 transition-all duration-300"
             >
               <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
               <Icons.layoutDashboard className="mr-2 h-4 w-4 text-blue-600" />
               <span className="text-blue-700 font-medium">Admin</span>
             </Button>

             {/* Status Indicator */}
             <div className="flex items-center space-x-2 px-3 py-2 bg-green-50/60 backdrop-blur-sm rounded-full border border-green-200/50">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-xs font-medium text-green-700">AI Systems Online</span>
             </div>
           </motion.div>
         </div>

         {/* Secondary Navigation Bar */}
         <div className="border-t border-white/20 bg-white/40 backdrop-blur-sm">
           <div className="container mx-auto px-6 py-3">
             <div className="flex items-center justify-between text-sm">
               <div className="flex items-center space-x-6 text-gray-600">
                 <span className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                   Swarm Intelligence
                 </span>
                 <span className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                   Predictive Prevention
                 </span>
                 <span className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                   Self-Learning AI
                 </span>
                 <span className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                   Quantum Analysis
                 </span>
               </div>
               <div className="text-xs text-gray-500">
                 Industry's First Revolutionary Fraud Detection Platform
               </div>
             </div>
           </div>
         </div>
       </header>
       <main className="flex-1 container mx-auto px-4 py-8">
          {/* Revolutionary Features Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <RevolutionaryFeaturesShowcase />
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.5, delay: 0.2 }} 
                className="lg:col-span-1 space-y-6"
              >
                  <Card className="backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl sticky top-20 rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                      <CardHeader className="relative border-b border-white/20 px-6 py-5 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                         <CardTitle className="text-xl font-bold flex items-center text-gray-800">
                           <div className="mr-3 p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg">
                             <Icons.edit className="h-5 w-5" />
                           </div>
                           Transaction Analysis
                         </CardTitle>
                          <CardDescription className="text-sm pt-2 text-gray-600 font-medium">
                            Enter transaction details for AI-powered fraud assessment
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="relative p-6 bg-gradient-to-br from-white/10 to-transparent">
                          <Form {...form}>
                              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                  <FormField control={form.control} name="amount" render={({field}) => (
                                      <FormItem>
                                          <FormLabel className="text-sm font-semibold text-gray-700">Amount ($)</FormLabel>
                                          <FormControl>
                                            <Input 
                                              type="number" 
                                              step="0.01" 
                                              placeholder="e.g., 100.00" 
                                              {...field} 
                                              onChange={e => field.onChange(isNaN(parseFloat(e.target.value)) ? '' : parseFloat(e.target.value))} 
                                              className="h-12 text-base bg-white/60 backdrop-blur-sm border-white/40 rounded-xl focus:bg-white/80 transition-all duration-300 shadow-inner"
                                            />
                                          </FormControl>
                                          <FormMessage className="text-xs" />
                                      </FormItem>
                                  )} />
                                  
                                  <FormField control={form.control} name="source" render={({field}) => (
                                      <FormItem>
                                        <FormLabel className="text-sm font-semibold text-gray-700">Source</FormLabel>
                                        <FormControl>
                                          <Input 
                                            placeholder="e.g., Credit Card **** 1234, Unknown VPN" 
                                            {...field} 
                                            className="h-12 text-base bg-white/60 backdrop-blur-sm border-white/40 rounded-xl focus:bg-white/80 transition-all duration-300 shadow-inner"
                                          />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                      </FormItem>
                                  )} />
                                  
                                  <FormField control={form.control} name="merchantId" render={({field}) => (
                                      <FormItem>
                                        <FormLabel className="text-sm font-semibold text-gray-700">Merchant ID / Name</FormLabel>
                                        <FormControl>
                                          <Input 
                                            placeholder="e.g., AMAZON_US, ShadyStore" 
                                            {...field} 
                                            className="h-12 text-base bg-white/60 backdrop-blur-sm border-white/40 rounded-xl focus:bg-white/80 transition-all duration-300 shadow-inner"
                                          />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                      </FormItem>
                                  )} />
                                  
                                   <FormField control={form.control} name="paymentMethod" render={({field}) => (
                                      <FormItem>
                                          <FormLabel className="text-sm font-semibold text-gray-700">Payment Method</FormLabel>
                                          <Select onValueChange={field.onChange} value={field.value || ''}>
                                            <FormControl>
                                              <SelectTrigger className="h-12 text-base bg-white/60 backdrop-blur-sm border-white/40 rounded-xl focus:bg-white/80 transition-all duration-300 shadow-inner">
                                                <SelectValue placeholder="Select payment method" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="backdrop-blur-xl bg-white/95 border-white/30 rounded-xl shadow-2xl">
                                                <SelectItem value="credit_card" className="rounded-lg">Credit Card</SelectItem>
                                                <SelectItem value="debit_card" className="rounded-lg">Debit Card</SelectItem>
                                                <SelectItem value="paypal" className="rounded-lg">PayPal</SelectItem>
                                                <SelectItem value="bank_transfer" className="rounded-lg">Bank Transfer</SelectItem>
                                                <SelectItem value="crypto" className="rounded-lg">Cryptocurrency</SelectItem>
                                                <SelectItem value="digital_wallet" className="rounded-lg">Digital Wallet</SelectItem>
                                                <SelectItem value="other" className="rounded-lg">Other</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <FormMessage className="text-xs" />
                                      </FormItem>
                                  )} />
                                  
                                   <FormField control={form.control} name="location" render={({field}) => (
                                      <FormItem>
                                        <FormLabel className="text-sm font-semibold text-gray-700">Location</FormLabel>
                                        <FormControl>
                                          <Input 
                                            placeholder="e.g., New York, USA, High-Risk Country" 
                                            {...field} 
                                            className="h-12 text-base bg-white/60 backdrop-blur-sm border-white/40 rounded-xl focus:bg-white/80 transition-all duration-300 shadow-inner"
                                          />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                      </FormItem>
                                  )} />
                                  
                                   <FormField control={form.control} name="userId" render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-sm font-semibold text-gray-700">User ID (Optional)</FormLabel>
                                          <FormControl>
                                            <Input 
                                              placeholder="e.g., user_abc_123" 
                                              {...field} 
                                              className="h-12 text-base bg-white/60 backdrop-blur-sm border-white/40 rounded-xl focus:bg-white/80 transition-all duration-300 shadow-inner"
                                            />
                                          </FormControl>
                                          <FormDescription className="text-sm text-gray-600 font-medium">
                                            Enhances AI pattern recognition capabilities
                                          </FormDescription>
                                          <FormMessage className="text-xs" />
                                        </FormItem>
                                   )} />
                                   
                                  <div className="flex space-x-3 pt-6">
                                    <Button 
                                      type="submit" 
                                      disabled={analysisLoading} 
                                      className="flex-1 h-12 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                    >
                                        {analysisLoading ? (
                                          <>
                                            <Icons.spinner className="animate-spin mr-2 h-5 w-5" />
                                            Analyzing...
                                          </>
                                        ) : (
                                          <>
                                            <Icons.shieldCheck className="mr-2 h-5 w-5" />
                                            Analyze Transaction
                                          </>
                                        )}
                                    </Button>
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      onClick={handleReset} 
                                      disabled={analysisLoading} 
                                      className="h-12 px-6 bg-white/60 backdrop-blur-sm border-white/40 rounded-xl hover:bg-white/80 transition-all duration-300 shadow-lg"
                                    >
                                      <Icons.refresh className="mr-2 h-4 w-4" />
                                      Reset
                                    </Button>
                                  </div>
                              </form>
                          </Form>
                      </CardContent>
                  </Card>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.5, delay: 0.3 }} 
                className="lg:col-span-2 space-y-8"
              >
                   <Card className="backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none"></div>
                      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-b border-white/20">
                          <CardTitle className="text-xl font-bold flex items-center text-gray-800">
                              <div className="mr-3 p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                                <Icons.messageSquare className="h-5 w-5" />
                              </div>
                              AI Fraud Assessment
                          </CardTitle>
                          {fraudExplanationDetails && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-sm h-9 px-4 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/60 transition-all duration-300 shadow-md font-medium" 
                              onClick={() => handleOpenInsights({
                                ...fraudExplanationDetails, 
                                id: fraudExplanationDetails.transactionId,
                                aiExplanation: fraudExplanationDetails.explanation,
                                transactionInsights: '',
                                timestamp: new Date() as any,
                                source: ''
                              } as TransactionData)}
                            >
                              <Icons.info className="mr-2 h-4 w-4" /> 
                              View Details
                            </Button>
                          )}
                      </CardHeader>
                      <CardContent className="relative p-6 min-h-[160px] flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
                          <AnimatePresence mode="wait">
                              {analysisLoading ? (
                                  <motion.div 
                                    key="loading-explanation" 
                                    className="w-full space-y-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                  >
                                      <div className="space-y-3">
                                        <Skeleton className="h-6 w-3/4 bg-white/40 backdrop-blur-sm rounded-xl" />
                                        <Skeleton className="h-6 w-full bg-white/40 backdrop-blur-sm rounded-xl" />
                                        <Skeleton className="h-6 w-2/3 bg-white/40 backdrop-blur-sm rounded-xl" />
                                      </div>
                                      <div className="flex items-center justify-center pt-4">
                                        <div className="flex items-center space-x-2 text-blue-600 font-medium">
                                          <Icons.spinner className="animate-spin h-5 w-5" />
                                          <span>AI analyzing transaction patterns...</span>
                                        </div>
                                      </div>
                                  </motion.div>
                              ) : fraudExplanationDetails ? (
                                  <motion.div 
                                    key="explanation-content" 
                                    className="w-full"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                  >
                                      <Alert 
                                        variant={getFraudStatus(fraudExplanationDetails.fraudRiskScore) === 'Fraudulent' ? 'destructive' : 'default'} 
                                        className={cn(
                                          'text-sm shadow-xl border-l-4 rounded-2xl backdrop-blur-sm bg-white/60 border border-white/40',
                                          getStatusBgColor(fraudExplanationDetails.fraudRiskScore), 
                                          getStatusBorderColor(fraudExplanationDetails.fraudRiskScore)
                                        )}
                                      >
                                          <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">
                                              {getStatusIcon(fraudExplanationDetails.fraudRiskScore)}
                                            </div>
                                            <AlertDescription className="flex-1 leading-relaxed text-base">
                                              {fraudExplanationDetails.explanation}
                                               {fraudExplanationDetails.behaviorPattern && (
                                                 <div className="mt-3 p-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40">
                                                   <p className="text-sm text-gray-700">
                                                     <span className="font-semibold text-purple-700">Behavioral Pattern Detected:</span>
                                                     <span className="ml-2 font-medium">{fraudExplanationDetails.behaviorPattern}</span>
                                                   </p>
                                                 </div>
                                               )}
                                            </AlertDescription>
                                          </div>
                                      </Alert>
                                  </motion.div>
                              ) : (
                                   <motion.div 
                                     key="placeholder-explanation" 
                                     className="text-center py-8"
                                     initial={{ opacity: 0 }}
                                     animate={{ opacity: 1 }}
                                     exit={{ opacity: 0 }}
                                   >
                                       <div className="flex flex-col items-center space-y-4">
                                         <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
                                           <Icons.search className="h-8 w-8 text-blue-600" />
                                         </div>
                                         <div className="space-y-2">
                                           <p className="text-lg font-semibold text-gray-700">Ready for Analysis</p>
                                           <p className="text-sm text-gray-500">Submit transaction details to receive AI-powered fraud assessment</p>
                                         </div>
                                       </div>
                                   </motion.div>
                              )}
                          </AnimatePresence>
                      </CardContent>
                  </Card>
                  <Card className="backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-transparent pointer-events-none"></div>
                      <CardHeader className="relative border-b border-white/20 pb-4 pt-6 px-6 bg-gradient-to-r from-green-500/5 to-blue-500/5">
                         <CardTitle className="text-xl font-bold flex items-center text-gray-800">
                           <div className="mr-3 p-2 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 text-white shadow-lg">
                             <Icons.history className="h-5 w-5"/>
                           </div>
                           Transaction History
                         </CardTitle>
                         <CardDescription className="text-sm pt-2 text-gray-600 font-medium">
                           Recently analyzed transactions with AI assessments
                         </CardDescription>
                      </CardHeader>
                      <CardContent className="relative p-0 bg-gradient-to-br from-white/5 to-transparent">
                          {isLoading ? (
                              <div className="p-6 space-y-4">
                                <div className="space-y-3">
                                  <Skeleton className="h-16 w-full bg-white/40 backdrop-blur-sm rounded-xl" />
                                  <Skeleton className="h-16 w-full bg-white/40 backdrop-blur-sm rounded-xl" />
                                  <Skeleton className="h-16 w-full bg-white/40 backdrop-blur-sm rounded-xl" />
                                </div>
                                <div className="flex items-center justify-center pt-4">
                                  <div className="flex items-center space-x-2 text-blue-600 font-medium">
                                    <Icons.spinner className="animate-spin h-5 w-5" />
                                    <span>Loading transaction history...</span>
                                  </div>
                                </div>
                              </div>
                          ) : transactions.length > 0 ? (
                              <ScrollArea className="h-80 w-full">
                                  <div className="p-4 space-y-3">
                                      <AnimatePresence initial={false}>
                                          {transactions.map((t) => (
                                              <motion.div 
                                                key={t.id} 
                                                layout 
                                                initial={{ opacity: 0, y: -10 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                exit={{ opacity: 0, x: -20 }} 
                                                transition={{ duration: 0.3 }}
                                                className={cn(
                                                  'flex items-center p-4 rounded-xl cursor-pointer border-l-4 backdrop-blur-sm bg-white/60 border border-white/40 hover:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]', 
                                                  getStatusBorderColor(t.fraudRiskScore)
                                                )}
                                                onClick={() => handleOpenInsights(t)}
                                              >
                                                  <div className="text-sm space-y-2 flex-1 overflow-hidden mr-4">
                                                      <div className="flex items-center space-x-2">
                                                        {t.isAgent ? (
                                                          <Icons.brainCircuit className="h-4 w-4 text-purple-600" />
                                                        ) : (
                                                          <Icons.code className="h-4 w-4 text-blue-600" />
                                                        )}
                                                        <span className="font-semibold text-gray-800">
                                                          ID: {t.id.substring(0, 12)}...
                                                        </span>
                                                      </div>
                                                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                        <span className="font-medium">
                                                          ${t.amount?.toFixed(2) ?? 'N/A'}
                                                        </span>
                                                        <span className="w-px h-4 bg-gray-300"></span>
                                                        <span className="truncate max-w-32">
                                                          {t.merchantId?.substring(0, 20) ?? 'N/A'}
                                                        </span>
                                                      </div>
                                                      <p className="text-xs text-gray-500 font-medium">
                                                        {t.timestamp?.toDate ? t.timestamp.toDate().toLocaleString() : 'N/A'}
                                                      </p>
                                                  </div>
                                                  <div className="flex items-center space-x-3 flex-shrink-0">
                                                      <Badge 
                                                        variant={getFraudStatus(t.fraudRiskScore) === 'Safe' ? 'default' : getFraudStatus(t.fraudRiskScore) === 'Suspicious' ? 'secondary' : 'destructive'}
                                                        className={cn(
                                                          'h-8 px-3 text-xs min-w-20 text-center justify-center font-bold rounded-full border-2 backdrop-blur-sm', 
                                                          getFraudStatus(t.fraudRiskScore) === 'Safe' && 'bg-green-100/80 text-green-800 border-green-300', 
                                                          getFraudStatus(t.fraudRiskScore) === 'Suspicious' && 'bg-yellow-100/80 text-yellow-800 border-yellow-300', 
                                                          getFraudStatus(t.fraudRiskScore) === 'Fraudulent' && 'bg-red-100/80 text-red-800 border-red-300'
                                                        )}
                                                      >
                                                          {getFraudStatus(t.fraudRiskScore)}
                                                      </Badge>
                                                      <div className="text-center">
                                                        <span className={`font-bold text-2xl ${getStatusColor(t.fraudRiskScore)} block leading-none`}>
                                                          {t.fraudRiskScore ?? 'N/A'}
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-medium">Risk Score</span>
                                                      </div>
                                                      {(t.riskTags?.length ?? 0) > 0 && (
                                                        <Tooltip>
                                                          <TooltipTrigger asChild>
                                                            <button className="p-2 rounded-lg bg-white/40 backdrop-blur-sm border border-white/40 hover:bg-white/60 transition-all duration-200">
                                                              <Icons.tag className="h-4 w-4 text-purple-600" />
                                                            </button>
                                                          </TooltipTrigger>
                                                          <TooltipContent className="text-sm bg-white/95 backdrop-blur-sm border border-white/40 rounded-xl shadow-xl">
                                                            <div className="font-semibold mb-1">Risk Tags:</div>
                                                            <div>{t.riskTags?.join(', ')}</div>
                                                          </TooltipContent>
                                                        </Tooltip>
                                                      )}
                                                  </div>
                                              </motion.div>
                                          ))}
                                      </AnimatePresence>
                                  </div>
                              </ScrollArea>
                          ) : (
                               <div className="h-80 flex items-center justify-center">
                                 <div className="text-center space-y-4">
                                   <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mx-auto w-fit">
                                     <Icons.history className="h-8 w-8 text-blue-600" />
                                   </div>
                                   <div className="space-y-2">
                                     <p className="text-lg font-semibold text-gray-700">No Transaction History</p>
                                     <p className="text-sm text-gray-500">Analyzed transactions will appear here</p>
                                   </div>
                                 </div>
                               </div>
                          )}
                      </CardContent>
                  </Card>
                  
                   <Card className="backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-2xl overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-transparent pointer-events-none"></div>
                       <CardHeader className="relative border-b border-white/20 pb-4 pt-6 px-6 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                         <CardTitle className="text-xl font-bold flex items-center text-gray-800">
                            <div className="mr-3 p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg">
                              <Icons.brain className="h-5 w-5" />
                            </div>
                            AI Decision Engine
                         </CardTitle>
                          <CardDescription className="text-sm pt-2 text-gray-600 font-medium">
                            Real-time AI reasoning and decision explanations
                          </CardDescription>
                       </CardHeader>
                       <CardContent className="p-4">
                         {isLoading ? <Skeleton className="h-40 w-full" /> : aiDecisionLog.length > 0 ? (
                           <ScrollArea className="h-40 w-full rounded-lg border p-3 text-xs font-mono bg-slate-50/50">
                             {aiDecisionLog.map((logEntry, index) => (
                               <motion.div key={index} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="mb-2 border-b pb-1.5 last:border-b-0 last:pb-0">
                                   <p className="leading-relaxed">{logEntry}</p>
                               </motion.div>
                             ))}
                           </ScrollArea>
                         ) : (<div className="h-40 flex items-center justify-center"><p className="text-sm text-muted-foreground italic">No AI decisions logged.</p></div>)}
                       </CardContent>
                  </Card>
              </motion.div>
          </div>
       </main>
        <Dialog open={isInsightsDialogOpen} onOpenChange={setIsInsightsDialogOpen}>
          <DialogContent className="sm:max-w-6xl max-h-[90vh]">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="flex items-center text-lg text-primary">
                {selectedTransactionInsights?.isAgent ? <Icons.brainCircuit className="mr-2 h-5 w-5" /> : <Icons.fileText className="mr-2 h-5 w-5" />}
                Revolutionary AI Fraud Analysis
              </DialogTitle>
              <DialogDescription className="text-xs pt-1">
                Advanced multi-dimensional analysis for Transaction ID: {selectedTransactionInsights?.id.substring(0, 12)}...
              </DialogDescription>
            </DialogHeader>
            {selectedTransactionInsights && (
              <ScrollArea className="max-h-[75vh] pr-4 -mr-4">
                <div className="space-y-6 py-4">
                  {/* Revolutionary Dashboard */}
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-primary">🚀 Revolutionary AI Systems</h3>
                    <RevolutionaryFraudDashboard 
                      transaction={selectedTransactionInsights}
                      relatedTransactions={transactions.filter(t => t.id !== selectedTransactionInsights.id).slice(0, 5)}
                    />
                  </div>
                  
                  <Separator />
                  
                  {/* Traditional Analysis */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">📊 Traditional Analysis</h3>
                    <div className={cn(`grid grid-cols-3 items-center gap-x-4 gap-y-2 rounded-lg border p-4 shadow-inner`, getStatusBgColor(selectedTransactionInsights.fraudRiskScore), 'border-l-4', getStatusBorderColor(selectedTransactionInsights.fraudRiskScore))}>
                         <span className="text-muted-foreground col-span-1 font-medium">Risk Score</span>
                         <span className={`font-bold text-xl ${getStatusColor(selectedTransactionInsights.fraudRiskScore)} col-span-2`}>
                             {selectedTransactionInsights.fraudRiskScore ?? 'N/A'} <span className="text-xs font-normal text-muted-foreground">/ 100</span>
                             <span className="block text-sm font-medium">({getFraudStatus(selectedTransactionInsights.fraudRiskScore)})</span>
                         </span>
                          <span className="text-muted-foreground col-span-1 font-medium">Mode</span>
                          <span className="col-span-2 text-xs font-medium">{selectedTransactionInsights.isAgent ? 'Agent' : 'Scripted'}</span>
                         <span className="text-muted-foreground col-span-1 font-medium text-xs">Timestamp</span>
                          <span className="col-span-2 text-xs text-muted-foreground">{selectedTransactionInsights.transactionTimestamp ? new Date(selectedTransactionInsights.transactionTimestamp).toLocaleString() : 'N/A'}</span>
                      </div>
                    
                    <div className="space-y-3">
                      <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">AI Analysis</p>
                      <div className="grid grid-cols-3 items-start gap-x-4"><span className="text-muted-foreground col-span-1">Explanation</span><p className="col-span-2">{selectedTransactionInsights.aiExplanation || 'N/A'}</p></div>
                       <div className="grid grid-cols-3 items-center gap-x-4"><span className="text-muted-foreground col-span-1">Behavior Pattern</span><span className="col-span-2 font-medium">{selectedTransactionInsights.behaviorPattern || 'N/A'}</span></div>
                      {!selectedTransactionInsights.isAgent && (
                          <>
                              <div className="grid grid-cols-3 items-start gap-x-4"><span className="text-muted-foreground col-span-1">Key Insights</span><p className="col-span-2">{selectedTransactionInsights.transactionInsights || 'N/A'}</p></div>
                              <div className="grid grid-cols-3 items-center gap-x-4"><span className="text-muted-foreground col-span-1">Behavioral Score</span><span className="col-span-2 font-medium">{selectedTransactionInsights.behavioralAnomalyScore ?? 'N/A'}</span></div>
                              <div className="grid grid-cols-3 items-center gap-x-4"><span className="text-muted-foreground col-span-1">Entity Trust</span><span className="col-span-2 font-medium">{selectedTransactionInsights.entityTrustScore ?? 'N/A'}</span></div>
                          </>
                      )}
                      <div className="grid grid-cols-3 items-start gap-x-4">
                        <span className="text-muted-foreground col-span-1 pt-1">Risk Tags</span>
                        <div className="col-span-2 flex flex-wrap gap-1.5">
                          {selectedTransactionInsights.riskTags && selectedTransactionInsights.riskTags.length > 0 ? (
                            selectedTransactionInsights.riskTags.map(tag => (
                               <Badge key={tag} variant="outline" className={cn(`text-xs px-2 py-0.5 font-medium border`, tag.toLowerCase().includes('high') || tag.toLowerCase().includes('anomaly') ? 'bg-red-100 text-red-800 border-red-200' : 'bg-primary/10 text-primary border-primary/30' )}>{tag}</Badge>
                            ))
                          ) : (<span className="text-muted-foreground italic text-xs">None</span>)}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Transaction Data</p>
                      <div className="grid grid-cols-3 items-center gap-x-4 gap-y-1.5">
                        <span className="text-muted-foreground col-span-1">Amount</span><span className="col-span-2 font-medium">${selectedTransactionInsights.amount?.toFixed(2) ?? 'N/A'}</span>
                        <span className="text-muted-foreground col-span-1">Source</span><span className="col-span-2">{selectedTransactionInsights.source}</span>
                        <span className="text-muted-foreground col-span-1">Merchant</span><span className="col-span-2">{selectedTransactionInsights.merchantId}</span>
                        <span className="text-muted-foreground col-span-1">Payment Method</span><span className="col-span-2">{selectedTransactionInsights.paymentMethod}</span>
                        <span className="text-muted-foreground col-span-1">Location</span><span className="col-span-2">{selectedTransactionInsights.location}</span>
                        <span className="text-muted-foreground col-span-1">User ID</span><span className="col-span-2 font-mono text-xs">{selectedTransactionInsights.userId || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
