const { setTimeout } = require('timers/promises');

class Supervisor {
  constructor(system, strategy = 'one-for-one') {
    this.system = system;
    this.strategy = strategy;
    this.children = [];
    this.restartCount = 0;
    this.lastRestart = Date.now();
  }

  addChild(spec) {
    this.children.push(spec);
  }

  async start() {
    for (const child of this.children) {
      await this.startChild(child);
    }
  }

  async startChild({ name, start, restart = 'permanent' }) {
    try {
      const pid = start();
      if (name) this.system.register(name, pid);
      return { status: 'ok', pid };
    } catch (error) {
      if (restart === 'permanent') {
        await this.handleFailure();
      }
      return { status: 'error', error };
    }
  }

  async handleFailure() {
    this.restartCount++;
    const now = Date.now();
    
    // Implement different strategies
    switch (this.strategy) {
      case 'one-for-one':
        // Restart just the failed child
        break;
      case 'one-for-all':
        // Restart all children
        break;
      case 'rest-for-one':
        // Restart the failed child and those started after it
        break;
    }
    
    // Implement restart intensity
    if (now - this.lastRestart < 5000) {
      if (this.restartCount > 5) {
        // Give up after too many failures
        process.exit(1);
      }
      await setTimeout(1000);
    } else {
      this.restartCount = 0;
    }
    
    this.lastRestart = now;
  }
}

module.exports = Supervisor;