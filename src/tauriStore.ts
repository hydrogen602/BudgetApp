import { invoke } from "@tauri-apps/api";
import { useId, useSyncExternalStore } from "react";



const tauriStateStorage: { [key: string]: TauriStore<any> } = {}


export class TauriStore<T> {
  cachedSnapshot: T
  listeners: Array<() => void> = [];
  constructor(default_val: T) {
    this.cachedSnapshot = default_val;
  }

  setState(nextState: ((state: T) => T) | T) {
    if (typeof nextState === 'function') {
      nextState = (nextState as (state: T) => T)(this.cachedSnapshot);
    }

    invoke('set_increment', { newState: nextState }).then(new_state => {
      this.cachedSnapshot = new_state as T;
      this.emitChange();
    });
  }

  fetchState() {
    invoke('get_increment').then(new_state => {
      this.cachedSnapshot = new_state as T;
      this.emitChange();
    });
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getSnapshot() {
    return this.cachedSnapshot;
  }

  emitChange() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export function useTauriState<T>(default_val: T): [T, (nextState: ((state: T) => T) | T) => void] {
  const stateID = useId();
  const maybeStore = tauriStateStorage[stateID];

  const newStore = () => {
    const store = new TauriStore<T>(default_val);
    tauriStateStorage[stateID] = store;
    return store;
  }

  const store = (maybeStore === undefined) ? newStore() : maybeStore;

  const data = useSyncExternalStore(store.subscribe.bind(store), store.getSnapshot.bind(store));

  return [data, store.setState.bind(store)];
}

export default TauriStore;