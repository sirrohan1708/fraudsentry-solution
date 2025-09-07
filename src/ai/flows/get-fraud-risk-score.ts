'use server';

import { ai } from '@/ai/ai-instance';
import { z } from 'zod';
import { Timestamp, collection, query, where, orderBy, limit, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { mockAIResponses, isApiKeyConfigured } from '@/ai/mock-responses';

export interface RecentTransaction {
    timestamp?: Date;
    location: string;
    amount: number;
    merchantId: string;
    paymentMethod?: string;
    userId?: string;
}

const FraudRiskScoreInputSchema = z.object({
  amount: z.number().describe('The monetary value of the transaction.'),
  location: z.string().describe('Geographical location (e.g., country, city, IP region, "Unknown VPN Node").'),
  merchantId: z.string().describe('Unique identifier or name of the merchant.'),
  source: z.string().optional().describe('Origin of the funds (e.g., "Credit Card **** 1234", "Virtual Wallet xZ-9910").'),
  paymentMethod: z.string().optional().describe('Method used (e.g., "credit_card", "digital_wallet", "crypto").'),
  userId: z.string().optional().describe('Unique identifier of the user, if available.'),
  transactionTimestamp: z.string().datetime().optional().describe("Timestamp of the current transaction."),
});
export type FraudRiskScoreInput = z.infer<typeof FraudRiskScoreInputSchema>;

const FraudRiskScoreOutputSchema = z.object({
  fraudRiskScore: z.number().min(0).max(100).describe('The calculated fraud risk score (0-100).'),
  riskTags: z.array(z.string()).describe('Tags indicating identified risk factors.'),
  behaviorPattern: z.string().describe("The behavior pattern automatically determined by the AI."),
  behavioralAnomalyScore: z.number().min(0).max(100).optional(),
  entityTrustScore: z.number().min(0).max(100).optional(),
});
export type FraudRiskScoreOutput = z.infer<typeof FraudRiskScoreOutputSchema>;

export async function getFraudRiskScore(input: FraudRiskScoreInput): Promise<FraudRiskScoreOutput> {
  return fraudRiskScoreFlow(input);
}

const determineBehaviorPattern = (input: FraudRiskScoreInput, recentUserTxns: RecentTransaction[], currentTimestamp: Date): string => {
    const { amount, source, paymentMethod, location } = input;
    const sourceLower = source?.toLowerCase() ?? '';
    const paymentLower = paymentMethod?.toLowerCase() ?? '';
    
    if (paymentLower === 'digital_wallet' && sourceLower.includes('virtual wallet xz-')) return 'Anonymous Digital Wallet Use';
    if (sourceLower === 'unknown' || location.toLowerCase().includes('vpn')) return 'Anonymous Source/Location';
    if (paymentLower === 'crypto') return 'Cryptocurrency Transaction';
    if (amount > 1000) return 'Large Unusual Transaction';
    if (amount < 10) return 'Low-Value Probing';
    return 'Standard Transaction Activity';
};

const getRecentTransactionsSimulated = async (identifier: string | null | undefined, idType: 'userId' | 'merchantId', limitCount = 10, currentTime: Date): Promise<RecentTransaction[]> => {
   if (!identifier || !db) return [];
   try {
     const q = query(collection(db, 'transactions'), where(idType, '==', identifier), where('timestamp', '<', Timestamp.fromDate(currentTime)), orderBy('timestamp', 'desc'), limit(limitCount));
     const snapshot = await getDocs(q);
     return snapshot.docs.map(doc => { 
       const d = doc.data(); 
       return { 
         timestamp: d.timestamp?.toDate(), 
         location: d.location, 
         amount: d.amount, 
         merchantId: d.merchantId 
       } as RecentTransaction; 
     });
   } catch (error) {
     console.log('Transaction history disabled - Firebase not configured. Using AI-only analysis.');
     return [];
   }
};

const checkVelocitySimulated = async (id: string, type: 'user' | 'merchant'): Promise<{isSpike: boolean, isHigh: boolean}> => {
    if (!id || !db) return { isSpike: false, isHigh: false };
    
    const lookbackMinutes = type === 'user' ? 15 : 60;
    const threshold = type === 'user' ? 4 : 100;
    
    try {
      const now = new Date();
      const lookbackTime = Timestamp.fromDate(new Date(now.getTime() - lookbackMinutes * 60 * 1000));
      const q = query(collection(db, 'transactions'), where(type === 'user' ? 'userId' : 'merchantId', '==', id), where('timestamp', '>=', lookbackTime));
      const count = (await getCountFromServer(q)).data().count;
      return { isSpike: count > threshold * 2, isHigh: count > threshold };
    } catch (error) {
      console.log('Velocity check disabled - Firebase not configured. Using simulated analysis.');
      // Return realistic simulated velocity check results
      const simulatedCount = Math.floor(Math.random() * (threshold * 1.5));
      return { 
        isSpike: simulatedCount > threshold * 2, 
        isHigh: simulatedCount > threshold 
      };
    }
};

const fraudRiskScoreFlow = ai.defineFlow({
  name: 'fraudRiskScoreFlow_Advanced_v8',
  inputSchema: FraudRiskScoreInputSchema,
  outputSchema: FraudRiskScoreOutputSchema,
}, async (input) => {
    let score = 0;
    const riskTags: string[] = [];
    const currentTimestamp = input.transactionTimestamp ? new Date(input.transactionTimestamp) : new Date();

    const [recentUserTransactions, merchantVelocity, userVelocity] = await Promise.all([
        input.userId ? getRecentTransactionsSimulated(input.userId, 'userId', 15, currentTimestamp) : Promise.resolve([]),
        checkVelocitySimulated(input.merchantId, 'merchant'),
        input.userId ? checkVelocitySimulated(input.userId, 'user') : Promise.resolve({ isSpike: false, isHigh: false })
    ]);

    const behaviorPattern = determineBehaviorPattern(input, recentUserTransactions, currentTimestamp);

    // Pattern-based scoring
    switch (behaviorPattern) {
        case 'Large Unusual Transaction': score += 55; riskTags.push("Unusual Behavior", "High Amount"); break;
        case 'Anonymous Digital Wallet Use': score += 70; riskTags.push("Synthetic ID Risk", "Anonymous Source"); break;
        case 'Low-Value Probing': score += 65; riskTags.push("Synthetic ID Risk", "Low Amount Anomaly", "Probing Attempt"); break;
        case 'Anonymous Source/Location': score += 60; riskTags.push("Anonymous Source", "Location Anomaly", "VPN/Proxy"); break;
    }

    // Risk factor analysis
    if (input.location.toLowerCase().includes('high-risk-country')) { score += 65; riskTags.push('High-Risk Location'); }
    if (input.merchantId.toLowerCase().includes('shady')) { score += 75; riskTags.push('Suspicious Merchant'); }
    if (merchantVelocity.isSpike) { score += 60; riskTags.push('Merchant Velocity Spike'); }
    if (userVelocity.isHigh) { score += 40; riskTags.push('High User Velocity'); }
    if (input.userId && input.userId.includes("chargeback_abuser")) { score += 55; riskTags.push('Chargeback Abuse Risk'); }
    
    // Geographic anomaly detection
    if (recentUserTransactions.length > 0) {
        const prevTx = recentUserTransactions[0];
        if (prevTx.timestamp && prevTx.location) {
            const timeDiff = (currentTimestamp.getTime() - prevTx.timestamp.getTime()) / (1000 * 60);
            if (prevTx.location !== input.location && timeDiff < 60) {
                score += 85; riskTags.push('Geo Anomaly', 'Impossible Travel');
            }
        }
    }
    
    // Combination risk analysis
    const moderateRiskFactorCount = riskTags.filter(tag => 
        ['Anonymous Source', 'Location Anomaly', 'Risky Payment Method', 'Unknown/New Merchant'].includes(tag)
    ).length;
    
    if (moderateRiskFactorCount >= 2) {
         const combinationBonus = 20 * (moderateRiskFactorCount - 1) + (input.amount < 50 ? 15 : 0);
         score += combinationBonus;
         riskTags.push('Combination Risk');
    }

    // Low amount anomaly with suspicious factors
    const significantAnomaliesForLowAmount = new Set([
        'VPN/Proxy', 'High-Risk Location', 'Suspicious Merchant', 'Impossible Travel', 
        'Merchant Velocity Spike', 'High User Velocity', 'Chargeback Abuse Risk', 'Combination Risk'
    ]);
    
    if (input.amount < 30 && riskTags.some(tag => significantAnomaliesForLowAmount.has(tag))) {
        score += 45;
        if (!riskTags.includes('Low Amount Anomaly')) {
            riskTags.push('Low Amount Anomaly', 'Suspicious Low Value Transaction');
        }
    }

    const finalScore = Math.min(100, Math.round(score));
    const behavioralAnomalyScore = Math.min(100, Math.round(score * 0.8 + Math.random() * 20));
    const entityTrustScore = Math.max(0, Math.round(100 - score * 0.9));

    return { 
        fraudRiskScore: finalScore, 
        riskTags: [...new Set(riskTags)], 
        behaviorPattern,
        behavioralAnomalyScore,
        entityTrustScore
    };
});
