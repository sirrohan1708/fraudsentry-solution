'use server';

import { ai } from '@/ai/ai-instance';
import { z } from 'zod';
import { mockAIResponses, isApiKeyConfigured } from '@/ai/mock-responses';

const AiExplanationsInputSchema = z.object({
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
});

export type AiExplanationsInput = z.infer<typeof AiExplanationsInputSchema>;

const AiExplanationsOutputSchema = z.object({
  explanation: z.string().describe('Human-readable explanation of the fraud risk assessment'),
});

export type AiExplanationsOutput = z.infer<typeof AiExplanationsOutputSchema>;

export async function generateAiExplanations(input: AiExplanationsInput): Promise<AiExplanationsOutput> {
  return aiExplanationsFlow(input);
}

const aiExplanationsFlow = ai.defineFlow({
  name: 'aiExplanationsFlow',
  inputSchema: AiExplanationsInputSchema,
  outputSchema: AiExplanationsOutputSchema,
}, async (input) => {
  let explanation = '';
  
  // Determine risk level and base explanation
  if (input.fraudRiskScore >= 70) {
    explanation = `🚨 HIGH RISK (${input.fraudRiskScore}/100): This transaction exhibits multiple concerning patterns that strongly indicate fraudulent activity. `;
  } else if (input.fraudRiskScore >= 30) {
    explanation = `⚠️ MODERATE RISK (${input.fraudRiskScore}/100): This transaction shows some suspicious characteristics that warrant closer examination. `;
  } else {
    explanation = `✅ LOW RISK (${input.fraudRiskScore}/100): This transaction appears legitimate with minimal fraud indicators. `;
  }
  
  // Add behavior pattern explanation
  switch (input.behaviorPattern) {
    case 'Large Unusual Transaction':
      explanation += 'The transaction amount is significantly higher than typical patterns, which could indicate account takeover or unauthorized access. ';
      break;
    case 'Anonymous Digital Wallet Use':
      explanation += 'The use of anonymous digital wallets raises concerns about identity verification and fund traceability. ';
      break;
    case 'Low-Value Probing':
      explanation += 'Small transaction amounts often indicate testing of stolen payment methods before larger fraudulent purchases. ';
      break;
    case 'Anonymous Source/Location':
      explanation += 'The transaction originates from an anonymous source or suspicious location, making identity verification difficult. ';
      break;
    case 'Cryptocurrency Transaction':
      explanation += 'Cryptocurrency transactions inherently carry higher risk due to their irreversible nature and anonymity features. ';
      break;
    default:
      explanation += 'The transaction follows standard patterns with no major behavioral anomalies detected. ';
  }
  
  // Add risk tags explanation
  if (input.riskTags.length > 0) {
    const highRiskTags = input.riskTags.filter(tag => 
      ['Impossible Travel', 'Synthetic ID Risk', 'Suspicious Merchant', 'High-Risk Location'].includes(tag)
    );
    
    if (highRiskTags.length > 0) {
      explanation += `Critical factors detected: ${highRiskTags.join(', ')}. `;
    }
    
    if (input.riskTags.includes('Combination Risk')) {
      explanation += 'Multiple moderate risk factors combine to create elevated overall risk. ';
    }
    
    if (input.riskTags.includes('Geo Anomaly') || input.riskTags.includes('Impossible Travel')) {
      explanation += 'Geographic inconsistencies suggest potential account compromise or identity theft. ';
    }
  }
  
  // Add contextual information
  if (input.amount > 1000) {
    explanation += `The high transaction amount of $${input.amount.toFixed(2)} increases potential financial impact. `;
  }
  
  if (input.userId) {
    explanation += 'User history analysis was factored into this assessment. ';
  } else {
    explanation += 'Limited user context available for this assessment. ';
  }
  
  return { explanation: explanation.trim() };
});
