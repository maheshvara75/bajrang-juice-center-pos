
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  ShoppingCart, Plus, Minus, X, Check, Printer, Smartphone, 
  Banknote, History as HistoryIcon, Sliders, Bluetooth, 
  ChevronRight, LayoutDashboard, TrendingUp, Calendar, 
  CreditCard, Download, FileText, PieChart as PieIcon, List, 
  Edit2, Trash2 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';

/** --- TYPES --- **/
type Category = 'JUICES' | 'SHAKES' | 'SMOOTHIES' | 'ADD-ONS' | 'COMBOS';
interface Product { id: string; name: string; price: number; category: Category; color: string; }
interface CartItem extends Product { quantity: number; }
type PaymentMethod = 'CASH' | 'UPI' | 'CARD';
interface SaleRecord { id: string; billNo: string; items: CartItem[]; subtotal: number; gst: number; total: number; paymentMethod: PaymentMethod; timestamp: number; }
interface PrinterConfig { type: 'BLUETOOTH' | 'SYSTEM'; paperWidth: '58mm' | '80mm'; }

/** --- CONSTANTS --- **/
const CATEGORIES: Category[] = ['JUICES', 'SHAKES', 'SMOOTHIES', 'ADD-ONS', 'COMBOS'];
const STORE_DETAILS = { 
  name: 'BAJRANG JUICE CENTER', 
  tagline: 'Fresh Juice & Thick Shakes', 
  address: 'Jamnagar, Gujarat', 
  gstin: '24XXXXX1234A1Z1', 
  gstRate: 0.05 
};
const INITIAL_PRODUCTS: Product[] = [
  { id: 'j1', name: 'Mango Juice', price: 80, category: 'JUICES', color: 'bg-orange-100 border-orange-200 text-orange-800' },
  { id: 'j2', name: 'Orange Juice', price: 70, category: 'JUICES', color: 'bg-orange-50 border-orange-100 text-orange-700' },
  { id: 'j3', name: 'Watermelon Juice', price: 60, category: 'JUICES', color: 'bg-red-50 border-red-100 text-red-700' },
  { id: 's1', name: 'Strawberry Shake', price: 120, category: 'SHAKES', color: 'bg-pink-100 border-pink-200 text-pink-800' },
  { id: 's2', name: 'Chocolate Shake', price: 130, category: 'SHAKES', color: 'bg-amber-100 border-amber-200 text-amber-900' },
  { id: 'a1', name: 'Extra Scoop', price: 30, category: 'ADD-ONS', color: 'bg-blue-50 border-blue-100 text-blue-700' },
  { id: 'c1', name: 'Duo Pack', price: 130, category: 'COMBOS', color: 'bg-indigo-100 border-indigo-200 text-indigo-800' },
];

/** --- PRINTER SERVICE --- **/
class PrinterService {
  private characteristic: any = null;
  async connect(): Promise<boolean> {
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristics = await service?.getCharacteristics();
      this.characteristic = characteristics?.find((c: any) => c.properties.write) || null;
      return !!this.characteristic;
    } catch (e) { return false; }
  }
  isConnected(): boolean { return !!this.characteristic; }
}
const printerService = new PrinterService();

/** --- COMPONENTS --- **/
const Receipt: React.FC<{ sale: SaleRecord; id?: string }> = ({ sale, id }) => (
  <div id={id} className="bg-white p-6 font-mono text-[10px] w-[80mm] mx-auto text-black border border-gray-200 shadow-sm">
    <div className="text-center mb-4">
      <h1 className="font-bold text-sm uppercase">{STORE_DETAILS.name}</h1>
      <p>{STORE_DETAILS.tagline}</p>
      <p className="text-[8px]">{STORE_DETAILS.address}</p>
    </div>
    <div className="border-t border-dashed border-gray-400 my-2"></div>
    <div className="flex justify-between"><span>Bill: {sale.billNo}</span><span>{new Date(sale.timestamp).toLocaleDateString()}</span></div>
    <div className="border-t border-dashed border-gray-400 my-2"></div>
    {sale.items.map(item => (
      <div key={item.id} className="flex justify-between py-1">
        <span>{item.name} x{item.quantity}</span>
        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
      </div>
    ))}
    <div className="border-t border-dashed border-gray-400 my-2"></div>
    <div className="flex justify-between font-bold text-xs pt-1"><span>TOTAL</span><span>₹{sale.total.toFixed(2)}</span></div>
    <div className="text-center mt-6 uppercase font-bold">Payment: {sale.paymentMethod}</div>
    <div className="text-center mt-2">THANK YOU 😊</div>
  </div>
);

