// examples/basic.js
import { ErlSystem } from '../src/system.js';

const system = new ErlSystem('my_node@localhost');


// Helper to add delays between messages
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Create the first process (Pinger)
const pingerPid = system.spawn(async (message) => {
  console.log(`[PINGER ${pingerPid}] Received:`, message);
  
  if (message.type === 'start') {
    console.log(`[PINGER ${pingerPid}] Starting conversation...`);
    await delay(100);
    system.send(message.from, { type: 'ping', count: 1, from: pingerPid });
  }
  else if (message.type === 'pong') {
    await delay(100);
    const newCount = message.count + 1;
    if (newCount <= 5) {
      console.log(`[PINGER ${pingerPid}] Sending ping ${newCount}`);
      system.send(message.from, { type: 'ping', count: newCount, from: pingerPid });
    } else {
      console.log(`[PINGER ${pingerPid}] Conversation complete!`);
    }
  }
});

// Create the second process (Ponger)
const pongerPid = system.spawn(async (message) => {
  console.log(`[PONGER ${pongerPid}] Received:`, message);
  
  if (message.type === 'ping') {
    await delay(100);
    console.log(`[PONGER ${pongerPid}] Sending pong ${message.count}`);
    system.send(message.from, { type: 'pong', count: message.count, from: pongerPid });
  }
});

// Register the processes with names
system.register('pinger', pingerPid);
system.register('ponger', pongerPid);

// Start the conversation
console.log('[SYSTEM] Starting message exchange...');
system.send(pingerPid, { 
  type: 'start',
  from: pongerPid 
});

// Keep the process alive to see all messages
await delay(2000);
console.log('[SYSTEM] Done');
