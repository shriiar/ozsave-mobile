type TransitionRequest = {
  apply: () => void; // actually writes the new theme to state + storage
};

type Handler = (req: TransitionRequest) => void;

let handler: Handler | null = null;

export function fireThemeTransition(req: TransitionRequest): boolean {
  if (handler) {
    handler(req);
    return true;
  }
  return false;
}

export function registerThemeTransitionHandler(h: Handler): () => void {
  handler = h;
  return () => {
    if (handler === h) handler = null;
  };
}
