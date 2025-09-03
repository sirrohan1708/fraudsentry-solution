// Mock AI responses for demo purposes when API key is not configured
export const mockAIResponses = {
  fraudRiskScore: () => Math.floor(Math.random() * 100),
  
  behaviorPattern: () => {
    const patterns = [
      'Suspicious velocity pattern detected',
      'Normal user behavior',
      'Irregular timing patterns',
      'High-risk merchant interaction',
      'Anomalous transaction amount'
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  },
  
  explanation: (amount: number, location: string, riskScore: number) => {
    if (riskScore > 70) {
      return `High-risk transaction detected. Amount of $${amount} in ${location} shows multiple fraud indicators including unusual timing, suspicious merchant patterns, and behavioral anomalies.`;
    } else if (riskScore > 40) {
      return `Moderate risk transaction. Amount of $${amount} in ${location} has some concerning patterns but within acceptable thresholds for this user profile.`;
    } else {
      return `Low-risk transaction. Amount of $${amount} in ${location} appears legitimate based on user history and behavioral analysis.`;
    }
  },
  
  insights: (transactionData: any) => {
    const insights = [
      'Transaction timing aligns with user patterns',
      'Merchant has good reputation score',
      'Location matches user travel history',
      'Payment method verified successfully',
      'Velocity checks passed'
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  },
  
  riskTags: (riskScore: number) => {
    if (riskScore > 70) {
      return ['HIGH_RISK', 'VELOCITY_ANOMALY', 'SUSPICIOUS_MERCHANT'];
    } else if (riskScore > 40) {
      return ['MODERATE_RISK', 'UNUSUAL_TIMING'];
    } else {
      return ['LOW_RISK', 'VERIFIED_USER'];
    }
  },
  
  agentJustification: (riskScore: number) => {
    return `Advanced AI agent analysis completed. Risk assessment: ${riskScore}/100. Multiple fraud detection algorithms converged on this score including behavioral analysis, merchant reputation, transaction velocity, and location verification.`;
  }
};

export const isApiKeyConfigured = () => {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  return apiKey && apiKey !== 'your_google_genai_api_key_here' && apiKey.length > 10;
};
