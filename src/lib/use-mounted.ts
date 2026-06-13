import { useSyncExternalStore } from "react";

// Returns true only after hydration on the client. Used to guard browser-only
// rendering (theme toggle, charts) without triggering the set-state-in-effect
// lint rule. useSyncExternalStore gives a stable server snapshot (false) and a
// client snapshot (true) with no effect needed.
const emptySubscribe = () => () => {};

export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client
    () => false, // server
  );
}
