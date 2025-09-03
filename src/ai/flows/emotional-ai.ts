import { ai } from '@/ai/ai-instance';

// Emotional AI Fraud Detection
export const emotionalAIFlow = ai.defineFlow(
  'emotionalAI',
  'Detect emotional stress indicators that suggest fraudulent intent or behavior',
  async (inputData: {
    voicePatterns?: {
      pitch: number[];
      speed: number[];
      volume: number[];
      pauseDuration: number[];
    };
    textSentiment?: {
      messages: string[];
      urgencyKeywords: string[];
      emotionalTone: string;
    };
    interactionBehavior?: {
      clickForce: number[];
      scrollSpeed: number[];
      hesitationTime: number[];
      errorRate: number;
    };
  }) => {
    const analyses = [];
    
    // Voice stress analysis
    if (inputData.voicePatterns) {
      const voiceStress = analyzeVoiceStress(inputData.voicePatterns);
      analyses.push(voiceStress);
    }
    
    // Text sentiment analysis
    if (inputData.textSentiment) {
      const textStress = analyzeTextSentiment(inputData.textSentiment);
      analyses.push(textStress);
    }
    
    // Interaction behavior analysis
    if (inputData.interactionBehavior) {
      const behaviorStress = analyzeInteractionStress(inputData.interactionBehavior);
      analyses.push(behaviorStress);
    }
    
    // Combine all stress indicators
    const overallStress = combineStressIndicators(analyses);
    
    return {
      emotionalState: determineEmotionalState(overallStress),
      stressLevel: overallStress.level,
      fraudRiskIndicators: overallStress.fraudIndicators,
      recommendations: generateEmotionalRecommendations(overallStress),
      confidence: overallStress.confidence,
      detailedAnalysis: {
        voice: inputData.voicePatterns ? analyzeVoiceStress(inputData.voicePatterns) : null,
        text: inputData.textSentiment ? analyzeTextSentiment(inputData.textSentiment) : null,
        behavior: inputData.interactionBehavior ? analyzeInteractionStress(inputData.interactionBehavior) : null
      }
    };
  }
);

function analyzeVoiceStress(voice: {
  pitch: number[];
  speed: number[];
  volume: number[];
  pauseDuration: number[];
}) {
  // Analyze pitch variations (higher pitch often indicates stress)
  const avgPitch = voice.pitch.reduce((a, b) => a + b, 0) / voice.pitch.length;
  const pitchVariance = calculateVariance(voice.pitch);
  const pitchStress = Math.min(1, (avgPitch - 100) / 200 + pitchVariance / 1000); // Normalized
  
  // Analyze speaking speed (too fast or too slow can indicate stress)
  const avgSpeed = voice.speed.reduce((a, b) => a + b, 0) / voice.speed.length;
  const normalSpeed = 150; // words per minute
  const speedDeviation = Math.abs(avgSpeed - normalSpeed) / normalSpeed;
  const speedStress = Math.min(1, speedDeviation);
  
  // Analyze volume patterns
  const avgVolume = voice.volume.reduce((a, b) => a + b, 0) / voice.volume.length;
  const volumeVariance = calculateVariance(voice.volume);
  const volumeStress = Math.min(1, volumeVariance / 100);
  
  // Analyze pause patterns (longer pauses might indicate hesitation/stress)
  const avgPause = voice.pauseDuration.reduce((a, b) => a + b, 0) / voice.pauseDuration.length;
  const normalPause = 500; // milliseconds
  const pauseStress = Math.min(1, Math.max(0, (avgPause - normalPause) / 1000));
  
  const overallVoiceStress = (pitchStress + speedStress + volumeStress + pauseStress) / 4;
  
  return {
    type: 'voice',
    stressLevel: overallVoiceStress,
    indicators: {
      pitchStress,
      speedStress,
      volumeStress,
      pauseStress
    },
    flags: [
      ...(pitchStress > 0.7 ? ['High pitch variation indicating stress'] : []),
      ...(speedStress > 0.7 ? ['Unusual speaking speed'] : []),
      ...(volumeStress > 0.7 ? ['Inconsistent volume levels'] : []),
      ...(pauseStress > 0.7 ? ['Extended hesitation pauses'] : [])
    ]
  };
}

