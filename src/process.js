import { EventEmitter } from 'node:events';

export class Process extends EventEmitter {
  constructor(behavior) {
    super();
    this.mailbox = [];
    this.behavior = behavior;
    this.isRunning = false;
    this.pid = Process.nextPid++;
  }

  static nextPid = 1;

  send(message) {
    this.mailbox.push(message);
    if (!this.isRunning) {
      this.processMessages();
    }
    return this.pid;
  }

  async processMessages() {
    this.isRunning = true;
    while (this.mailbox.length > 0) {
      const message = this.mailbox.shift();
      try {
        await this.behavior(message);
      } catch (error) {
        this.emit('error', error);
      }
    }
    this.isRunning = false;
  }

  exit(reason) {
    this.emit('exit', reason);
  }
}

