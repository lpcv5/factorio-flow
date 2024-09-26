import { create } from "zustand";
import data from '../assets/kr2sxp/data3.json';

export const UseDataStore = create(() => ({
    categories: data.categories,
    recipes: data.recipes,
    logistics: data.logistics,
    production: data.production,
    resources: data.resources,
    intermediateproducts: data.intermediateproducts,
    science: data.science,
    combat: data.combat,
    fluids: data.fluids,
    environment: data.environment,
    other: data.other,
}));