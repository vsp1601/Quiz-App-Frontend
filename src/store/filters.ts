import { create } from 'zustand';


type Filters = {
gender?: string;
category?: string;
setGender: (g?: string) => void;
setCategory: (c?: string) => void;
};


export const useFilters = create<Filters>((set) => ({
gender: undefined,
category: undefined,
setGender: (gender) => set({ gender }),
setCategory: (category) => set({ category })
}));