// Demo Simulation Engine for Ghana Post Intelligence
// Gently fluctuates volumes, generates dynamic feed telemetry, and updates freshness without jarring jumps

class SimulationEngine {
  constructor() {
    this.subscribers = new Set();
    this.intervalId = null;
    this.isRunning = true;
    this.signalCount = 284710;
    this.nationalSentiment = -24.6;
    this.lastTickTime = new Date();
  }

  start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      if (!this.isRunning) return;
      this.tick();
    }, 4000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  toggleRunning() {
    this.isRunning = !this.isRunning;
    this.notify();
    return this.isRunning;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    const state = {
      isRunning: this.isRunning,
      signalCount: this.signalCount,
      nationalSentiment: Number(this.nationalSentiment.toFixed(1)),
      lastTickTime: this.lastTickTime,
      formattedTime: this.lastTickTime.toTimeString().split(' ')[0] + ' GMT'
    };
    this.subscribers.forEach(cb => cb(state));
  }

  tick() {
    // Controlled increments
    const countDelta = Math.floor(Math.random() * 8) + 2;
    this.signalCount += countDelta;

    // Subtle sentiment oscillation between -24.9 and -24.3
    const sentimentDrift = (Math.random() - 0.5) * 0.15;
    this.nationalSentiment = Math.max(-26, Math.min(-23, this.nationalSentiment + sentimentDrift));
    this.lastTickTime = new Date();

    this.notify();
  }
}

export const simulationEngine = new SimulationEngine();
simulationEngine.start();
