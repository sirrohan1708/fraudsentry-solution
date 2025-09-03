'use server';

import { ai } from '@/ai/ai-instance';
import { z } from 'zod';
import { mockAIResponses, isApiKeyConfigured } from '@/ai/mock-responses';

const TransactionInsightsInputSchema = z.object({
  amount: z.number(),
  source: z.string(),
  merchantId: z.string(),
  paymentMethod: z.string(),
  location: z.string(),
  userId: z.string().optional(),
  transactionId: z.string(),
  fraudRiskScore: z.number(),
  behaviorPattern: z.string(),
  riskTags: z.array(z.string()),
  transactionTimestamp: z.string(),
  behavioralAnomalyScore: z.number().optional(),
  entityTrustScore: z.number().optional(),
});

export type TransactionInsightsInput = z.infer<typeof TransactionInsightsInputSchema>;

const TransactionInsightsOutputSchema = z.object({
  insights: z.string().describe('Detailed insights about the transaction'),
  behavioralAnomalyScore: z.number().min(0).max(100).optional(),
  entityTrustScore: z.number().min(0).max(100).optional(),
  riskTags: z.array(z.string()).optional(),
});

export type TransactionInsightsOutput = z.infer<typeof TransactionInsightsOutputSchema>;

export async function getTransactionInsights(input: TransactionInsightsInput): Promise<TransactionInsightsOutput> {
  return transactionInsightsFlow(input);
}

const transactionInsightsFlow = ai.defineFlow({
  name: 'transactionInsightsFlow',
  inputSchema: TransactionInsightsInputSchema,
  outputSchema: TransactionInsightsOutputSchema,
}, async (input) => {
  // Generate insights based on the transaction data
  const riskLevel = input.fraudRiskScore >= 70 ? 'HIGH' : input.fraudRiskScore >= 30 ? 'MODERATE' : 'LOW';
  
  let insights = `Transaction Analysis (Risk Level: ${riskLevel}):\n\n`;
  
  insights += `Risk Assessment: This transaction scored ${input.fraudRiskScore}/100, indicating ${riskLevel} risk. `;
  insights += `The behavior pattern "${input.behaviorPattern}" was detected. `;
  
  if (input.riskTags.length > 0) {
    insights += `Key risk factors include: ${input.riskTags.join(', ')}. `;
  }
  
  if (input.behavioralAnomalyScore) {
    insights += `The behavioral anomaly score of ${input.behavioralAnomalyScore}/100 suggests `;
    insights += input.behavioralAnomalyScore >= 70 ? 'significant deviation from normal patterns. ' : 'some irregular behavior. ';
  }
  
  if (input.entityTrustScore) {
    insights += `The entity trust score of ${input.entityTrustScore}/100 indicates `;
    insights += input.entityTrustScore >= 70 ? 'high trustworthiness. ' : input.entityTrustScore >= 30 ? 'moderate trustworthiness. ' : 'low trustworthiness. ';
  }
  
  // Add specific recommendations based on risk level
  if (input.fraudRiskScore >= 70) {
    insights += 'RECOMMENDATION: Flag for immediate manual review and consider blocking until verification. ';
  } else if (input.fraudRiskScore >= 30) {
    insights += 'RECOMMENDATION: Monitor closely and request additional verification if needed. ';
  } else {
    insights += 'RECOMMENDATION: Transaction appears safe to proceed with standard monitoring. ';
  }

  return {
    insights,
    behavioralAnomalyScore: input.behavioralAnomalyScore,
    entityTrustScore: input.entityTrustScore,
    riskTags: input.riskTags,
  };
});
