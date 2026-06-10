// utils/eventBus.ts
type Handler = (data?: unknown) => void;

class EventBus {
  private events: Record<string, Handler[]> = {};

  on(event: string, handler: Handler): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
    
    return () => {
      this.events[event] = this.events[event].filter(h => h !== handler);
    };
  }

  emit(event: string, data?: unknown): void {
    if (this.events[event]) {
      this.events[event].forEach(handler => handler(data));
    }
  }
}

export const eventBus = new EventBus();
