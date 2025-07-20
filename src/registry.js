export class ProcessRegistry {
  constructor() {
    this.processes = new Map();
    this.names = new Map();
  }

  register(name, process) {
    if (this.names.has(name)) {
      throw new Error(`Name ${name} already registered`);
    }
    this.names.set(name, process.pid);
    this.processes.set(process.pid, process);
    
    process.on('exit', () => {
      this.unregister(process.pid);
    });
    
    return process.pid;
  }

  unregister(pidOrName) {
    if (typeof pidOrName === 'string') {
      const pid = this.names.get(pidOrName);
      if (pid) {
        this.names.delete(pidOrName);
        this.processes.delete(pid);
      }
    } else {
      this.processes.delete(pidOrName);
      // Clean up name references
      for (const [name, pid] of this.names.entries()) {
        if (pid === pidOrName) {
          this.names.delete(name);
          break;
        }
      }
    }
  }

  whereis(name) {
    const pid = this.names.get(name);
    return pid ? this.processes.get(pid) : undefined;
  }

  get(pid) {
    return this.processes.get(pid);
  }

  send(pidOrName, message) {
    const process = typeof pidOrName === 'string' 
      ? this.whereis(pidOrName)
      : this.processes.get(pidOrName);
    
    if (process) {
      return process.send(message);
    }
    return null;
  }
}
