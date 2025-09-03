'use server';
import {ai} from '@/ai/ai-instance';
import {z} from 'zod';
import {Timestamp, collection, query, where, orderBy, limit, getDocs, getCountFromServer} from 'firebase/firestore';
import {db} from '@/firebase/firebase-config';
import { mockAIResponses, isApiKeyConfigured } from '@/ai/mock-responses';

const FraudAgentInputSchema = z.object({
  amount: z.number(),
  location: z.string(),
  merchantId: z.string(),
  source: z.string().optional(),
  paymentMethod: z.string().optional(),
  userId: z.string().optional(),
  transactionTimestamp: z.string().datetime().optional(),
});
export type FraudAgentInput = z.infer<typeof FraudAgentInputSchema>;

const FraudAgentOutputSchema = z.object({
  fraudRiskScore: z.number().min(0).max(100),
  riskTags: z.array(z.string()),
  behaviorPattern: z.string(),
  justification: z.string(),
});
export type FraudAgentOutput = z.infer<typeof FraudAgentOutputSchema>;

const getRecentTransactionsTool = ai.defineTool(
  {
    name: 'getRecentTransactions',
    description: "Retrieves a user's most recent transactions to analyze their historical spending patterns.",
    inputSchema: z.object({
      userId: z.string(),
      limit: z.number().optional().default(10),
      currentTime: z.string().datetime(),
    }),
    outputSchema: z.array(z.object({
        timestamp: z.string().datetime(), 
        location: z.string(), 
        amount: z.number(), 
        merchantId: z.string(),
    })),
  },
  async ({ userId, limit: limitCount, currentTime: currentTimeISO }) => {
    if (!userId) return [];
    try {
      const q = query(
        collection(db, 'transactions'), 
        where('userId', '==', userId), 
        where('timestamp', '<', Timestamp.fromDate(new Date(currentTimeISO))), 
        orderBy('timestamp', 'desc'), 
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => { 
        const d = doc.data(); 
        return { 
          timestamp: d.timestamp.toDate().toISOString(), 
          location: d.location, 
          amount: d.amount, 
          merchantId: d.merchantId 
        }; 
      });
    } catch (error) {
      console.warn('Tool failed to fetch recent transactions:', error);
      return [];
    }
  }
);

const checkMerchantVelocityTool = ai.defineTool({
    name: 'checkMerchantVelocity',
    description: 'Checks if a merchant is experiencing an unusual spike in transaction volume recently.',
    inputSchema: z.object({ merchantId: z.string() }),
    outputSchema: z.object({ 
        isSpike: z.boolean(), 
        recentTransactionCount: z.number(), 
        previousTransactionCount: z.number() 
    }),
}, async ({merchantId}) => {
    try {
      const lookbackMinutes = 60;
      const now = new Date();
      const lookbackTime = Timestamp.fromMillis(now.getTime() - lookbackMinutes * 60 * 1000);
      const evenFurtherBackTime = Timestamp.fromMillis(lookbackTime.toMillis() - lookbackMinutes * 60 * 1000);
      
      const recentQuery = query(
        collection(db, 'transactions'), 
        where('merchantId', '==', merchantId), 
        where('timestamp', '>=', lookbackTime)
      );
      const olderQuery = query(
        collection(db, 'transactions'), 
        where('merchantId', '==', merchantId), 
        where('timestamp', '>=', evenFurtherBackTime), 
        where('timestamp', '<', lookbackTime)
      );
      
      const [recentSnapshot, olderSnapshot] = await Promise.all([
        getCountFromServer(recentQuery), 
        getCountFromServer(olderQuery)
      ]);
      
      const recentCount = recentSnapshot.data().count;
      const olderCount = olderSnapshot.data().count;
      
      return { 
        isSpike: recentCount > 50 && recentCount > olderCount * 3, 
        recentTransactionCount: recentCount, 
        previousTransactionCount: olderCount 
      };
    } catch (error) {
      console.warn('Tool failed to check merchant velocity:', error);
      return { isSpike: false, recentTransactionCount: 0, previousTransactionCount: 0 };
    }
});

const fraudAgent = ai.definePrompt({
    name: 'fraudAgentInvestigator',
    input: { schema: FraudAgentInputSchema },
    output: { schema: FraudAgentOutputSchema },
    tools: [ getRecentTransactionsTool, checkMerchantVelocityTool ],
    prompt: `You are an expert fraud detection agent with years of experience investigating financial crimes. Your goal is to determine the fraud risk score (0-100) for this transaction.

INVESTIGATION PROCESS:
1. First, analyze the basic transaction details for obvious red flags
2. If a userId is provided, ALWAYS use the 'getRecentTransactions' tool to examine user behavior patterns
3. Consider using 'checkMerchantVelocity' if merchant behavior seems suspicious
4. Synthesize all findings and be aggressive with scoring when multiple weak signals combine

SCORING GUIDELINES:
- 0-30: Safe (normal transaction patterns)
- 31-69: Suspicious (some red flags, needs review)
- 70-100: Fraudulent (high confidence, multiple risk factors)

Be especially vigilant for:
- Impossible travel (location changes too quickly)
- Unusual amounts for the user/merchant
- Anonymous sources or high-risk locations
- Velocity spikes or unusual patterns

CURRENT TRANSACTION:
Amount: {{{amount}}}
Location: {{{location}}}
Merchant: {{{merchantId}}}
Source: {{{source}}}
Payment Method: {{{paymentMethod}}}
User ID: {{{userId}}}
Timestamp: {{{transactionTimestamp}}}

Provide your analysis with a clear behaviorPattern, comprehensive riskTags, and detailed justification.`,
});

const investigateFraudAgentFlow = ai.defineFlow(
    { 
        name: 'investigateFraudAgentFlow', 
        inputSchema: FraudAgentInputSchema, 
        outputSchema: FraudAgentOutputSchema 
    },
    async (input) => {
        // Check if API key is properly configured
        if (!isApiKeyConfigured()) {
            console.log('🔄 Using demo mode for fraud agent analysis...');
            const riskScore = mockAIResponses.fraudRiskScore();
            return {
                fraudRiskScore: riskScore,
                behaviorPattern: mockAIResponses.behaviorPattern(),
                riskTags: mockAIResponses.riskTags(riskScore),
                justification: mockAIResponses.agentJustification(riskScore)
            };
        }

        try {
            const { output } = await fraudAgent(input);
            if (!output) {
                throw new Error("Agent failed to produce an output.");
            }
            return output;
        } catch (error) {
            console.log('⚠️ AI API failed, falling back to demo mode...', error);
            const riskScore = mockAIResponses.fraudRiskScore();
            return {
                fraudRiskScore: riskScore,
                behaviorPattern: mockAIResponses.behaviorPattern(),
                riskTags: mockAIResponses.riskTags(riskScore),
                justification: mockAIResponses.agentJustification(riskScore)
            };
        }
    }
);

export async function investigateFraudAgent(input: FraudAgentInput): Promise<FraudAgentOutput> {
    return investigateFraudAgentFlow(input);
}
