type Handler = () => void;

// Keyed by route path — each tab screen registers its own handler here.
// A single shared variable would let whichever screen mounts (or remounts)
// last silently steal every other screen's scroll-to-top, since NativeTabs
// keeps every tab mounted at once.
const handlers = new Map<string, Handler>();

export function fireScrollToTop(key: string): void {
  handlers.get(key)?.();
}

export function registerScrollToTop(key: string, h: Handler): () => void {
  handlers.set(key, h);
  return () => {
    if (handlers.get(key) === h) handlers.delete(key);
  };
}
