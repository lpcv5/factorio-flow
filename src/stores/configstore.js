import { create } from "zustand";

const useConfigStore = create((set, get) => ({
  timeunit: "u/s",

  setTimeUnit: (timeunit) => set({ timeunit }),
}));

export default useConfigStore;
