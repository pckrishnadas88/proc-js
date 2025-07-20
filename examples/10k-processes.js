import { ErlSystem } from '../src/system.js';
import { performance } from 'node:perf_hooks';

// Configuration
const TOTAL_PROCESSES = 1000; // Start smaller for testing
const REPORT_INTERVAL = 2000;
const WORKER_TIMEOUT = 30_000;

class Benchmark {
  constructor() {
    this.system = new ErlSystem('benchmark@localhost');
    this.messagesProcessed = 0;
    this.workerPids = [];
    this.startTime = 0;
  }

  async run() {
    console.log(`[System] Starting ${TOTAL_PROCESSES} workers...`);
    this.startTime = performance.now();

    // 1. Create workers and store their PIDs
    for (let i = 0; i < TOTAL_PROCESSES; i++) {
      const pid = this.system.spawn((msg) => this.workerBehavior(msg));
      this.workerPids.push(pid);
      
      if (i % 500 === 0) {
        await new Promise(resolve => setImmediate(resolve));
        console.log(`Created ${i} workers...`);
      }
    }

    // 2. Start message flood
    console.log(`[System] Beginning workload...`);
    this.startWorkload();
    this.startReporting();
  }

  workerBehavior(message) {
    if (message?.type === 'work') {
      this.messagesProcessed++;
      // Simulate work (0-1ms delay)
      return new Promise(resolve => 
        setTimeout(resolve, Math.random()));
    }
  }

  startWorkload() {
    this.workInterval = setInterval(() => {
      // Send to random workers
      for (let i = 0; i < 100; i++) {
        const randomPid = this.workerPids[
          Math.floor(Math.random() * this.workerPids.length)
        ];
        this.system.send(randomPid, { type: 'work' });
      }
    }, 10); // 100 messages every 10ms = ~10K msg/s
  }

  startReporting() {
    this.reportInterval = setInterval(() => {
      const elapsed = (performance.now() - this.startTime) / 1000;
      const rate = (this.messagesProcessed / elapsed).toFixed(2);
      
      console.log(`
=== STATS ===
Workers:   ${this.workerPids.length}
Messages:  ${this.messagesProcessed}
Runtime:   ${elapsed.toFixed(2)}s
Rate:      ${rate} msg/s
================
      `);
    }, REPORT_INTERVAL);

    setTimeout(() => {
      clearInterval(this.workInterval);
      clearInterval(this.reportInterval);
      console.log('Benchmark completed');
      process.exit(0);
    }, WORKER_TIMEOUT);
  }
}

// Run with error handling
new Benchmark().run().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});