function analyzeTextSentiment(text: {
  messages: string[];
  urgencyKeywords: string[];
  emotionalTone: string;
}) {
  // Analyze urgency keywords
  const urgencyWords = ['urgent', 'immediately', 'asap', 'emergency', 'quick', 'fast', 'now', 'hurry'];
  const urgencyCount = text.messages.reduce((count, message) => {
    return count + urgencyWords.filter(word => 
      message.toLowerCase().includes(word.toLowerCase())
    ).length;
  }, 0);
  
  const urgencyStress = Math.min(1, urgencyCount / 5); // Normalize to 0-1
  
  // Analyze emotional tone
  const stressfulTones = ['anxious', 'frustrated', 'angry', 'desperate', 'confused'];
  const toneStress = stressfulTones.includes(text.emotionalTone.toLowerCase()) ? 0.8 : 0.2;
  
  // Analyze message patterns
  const avgMessageLength = text.messages.reduce((sum, msg) => sum + msg.length, 0) / text.messages.length;
  const lengthStress = avgMessageLength < 20 ? 0.6 : avgMessageLength > 200 ? 0.7 : 0.2; // Very short or very long messages
  
  const overallTextStress = (urgencyStress + toneStress + lengthStress) / 3;
  
  return {
    type: 'text',
    stressLevel: overallTextStress,
    indicators: {
      urgencyStress,
      toneStress,
      lengthStress
    },
    flags: [
      ...(urgencyStress > 0.6 ? ['High urgency language detected'] : []),
      ...(toneStress > 0.6 ? ['Stressful emotional tone'] : []),
      ...(lengthStress > 0.6 ? ['Unusual message length patterns'] : [])
    ]
  };
}

function analyzeInteractionStress(behavior: {
  clickForce: number[];
  scrollSpeed: number[];
  hesitationTime: number[];
  errorRate: number;
}) {
  // Analyze click force (harder clicks might indicate stress/frustration)
  const avgClickForce = behavior.clickForce.reduce((a, b) => a + b, 0) / behavior.clickForce.length;
  const normalClickForce = 0.5;
  const forceStress = Math.min(1, Math.max(0, (avgClickForce - normalClickForce) / 0.5));
  
  // Analyze scroll speed (erratic scrolling might indicate stress)
  const scrollVariance = calculateVariance(behavior.scrollSpeed);
  const scrollStress = Math.min(1, scrollVariance / 1000);
  
  // Analyze hesitation time (longer hesitation might indicate uncertainty/stress)
  const avgHesitation = behavior.hesitationTime.reduce((a, b) => a + b, 0) / behavior.hesitationTime.length;
  const normalHesitation = 1000; // 1 second
  const hesitationStress = Math.min(1, Math.max(0, (avgHesitation - normalHesitation) / 2000));
  
  // Analyze error rate (more errors might indicate stress)
  const errorStress = Math.min(1, behavior.errorRate);
  
  const overallBehaviorStress = (forceStress + scrollStress + hesitationStress + errorStress) / 4;
  
  return {
    type: 'behavior',
    stressLevel: overallBehaviorStress,
    indicators: {
      forceStress,
      scrollStress,
      hesitationStress,
      errorStress
    },
    flags: [
      ...(forceStress > 0.7 ? ['Increased click force indicating frustration'] : []),
      ...(scrollStress > 0.7 ? ['Erratic scrolling patterns'] : []),
      ...(hesitationStress > 0.7 ? ['Extended hesitation before actions'] : []),
      ...(errorStress > 0.7 ? ['High error rate indicating stress'] : [])
    ]
  };
}

function combineStressIndicators(analyses: any[]) {
  if (analyses.length === 0) {
    return { level: 0, confidence: 0, fraudIndicators: [] };
  }
  
  const totalStress = analyses.reduce((sum, analysis) => sum + analysis.stressLevel, 0) / analyses.length;
  const allFlags = analyses.flatMap(analysis => analysis.flags);
  
  // Determine fraud risk based on stress patterns
  const fraudIndicators = [];
  if (totalStress > 0.8) {
    fraudIndicators.push('Extremely high stress levels detected');
  }
  if (totalStress > 0.6) {
    fraudIndicators.push('Elevated stress indicators present');
  }
  if (allFlags.length > 3) {
    fraudIndicators.push('Multiple stress indicators detected simultaneously');
  }
  
  return {
    level: totalStress,
    confidence: Math.min(1, analyses.length / 3), // Higher confidence with more data sources
    fraudIndicators,
    allFlags
  };
}

function determineEmotionalState(stress: any) {
  if (stress.level > 0.8) return 'Highly Stressed/Anxious';
  if (stress.level > 0.6) return 'Moderately Stressed';
  if (stress.level > 0.4) return 'Slightly Elevated Stress';
  if (stress.level > 0.2) return 'Calm with Minor Stress';
  return 'Calm and Composed';
}

function generateEmotionalRecommendations(stress: any) {
  const recommendations = [];
  
  if (stress.level > 0.8) {
    recommendations.push('High fraud risk - require immediate manual review');
    recommendations.push('Consider additional identity verification');
    recommendations.push('Monitor transaction closely');
  } else if (stress.level > 0.6) {
    recommendations.push('Elevated risk - consider additional verification steps');
    recommendations.push('Monitor for unusual transaction patterns');
  } else if (stress.level > 0.4) {
    recommendations.push('Slight concern - normal monitoring protocols');
  } else {
    recommendations.push('Low emotional risk - proceed normally');
  }
  
  if (stress.fraudIndicators.length > 0) {
    recommendations.push('Multiple stress indicators detected - investigate further');
  }
  
  return recommendations;
}

function calculateVariance(values: number[]) {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
}
