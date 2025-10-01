function isLikelyEvent(value: unknown): value is { type?: string; constructor?: { name?: string } } {
  if (!value || typeof value !== 'object') return false;
  const tag = Object.prototype.toString.call(value);
  if (tag === '[object Event]' || tag === '[object ErrorEvent]' || tag === '[object PromiseRejectionEvent]') return true;
  const maybe: any = value as any;
  if (typeof maybe.type === 'string' && typeof maybe.isTrusted === 'boolean') return true;
  const ctorName = String((maybe?.constructor && maybe.constructor.name) || '');
  return /Event$/i.test(ctorName) || /ErrorEvent$/i.test(ctorName) || /PromiseRejectionEvent$/i.test(ctorName);
}

export function toError(x: unknown): Error {
  if (x instanceof Error) {
    return x;
  }
  
  // Handle Event objects specially
  if (isLikelyEvent(x)) {
    const anyX: any = x as any;
    const type = typeof anyX?.type === 'string' ? anyX.type : 'Event';
    const ctor = String(anyX?.constructor?.name || 'Event');
    return new Error(`Event: ${type} (${ctor})`);
  }
  
  if (x && typeof x === 'object') {
    const anyX = x as Record<string, unknown>;
    const reason = anyX.reason ?? anyX.error;
    if (reason instanceof Error) {
      return reason;
    }
    
    // Handle Event objects in nested properties
    if (isLikelyEvent(reason)) {
      const r: any = reason as any;
      const type = typeof r?.type === 'string' ? r.type : 'Event';
      const ctor = String(r?.constructor?.name || 'Event');
      return new Error(`Event: ${type} (${ctor})`);
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



