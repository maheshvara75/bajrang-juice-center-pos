
export type Category = 'JUICES' | 'SHAKES' | 'SMOOTHIES' | 'ADD-ONS' | 'COMBOS';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  color: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD';

export interface SaleRecord {
  id: string;
  billNo: string;
  items: CartItem[];
  subtotal: number;
  gst: number;
  total: number;
  paymentMethod: PaymentMethod;
  timestamp: number;
}

export interface ItemSummary {
  name: string;
  quantity: number;
  revenue: number;
}

export interface PrinterConfig {
  type: 'BLUETOOTH' | 'SYSTEM';
  paperWidth: '58mm' | '80mm';
}
