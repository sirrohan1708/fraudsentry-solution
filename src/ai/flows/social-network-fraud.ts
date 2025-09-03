import { ai } from '@/ai/ai-instance';

// Advanced Social Network Fraud Detection
export const socialNetworkFraudFlow = ai.defineFlow(
  'socialNetworkFraud',
  'Detect fraud rings and suspicious networks using social connections and communication patterns',
  async (inputData: {
    userConnections: {
      userId: string;
      connectionType: 'friend' | 'family' | 'colleague' | 'unknown';
      connectionStrength: number; // 0-1
      communicationFrequency: number;
      sharedTransactions: number;
    }[];
    communicationPatterns: {
      messageCount: number;
      averageResponseTime: number;
      communicationTimes: number[]; // timestamps
      sharedAccounts: string[];
    };
    transactionNetwork: {
      sharedMerchants: string[];
      similarAmounts: number[];
      proximityTransactions: number; // transactions close in time/location
      deviceOverlap: string[]; // shared device fingerprints
    };
  }) => {
    // Analyze social connections for fraud rings
    const connectionAnalysis = analyzeSocialConnections(inputData.userConnections);
    
    // Analyze communication patterns
    const communicationAnalysis = analyzeCommunicationPatterns(inputData.communicationPatterns);
    
    // Analyze transaction network
    const networkAnalysis = analyzeTransactionNetwork(inputData.transactionNetwork);
    
    // Calculate overall fraud ring score
    const fraudRingScore = calculateFraudRingScore({
      connection: connectionAnalysis.riskScore,
      communication: communicationAnalysis.riskScore,
      transaction: networkAnalysis.riskScore
    });
    
    return {
      fraudRingScore,
      riskLevel: fraudRingScore > 0.8 ? 'high' : fraudRingScore > 0.5 ? 'medium' : 'low',
      suspiciousConnections: [
        ...connectionAnalysis.suspiciousConnections,
        ...communicationAnalysis.suspiciousPatterns,
        ...networkAnalysis.suspiciousNetworks
      ],
      fraudRingIndicators: [
        ...connectionAnalysis.indicators,
        ...communicationAnalysis.indicators,
        ...networkAnalysis.indicators
      ],
      recommendations: generateSocialRecommendations(fraudRingScore),
      networkInsights: {
        connectionRisk: connectionAnalysis,
        communicationRisk: communicationAnalysis,
        transactionRisk: networkAnalysis
      }
    };
  }
);

function analyzeSocialConnections(connections: any[]) {
  const totalConnections = connections.length;
  const suspiciousConnections = [];
  const indicators = [];
  
  // Analyze connection patterns
  const unknownConnections = connections.filter(c => c.connectionType === 'unknown').length;
  const unknownRatio = unknownConnections / totalConnections;
  
  const weakConnections = connections.filter(c => c.connectionStrength < 0.3).length;
  const weakRatio = weakConnections / totalConnections;
  
  const highTransactionOverlap = connections.filter(c => c.sharedTransactions > 5).length;
  const overlapRatio = highTransactionOverlap / totalConnections;
  
  // Calculate risk score
  let riskScore = 0;
  
  // High ratio of unknown connections is suspicious
  if (unknownRatio > 0.7) {
    riskScore += 0.4;
    indicators.push('High ratio of unknown connections');
    suspiciousConnections.push('Too many unverified social connections');
  }
  
  // High ratio of weak connections but high transaction overlap is suspicious
  if (weakRatio > 0.6 && overlapRatio > 0.3) {
    riskScore += 0.3;
    indicators.push('Weak social connections with high transaction overlap');
    suspiciousConnections.push('Artificial network with transaction coordination');
  }
  
  // Analyze communication frequency patterns
  const avgCommunication = connections.reduce((sum, c) => sum + c.communicationFrequency, 0) / totalConnections;
  if (avgCommunication > 50 && weakRatio > 0.5) { // High communication but weak connections
    riskScore += 0.3;
    indicators.push('High communication frequency with weak social bonds');
    suspiciousConnections.push('Coordinated communication in artificial network');
  }
  
  return {
    riskScore: Math.min(1, riskScore),
    suspiciousConnections,
    indicators,
    metrics: {
      totalConnections,
      unknownRatio,
      weakRatio,
      overlapRatio,
      avgCommunication
    }
  };
}

