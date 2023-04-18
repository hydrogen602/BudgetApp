import { isRegistered, registerAll, unregister, register } from "@tauri-apps/api/globalShortcut";
import { useEffect, useRef } from "react";


export default function useShortcut(shortcut: string, callback: () => void) {
  // shortcuts act very different from react
  // so I'm using useRef to keep track of the current callback
  // and the registered callback looks to ref to get the latest callback
  const ref = useRef(callback);

  // keep ref.current pointing at the latest callback
  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  useEffect(() => {
    (async () => {
      if (await isRegistered(shortcut)) {
        await unregister(shortcut);
      }
      await register(shortcut, () => {
        ref.current();
      });
    })();

    return () => {
      (async () => {
        if (await isRegistered(shortcut)) {
          await unregister(shortcut);
        }
      })();
    };
  }, [shortcut]);
}