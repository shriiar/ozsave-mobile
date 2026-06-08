type Handler = () => void;

let handler: Handler | null = null;

export function fireScrollToTop(): void {
  handler?.();
}

export function registerScrollToTop(h: Handler): () => void {
  handler = h;
  return () => {
    if (handler === h) handler = null;
  };
}