function analyzeCommunicationPatterns(patterns: any) {
  const indicators = [];
  const suspiciousPatterns = [];
  let riskScore = 0;
  
  // Analyze response time patterns
  if (patterns.averageResponseTime < 30000) { // Less than 30 seconds - might be automated
    riskScore += 0.3;
    indicators.push('Unusually fast response times suggesting automation');
    suspiciousPatterns.push('Potential bot-like communication patterns');
  }
  
  // Analyze communication timing
  const communicationHours = patterns.communicationTimes.map(timestamp => {
    const date = new Date(timestamp);
    return date.getHours();
  });
  
  // Check for unusual timing patterns (e.g., all communications at odd hours)
  const nightCommunications = communicationHours.filter(hour => hour < 6 || hour > 22).length;
  const nightRatio = nightCommunications / communicationHours.length;
  
  if (nightRatio > 0.8) {
    riskScore += 0.2;
    indicators.push('High proportion of communications during unusual hours');
    suspiciousPatterns.push('Coordinated communication during off-hours');
  }
  
  // Analyze shared accounts
  if (patterns.sharedAccounts.length > 3) {
    riskScore += 0.4;
    indicators.push('Multiple shared accounts indicating coordinated activity');
    suspiciousPatterns.push('Extensive account sharing in network');
  }
  
  // Analyze message volume
  if (patterns.messageCount > 1000) { // Very high message count
    riskScore += 0.1;
    indicators.push('Extremely high communication volume');
  }
  
  return {
    riskScore: Math.min(1, riskScore),
    suspiciousPatterns,
    indicators,
    metrics: {
      averageResponseTime: patterns.averageResponseTime,
      nightCommunicationRatio: nightRatio,
      sharedAccountCount: patterns.sharedAccounts.length,
      messageCount: patterns.messageCount
    }
  };
}

function analyzeTransactionNetwork(network: any) {
  const indicators = [];
  const suspiciousNetworks = [];
  let riskScore = 0;
  
  // Analyze shared merchants
  if (network.sharedMerchants.length > 10) {
    riskScore += 0.3;
    indicators.push('High number of shared merchants');
    suspiciousNetworks.push('Potential merchant-based fraud ring');
  }
  
  // Analyze similar transaction amounts
  if (network.similarAmounts.length > 5) {
    const amountVariance = calculateVariance(network.similarAmounts);
    if (amountVariance < 100) { // Very similar amounts
      riskScore += 0.4;
      indicators.push('Coordinated transaction amounts detected');
      suspiciousNetworks.push('Synchronized transaction patterns');
    }
  }
  
  // Analyze proximity transactions
  if (network.proximityTransactions > 20) {
    riskScore += 0.3;
    indicators.push('High number of proximity transactions');
    suspiciousNetworks.push('Coordinated transaction timing and location');
  }
  
  // Analyze device overlap
  if (network.deviceOverlap.length > 2) {
    riskScore += 0.5;
    indicators.push('Multiple users sharing devices');
    suspiciousNetworks.push('Potential device-based fraud coordination');
  }
  
  return {
    riskScore: Math.min(1, riskScore),
    suspiciousNetworks,
    indicators,
    metrics: {
      sharedMerchantCount: network.sharedMerchants.length,
      similarAmountCount: network.similarAmounts.length,
      proximityTransactionCount: network.proximityTransactions,
      deviceOverlapCount: network.deviceOverlap.length
    }
  };
}

function calculateFraudRingScore(scores: {
  connection: number;
  communication: number;
  transaction: number;
}) {
  // Weighted combination of different risk factors
  const weights = {
    connection: 0.4,
    communication: 0.3,
    transaction: 0.3
  };
  
  return (
    scores.connection * weights.connection +
    scores.communication * weights.communication +
    scores.transaction * weights.transaction
  );
}

function generateSocialRecommendations(fraudRingScore: number) {
  const recommendations = [];
  
  if (fraudRingScore > 0.8) {
    recommendations.push('High fraud ring risk - immediate investigation required');
    recommendations.push('Freeze related accounts pending review');
    recommendations.push('Alert fraud investigation team');
    recommendations.push('Monitor all network members');
  } else if (fraudRingScore > 0.5) {
    recommendations.push('Moderate fraud ring risk - enhanced monitoring');
    recommendations.push('Review transaction patterns across network');
    recommendations.push('Consider additional verification for network members');
  } else if (fraudRingScore > 0.3) {
    recommendations.push('Low fraud ring risk - standard monitoring');
    recommendations.push('Periodic review of network activity');
  } else {
    recommendations.push('No significant fraud ring indicators');
    recommendations.push('Continue normal operations');
  }
  
  return recommendations;
}

function calculateVariance(values: number[]) {
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
}
