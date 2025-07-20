export class PID {
  constructor(node, id, serial, creation = 0) {
    this.node = node;      // Node identifier
    this.id = id;          // Process number
    this.serial = serial;  // Unique serial number
    this.creation = creation; // Creation counter
  }

  toString() {
    return `<${this.node}.${this.id}.${this.serial}>`; // Erlang-style format
  }

  toJSON() {
    return {
      node: this.node,
      id: this.id,
      serial: this.serial,
      creation: this.creation,
      toString: this.toString()
    };
  }
}