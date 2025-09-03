import { ai } from '@/ai/ai-instance';

// Behavioral Biometrics Analysis
export const behavioralBiometricsFlow = ai.defineFlow(
  'behavioralBiometrics',
  'Analyze unique behavioral patterns like typing rhythm, mouse movements, and touch pressure for fraud detection',
  async (inputData: {
    keystrokeDynamics: number[];
    mouseMovements: { x: number; y: number; timestamp: number }[];
    touchPressure: number[];
    interactionTiming: number[];
    deviceOrientation: { alpha: number; beta: number; gamma: number }[];
  }) => {
    // Analyze keystroke patterns
    const keystrokeProfile = analyzeKeystrokeDynamics(inputData.keystrokeDynamics);
    
    // Analyze mouse movement patterns
    const mouseProfile = analyzeMouseBehavior(inputData.mouseMovements);
    
    // Analyze touch pressure patterns (for mobile)
    const touchProfile = analyzeTouchPressure(inputData.touchPressure);
    
    // Analyze interaction timing
    const timingProfile = analyzeInteractionTiming(inputData.interactionTiming);
    
    // Analyze device orientation patterns
    const orientationProfile = analyzeDeviceOrientation(inputData.deviceOrientation);
    
    // Calculate composite biometric score
    const biometricScore = calculateBiometricScore({
      keystroke: keystrokeProfile.score,
      mouse: mouseProfile.score,
      touch: touchProfile.score,
      timing: timingProfile.score,
      orientation: orientationProfile.score
    });
    
    return {
      biometricScore,
      riskLevel: biometricScore > 0.8 ? 'low' : biometricScore > 0.5 ? 'medium' : 'high',
      anomalies: [
        ...keystrokeProfile.anomalies,
        ...mouseProfile.anomalies,
        ...touchProfile.anomalies,
        ...timingProfile.anomalies,
        ...orientationProfile.anomalies
      ],
      profiles: {
        keystroke: keystrokeProfile,
        mouse: mouseProfile,
        touch: touchProfile,
        timing: timingProfile,
        orientation: orientationProfile
      },
      confidence: calculateConfidence(biometricScore),
      recommendations: generateRecommendations(biometricScore)
    };
  }
);

// Helper functions for behavioral analysis
function analyzeKeystrokeDynamics(keystrokes: number[]) {
  const avgDwellTime = keystrokes.reduce((a, b) => a + b, 0) / keystrokes.length;
  const variance = keystrokes.reduce((sum, time) => sum + Math.pow(time - avgDwellTime, 2), 0) / keystrokes.length;
  
  // Known user pattern simulation
  const knownPattern = { avgDwell: 120, variance: 25 };
  const deviation = Math.abs(avgDwellTime - knownPattern.avgDwell) / knownPattern.avgDwell;
  
  return {
    score: Math.max(0, 1 - deviation),
    avgDwellTime,
    variance,
    anomalies: deviation > 0.3 ? ['Unusual typing rhythm detected'] : []
  };
}

function analyzeMouseBehavior(movements: { x: number; y: number; timestamp: number }[]) {
  if (movements.length < 2) {
    return { score: 0.5, velocity: 0, acceleration: 0, anomalies: ['Insufficient mouse data'] };
  }
  
  // Calculate velocity and acceleration patterns
  const velocities = movements.slice(1).map((point, i) => {
    const prev = movements[i];
    const distance = Math.sqrt(Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2));
    const time = point.timestamp - prev.timestamp;
    return time > 0 ? distance / time : 0;
  });
  
  const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
  
  // Simulate known user pattern
  const knownVelocity = 150; // pixels per ms
  const velocityDeviation = Math.abs(avgVelocity - knownVelocity) / knownVelocity;
  
  return {
    score: Math.max(0, 1 - velocityDeviation),
    velocity: avgVelocity,
    acceleration: 0, // Simplified for demo
    anomalies: velocityDeviation > 0.5 ? ['Unusual mouse movement pattern'] : []
  };
}

function analyzeTouchPressure(pressures: number[]) {
  if (pressures.length === 0) {
    return { score: 1, avgPressure: 0, anomalies: [] }; // No touch data, assume desktop
  }
  
  const avgPressure = pressures.reduce((a, b) => a + b, 0) / pressures.length;
  const knownPressure = 0.7; // Typical pressure
  const deviation = Math.abs(avgPressure - knownPressure) / knownPressure;
  
  return {
    score: Math.max(0, 1 - deviation),
    avgPressure,
    anomalies: deviation > 0.4 ? ['Unusual touch pressure pattern'] : []
  };
}

function analyzeInteractionTiming(timings: number[]) {
  const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;
  const knownTiming = 2000; // 2 seconds between interactions
  const deviation = Math.abs(avgTiming - knownTiming) / knownTiming;
  
  return {
    score: Math.max(0, 1 - deviation),
    avgTiming,
    anomalies: deviation > 0.6 ? ['Unusual interaction timing'] : []
  };
}

function analyzeDeviceOrientation(orientations: { alpha: number; beta: number; gamma: number }[]) {
  if (orientations.length === 0) {
    return { score: 1, stability: 1, anomalies: [] }; // No orientation data, assume desktop
  }
  
  // Calculate orientation stability
  const alphaVariance = calculateVariance(orientations.map(o => o.alpha));
  const betaVariance = calculateVariance(orientations.map(o => o.beta));
  const gammaVariance = calculateVariance(orientations.map(o => o.gamma));
  
  const avgVariance = (alphaVariance + betaVariance + gammaVariance) / 3;
  const stability = Math.max(0, 1 - avgVariance / 100); // Normalize variance
  
  return {
    score: stability,
    stability,
    anomalies: stability < 0.5 ? ['Unusual device orientation pattern'] : []
  };
}

function calculateVariance(values: number[]) {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
}

function calculateBiometricScore(scores: {
  keystroke: number;
  mouse: number;
  touch: number;
  timing: number;
  orientation: number;
}) {
  // Weighted average of different biometric factors
  const weights = {
    keystroke: 0.3,
    mouse: 0.25,
    touch: 0.2,
    timing: 0.15,
    orientation: 0.1
  };
  
  return (
    scores.keystroke * weights.keystroke +
    scores.mouse * weights.mouse +
    scores.touch * weights.touch +
    scores.timing * weights.timing +
    scores.orientation * weights.orientation
  );
}

function calculateConfidence(score: number) {
  return Math.min(1, score + 0.1); // Slightly higher confidence than raw score
}

function generateRecommendations(score: number) {
  if (score > 0.8) {
    return ['User behavior matches known patterns', 'Continue with normal flow'];
  } else if (score > 0.5) {
    return ['Some behavioral anomalies detected', 'Consider additional verification'];
  } else {
    return ['Significant behavioral anomalies detected', 'Require strong authentication', 'Flag for manual review'];
  }
}
