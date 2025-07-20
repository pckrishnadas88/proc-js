import { Process } from './process.js';
import { ProcessRegistry } from './registry.js';

export class ErlSystem {
  constructor() {
    this.registry = new ProcessRegistry();
  }

  spawn(behavior) {
    const process = new Process(behavior);
    this.registry.processes.set(process.pid, process);
    return process.pid;
  }

  spawnLink(behavior, parentPid) {
    const pid = this.spawn(behavior);
    const child = this.registry.get(pid);
    const parent = this.registry.get(parentPid);
    
    if (parent) {
      parent.on('exit', (reason) => child.exit(reason));
      child.on('exit', (reason) => parent.exit(reason));
    }
    
    return pid;
  }

  register(name, pid) {
    return this.registry.register(name, this.registry.get(pid));
  }

  send(pidOrName, message) {
    return this.registry.send(pidOrName, message);
  }

  whereis(name) {
    return this.registry.whereis(name);
  }
}