const Reports: React.FC<{ sales: SaleRecord[]; onClear: () => void }> = ({ sales, onClear }) => {
  const stats = useMemo(() => {
    const revenue = sales.reduce((a, s) => a + s.total, 0);
    const cash = sales.filter(s => s.paymentMethod === 'CASH').reduce((a, s) => a + s.total, 0);
    const upi = sales.filter(s => s.paymentMethod === 'UPI').reduce((a, s) => a + s.total, 0);
    return { revenue, count: sales.length, cash, upi };
  }, [sales]);

  const chartData = useMemo(() => {
    const items: Record<string, number> = {};
    sales.forEach(s => s.items.forEach(i => { items[i.name] = (items[i.name] || 0) + i.quantity; }));
    return Object.entries(items).map(([name, value]) => ({ name, value })).slice(0, 5);
  }, [sales]);

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black">Daily Performance</h1>
        <button onClick={() => { if(confirm("Clear history?")) onClear(); }} className="text-red-500 font-bold flex items-center gap-2"><Trash2 size={18}/> RESET</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <p className="text-xs font-bold text-gray-400 uppercase">Gross Revenue</p>
           <h2 className="text-3xl font-black text-gray-900">₹{stats.revenue.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <p className="text-xs font-bold text-gray-400 uppercase">Cash Collected</p>
           <h2 className="text-3xl font-black text-green-600">₹{stats.cash.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <p className="text-xs font-bold text-gray-400 uppercase">UPI Earnings</p>
           <h2 className="text-3xl font-black text-blue-600">₹{stats.upi.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <p className="text-xs font-bold text-gray-400 uppercase">Total Bills</p>
           <h2 className="text-3xl font-black text-orange-600">{stats.count}</h2>
        </div>
      </div>
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-80">
        <h3 className="font-bold mb-6 flex items-center gap-2"><PieIcon size={18}/> Top Selling Products</h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10}/>
            <Tooltip cursor={{fill: 'transparent'}} />
            <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/** --- APP --- **/
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'POS' | 'REPORTS'>('POS');
  const [activeCategory, setActiveCategory] = useState<Category>('JUICES');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [currentSale, setCurrentSale] = useState<SaleRecord | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bjc_pos_sales');
    if (saved) setSales(JSON.parse(saved));
  }, []);

  const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0) * 1.05;

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
    if (window.navigator.vibrate) window.navigator.vibrate(5);
  };

  const handleCheckout = (method: PaymentMethod) => {
    const newSale: SaleRecord = {
      id: Date.now().toString(),
      billNo: (1000 + sales.length + 1).toString(),
      items: [...cart],
      subtotal: total / 1.05,
      gst: total - (total / 1.05),
      total,
      paymentMethod: method,
      timestamp: Date.now()
    };
    const newSales = [...sales, newSale];
    setSales(newSales);
    localStorage.setItem('bjc_pos_sales', JSON.stringify(newSales));
    setCurrentSale(newSale);
    setCart([]);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <div className="w-20 bg-gray-950 flex flex-col items-center py-8 gap-8 border-r border-gray-800">
        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg"><LayoutDashboard size={24}/></div>
        <button onClick={() => setActiveTab('POS')} className={`p-4 rounded-2xl transition-all ${activeTab === 'POS' ? 'bg-orange-500 text-white shadow-xl shadow-orange-900/20' : 'text-gray-500 hover:text-gray-300'}`}><ShoppingCart size={24}/></button>
        <button onClick={() => setActiveTab('REPORTS')} className={`p-4 rounded-2xl transition-all ${activeTab === 'REPORTS' ? 'bg-orange-500 text-white shadow-xl shadow-orange-900/20' : 'text-gray-500 hover:text-gray-300'}`}><HistoryIcon size={24}/></button>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeTab === 'POS' ? (
          <div className="flex h-full flex-col lg:flex-row">
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-4 bg-white border-b border-gray-100 flex gap-2 overflow-x-auto hide-scrollbar sticky top-0 z-10">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setActiveCategory(c)} className={`px-8 py-3 rounded-2xl text-[10px] font-black tracking-wider transition-all whitespace-nowrap active-scale ${activeCategory === c ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-gray-100 text-gray-500'}`}>{c}</button>
                ))}
              </div>
              <div className="flex-1 p-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto">
                {INITIAL_PRODUCTS.filter(p => p.category === activeCategory).map(p => {
                  const itemInCart = cart.find(i => i.id === p.id);
                  return (
                    <button key={p.id} onClick={() => addToCart(p)} className={`p-5 rounded-[32px] border-2 h-40 flex flex-col justify-between text-left active-scale transition-all relative ${p.color} shadow-sm hover:shadow-md`}>
                      <span className="font-black text-lg leading-tight">{p.name}</span>
                      <span className="font-black text-sm opacity-80">₹{p.price}</span>
                      {itemInCart && <div className="absolute top-4 right-4 bg-white text-orange-600 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-md animate-in zoom-in">{itemInCart.quantity}</div>}
                      <div className="absolute -bottom-2 -right-2 bg-black/5 p-4 rounded-full"><Plus size={32} /></div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="w-full lg:w-96 bg-white border-l border-gray-100 flex flex-col h-full shadow-2xl">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center"><h2 className="text-xl font-black text-gray-800">Basket</h2><button onClick={() => setCart([])} className="text-gray-400 hover:text-red-500"><X size={20}/></button></div>
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {cart.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                     <ShoppingCart size={48} />
                     <p className="font-bold text-sm">Cart is empty</p>
                   </div>
                ) : cart.map(i => (
                  <div key={i.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="flex-1 min-w-0 pr-2"><h4 className="font-bold text-gray-800 text-sm truncate">{i.name}</h4><p className="text-[10px] text-gray-400 font-bold">₹{i.price}</p></div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setCart(cart.map(item => item.id === i.id ? {...item, quantity: Math.max(0, item.quantity - 1)} : item).filter(it => it.quantity > 0))} className="p-1.5 bg-white border border-gray-200 rounded-xl shadow-sm active-scale"><Minus size={14}/></button>
                      <span className="font-black text-xs w-4 text-center">{i.quantity}</span>
                      <button onClick={() => addToCart(i)} className="p-1.5 bg-white border border-gray-200 rounded-xl shadow-sm active-scale"><Plus size={14}/></button>
                    </div>
                    <div className="w-16 text-right font-black text-sm ml-2 text-gray-900">₹{i.price * i.quantity}</div>
                  </div>
                ))}
              </div>
              <div className="p-8 border-t border-gray-50 bg-gray-50/30">
                <div className="flex justify-between text-3xl font-black mb-6 tracking-tight text-gray-900"><span>Total</span><span className="text-orange-600">₹{total.toFixed(0)}</span></div>
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => handleCheckout('UPI')} disabled={cart.length === 0} className="bg-blue-600 text-white py-5 rounded-3xl font-black text-xs disabled:opacity-50 active-scale shadow-lg shadow-blue-100">UPI / PHONEPE</button>
                   <button onClick={() => handleCheckout('CASH')} disabled={cart.length === 0} className="bg-green-600 text-white py-5 rounded-3xl font-black text-xs disabled:opacity-50 active-scale shadow-lg shadow-green-100">CASH PAY</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Reports sales={sales} onClear={() => { setSales([]); localStorage.removeItem('bjc_pos_sales'); }} />
        )}
      </div>

      {currentSale && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="max-w-[80mm] w-full animate-in zoom-in-95 duration-200">
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl p-2"><Receipt sale={currentSale} id="receipt-print-area"/></div>
              <div className="mt-6 flex flex-col gap-3">
                 <button onClick={() => window.print()} className="w-full bg-white text-black py-5 rounded-3xl font-black flex items-center justify-center gap-3 active-scale"><Printer size={20}/> REPRINT BILL</button>
                 <button onClick={() => setCurrentSale(null)} className="w-full bg-orange-500 text-white py-5 rounded-3xl font-black shadow-xl shadow-orange-500/20 active-scale">NEXT CUSTOMER</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
