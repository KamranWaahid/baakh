export function toError(x: unknown): Error {
  if (x instanceof Error) {
    return x;
  }
  
  // Handle Event objects specially
  if (x && typeof x === 'object' && x instanceof Event) {
    return new Error(`Event: ${x.type} (${x.constructor.name})`);
  }
  
  if (x && typeof x === 'object') {
    const anyX = x as Record<string, unknown>;
    const reason = anyX.reason ?? anyX.error;
    if (reason instanceof Error) {
      return reason;
    }
    
    // Handle Event objects in nested properties
    if (reason && typeof reason === 'object' && reason instanceof Event) {
      return new Error(`Event: ${reason.type} (${reason.constructor.name})`);
    }
    
    const messageFromX = typeof anyX.message === 'string' ? anyX.message : undefined;
    const messageFromReason = typeof (reason as any)?.message === 'string' ? (reason as any).message : undefined;
    
    // Try to get a meaningful message before falling back to stringify
    let message = messageFromX || messageFromReason;
    
    if (!message) {
      // For objects that might be Events or have circular references, try safer approaches
      if (anyX.type && typeof anyX.type === 'string') {
        message = `Event: ${anyX.type}`;
      } else if (anyX.constructor && anyX.constructor.name) {
        message = `${anyX.constructor.name} object`;
      } else {
        message = safeStringify(anyX) || String(anyX);
      }
    }
    
    return new Error(message);
  }
  return new Error(String(x));
}

function safeStringify(value: unknown): string | undefined {
  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
}



