import { EventEmitter } from 'node:events';

export class Process extends EventEmitter {
    static nextId = 0;
    static nextSerial = 0;
    static creation = 0;
    static MAX_ID = 32767; // Same as Erlang

  constructor(behavior) {
    super();
    this.mailbox = [];
    this.behavior = behavior;
    this.isRunning = false;
    //this.pid = Process.nextPid++;
    this.pid = this.generatePid();

  }
  generatePid() {
    const pid = {
      node: 'local', // Default node name
      id: Process.nextId++,
      serial: Process.nextSerial,
      creation: Process.creation,
      // Add toString for better console output
      toString() {
        return `<${this.node}.${this.id}.${this.serial}>`;
      },
      // Add toJSON for serialization
      toJSON() {
        return {
          node: this.node,
          id: this.id,
          serial: this.serial,
          creation: this.creation
        };
      }
    };

    // Handle counter overflow like Erlang
    if (Process.nextId > Process.MAX_ID) {
      Process.nextId = 0;
      Process.nextSerial++;
    }

    // Handle serial overflow
    if (Process.nextSerial > Process.MAX_ID) {
      Process.nextSerial = 0;
      Process.creation++;
    }

    return pid;
  }



//   static nextPid = 1;

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

