import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  animations: boolean;
  setAnimations: (val: boolean) => void;
  fontSize: 'normal' | 'large';
  setFontSize: (val: 'normal' | 'large') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      animations: true,
      setAnimations: (val) => {
        set({ animations: val });
        if (!val) {
          document.documentElement.classList.add("disable-animations");
        } else {
          document.documentElement.classList.remove("disable-animations");
        }
      },
      fontSize: 'normal',
      setFontSize: (val) => {
        set({ fontSize: val });
        if (val === "large") {
          document.documentElement.style.fontSize = "17px";
        } else {
          document.documentElement.style.fontSize = "16px";
        }
      },
    }),
    {
      name: 'ui-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.animations) {
            document.documentElement.classList.add("disable-animations");
          }
          if (state.fontSize === "large") {
            document.documentElement.style.fontSize = "17px";
          }
        }
      },
    }
  )
);
