
import { Product, Category } from './types';

export const CATEGORIES: Category[] = ['JUICES', 'SHAKES', 'SMOOTHIES', 'ADD-ONS', 'COMBOS'];

export const STORE_DETAILS = {
  name: 'BAJRANG JUICE CENTER',
  tagline: 'Fresh Juice & Thick Shakes',
  address: 'Jamnagar, Gujarat',
  gstin: '24XXXXX1234A1Z1',
  gstRate: 0.05
};

export const PRODUCTS: Product[] = [
  // Juices
  { id: 'j1', name: 'Mango Juice', price: 80, category: 'JUICES', color: 'bg-orange-100 border-orange-200 text-orange-800' },
  { id: 'j2', name: 'Orange Juice', price: 70, category: 'JUICES', color: 'bg-orange-50 border-orange-100 text-orange-700' },
  { id: 'j3', name: 'Watermelon Juice', price: 60, category: 'JUICES', color: 'bg-red-50 border-red-100 text-red-700' },
  { id: 'j4', name: 'Pineapple Juice', price: 70, category: 'JUICES', color: 'bg-yellow-50 border-yellow-100 text-yellow-700' },
  { id: 'j5', name: 'Mosambi Juice', price: 70, category: 'JUICES', color: 'bg-green-50 border-green-100 text-green-700' },
  
  // Shakes
  { id: 's1', name: 'Strawberry Shake', price: 120, category: 'SHAKES', color: 'bg-pink-100 border-pink-200 text-pink-800' },
  { id: 's2', name: 'Chocolate Shake', price: 130, category: 'SHAKES', color: 'bg-amber-100 border-amber-200 text-amber-900' },
  { id: 's3', name: 'Kaju Anjeer Shake', price: 160, category: 'SHAKES', color: 'bg-stone-100 border-stone-200 text-stone-800' },
  { id: 's4', name: 'Mango Shake', price: 110, category: 'SHAKES', color: 'bg-orange-100 border-orange-200 text-orange-800' },
  { id: 's5', name: 'Vanilla Shake', price: 100, category: 'SHAKES', color: 'bg-slate-50 border-slate-200 text-slate-800' },

  // Smoothies
  { id: 'sm1', name: 'Berry Blast', price: 150, category: 'SMOOTHIES', color: 'bg-purple-100 border-purple-200 text-purple-800' },
  { id: 'sm2', name: 'Green Detox', price: 140, category: 'SMOOTHIES', color: 'bg-emerald-100 border-emerald-200 text-emerald-800' },
  
  // Add-ons
  { id: 'a1', name: 'Extra Scoop Ice-cream', price: 30, category: 'ADD-ONS', color: 'bg-blue-50 border-blue-100 text-blue-700' },
  { id: 'a2', name: 'Dry Fruits', price: 20, category: 'ADD-ONS', color: 'bg-orange-50 border-orange-100 text-orange-700' },
  { id: 'a3', name: 'Chocolate Chips', price: 15, category: 'ADD-ONS', color: 'bg-brown-50 border-brown-100 text-brown-700' },

  // Combos
  { id: 'c1', name: 'Duo Pack (2 Juices)', price: 130, category: 'COMBOS', color: 'bg-indigo-100 border-indigo-200 text-indigo-800' },
];
