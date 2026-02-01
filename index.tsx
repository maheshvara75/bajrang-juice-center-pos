
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ShoppingCart, Plus, Minus, X, Check, Printer, 
  History as HistoryIcon, ChevronRight, LayoutDashboard, 
  TrendingUp, Download, List, Edit2, Trash2, 
  Settings as SettingsIcon, ArrowLeft, FolderPlus, RefreshCcw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';

/** --- TYPES --- **/
interface Product { 
  id: string; 
  name: string; 
  price: number; 
  category: string; 
  color: string; 
}
interface CartItem extends Product { 
  quantity: number; 
}
type PaymentMethod = 'CASH' | 'UPI' | 'CARD';
interface SaleRecord { 
  id: string; 
  billNo: string; 
  items: CartItem[]; 
  subtotal: number; 
  gst: number; 
  total: number; 
  paymentMethod: PaymentMethod; 
  timestamp: number; 
}
interface ItemSummary { 
  name: string; 
  quantity: number; 
  revenue: number; 
}

/** --- CONSTANTS & DEFAULTS --- **/
const STORAGE_KEYS = {
  SALES: 'bjc_v4_sales',
  PRODUCTS: 'bjc_v4_products',
  CATEGORIES: 'bjc_v4_categories'
};

const DEFAULT_CATEGORIES = ['JUICES', 'SHAKES', 'SMOOTHIES', 'ADD-ONS'];
const STORE_DETAILS = { 
  name: 'BAJRANG JUICE CENTER', 
  tagline: 'Fresh Juice & Thick Shakes', 
  address: 'Jamnagar, Gujarat', 
  gstin: '24XXXXX1234A1Z1', 
  gstRate: 0.05 
};

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Mango Juice', price: 80, category: 'JUICES', color: 'bg-orange-100 border-orange-200 text-orange-800' },
  { id: '2', name: 'Strawberry Shake', price: 120, category: 'SHAKES', color: 'bg-pink-100 border-pink-200 text-pink-800' },
  { id: '3', name: 'Berry Smoothie', price: 150, category: 'SMOOTHIES', color: 'bg-purple-100 border-purple-200 text-purple-800' },
  { id: '4', name: 'Extra Scoop', price: 30, category: 'ADD-ONS', color: 'bg-blue-50 border-blue-100 text-blue-700' },
];

/** --- UTILS --- **/
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage write error:', e);
  }
};

const getFromStorage = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

/** --- COMPONENTS --- **/
const Receipt: React.FC<{ sale: SaleRecord; id?: string }> = ({ sale, id }) => {
  const dateStr = new Date(sale.timestamp).toLocaleDateString();
  const timeStr = new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div id={id} className="bg-white p-6 font-mono text-[11px] w-full max-w-[80mm] mx-auto text-black border border-gray-100 shadow-sm print:shadow-none print:border-0">
      <div className="text-center mb-4">
        <h1 className="font-black text-lg uppercase tracking-tighter leading-none">{STORE_DETAILS.name}</h1>
        <p className="text-[10px] mt-1 uppercase tracking-widest">{STORE_DETAILS.tagline}</p>
        <p className="text-[9px] text-gray-500">{STORE_DETAILS.address}</p>
        <p className="text-[10px] font-bold mt-1">GSTIN: {STORE_DETAILS.gstin}</p>
      </div>
      <div className="border-t border-dashed border-gray-300 my-2"></div>
      <div className="flex justify-between text-[9px]">
        <span className="font-bold uppercase tracking-tight">Bill: #{sale.billNo}</span>
        <span>{dateStr} {timeStr}</span>
      </div>
      <div className="border-t border-dashed border-gray-300 my-2"></div>
      <div className="space-y-1">
        <div className="flex justify-between font-bold border-b border-gray-100 pb-1 mb-1 uppercase tracking-tighter">
          <span className="w-1/2">Item</span>
          <span className="w-1/4 text-center">Qty</span>
          <span className="w-1/4 text-right">Amt</span>
        </div>
        {sale.items.map(item => (
          <div key={item.id} className="flex justify-between py-0.5 text-[10px]">
            <span className="w-1/2 truncate pr-1 uppercase font-medium">{item.name}</span>
            <span className="w-1/4 text-center">{item.quantity}</span>
            <span className="w-1/4 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-dashed border-gray-300 mt-3 pt-2 space-y-1">
        <div className="flex justify-between"><span>Subtotal</span><span>₹{sale.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>GST (5%)</span><span>₹{sale.gst.toFixed(2)}</span></div>
        <div className="flex justify-between font-black text-sm pt-2 border-t border-gray-200">
          <span>GRAND TOTAL</span><span>₹{sale.total.toFixed(2)}</span>
        </div>
      </div>
      <div className="text-center mt-6 uppercase font-black bg-gray-50 py-1.5 rounded tracking-[0.2em] text-[9px]">
        Paid via {sale.paymentMethod}
      </div>
      <div className="text-center mt-4 space-y-1">
        <p className="font-bold uppercase tracking-widest">THANK YOU! 😊</p>
        <p className="text-[9px] text-gray-500 italic">Freshness in every drop</p>
      </div>
    </div>
  );
};

const ReportsView: React.FC<{ sales: SaleRecord[]; onClear: () => void; onSelectSale: (s: SaleRecord) => void }> = ({ sales, onClear, onSelectSale }) => {
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((a, s) => a + s.total, 0);
    const totalGst = sales.reduce((a, s) => a + s.gst, 0);
    const methodCounts = sales.reduce((acc, s) => {
      acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.total;
      return acc;
    }, {} as Record<string, number>);
    return { revenue: totalRevenue, count: sales.length, gst: totalGst, methods: methodCounts };
  }, [sales]);

  const itemSummary = useMemo(() => {
    const items: Record<string, ItemSummary> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!items[item.id]) items[item.id] = { name: item.name, quantity: 0, revenue: 0 };
        items[item.id].quantity += item.quantity;
        items[item.id].revenue += (item.price * item.quantity);
      });
    });
    return Object.values(items).sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto bg-gray-50 pb-32 lg:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Business Insights</p>
        </div>
        <button onClick={() => { if(confirm("Clear transaction records?")) onClear(); }} className="bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-100 flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95">
          <Trash2 size={16}/> RESET DATA
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm text-center lg:text-left">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gross Sales</p>
          <h2 className="text-lg md:text-2xl font-black text-gray-900">₹{stats.revenue.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm text-center lg:text-left">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
          <h2 className="text-lg md:text-2xl font-black text-gray-900">{stats.count}</h2>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm text-green-600 text-center lg:text-left">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cash Collection</p>
          <h2 className="text-lg md:text-2xl font-black">₹{(stats.methods['CASH'] || 0).toLocaleString()}</h2>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm text-blue-600 text-center lg:text-left">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">GST Collected</p>
          <h2 className="text-lg md:text-2xl font-black">₹{stats.gst.toLocaleString()}</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-black mb-4 flex items-center gap-2 text-sm md:text-base uppercase tracking-tight"><List size={18} className="text-orange-500"/> Item Wise Split</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] md:text-xs">
              <thead className="text-gray-400 font-black uppercase border-b bg-gray-50"><tr className="border-b"><th className="py-3 px-3">Name</th><th className="py-3 text-center px-3">Qty</th><th className="py-3 text-right px-3">Revenue</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {itemSummary.map(item => (
                  <tr key={item.name} className="hover:bg-gray-50 transition-colors"><td className="py-3 px-3 font-semibold uppercase">{item.name}</td><td className="py-3 text-center px-3 font-bold">{item.quantity}</td><td className="py-3 text-right px-3 font-black">₹{item.revenue.toFixed(0)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-black mb-4 flex items-center gap-2 text-sm md:text-base uppercase tracking-tight"><HistoryIcon size={18} className="text-blue-500"/> Recent Logs</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
            {sales.slice().reverse().map(sale => (
              <button key={sale.id} onClick={() => onSelectSale(sale)} className="w-full flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl hover:bg-gray-100 transition-all active-scale border border-transparent hover:border-gray-200">
                <div className="text-left"><p className="font-black text-sm">₹{sale.total.toFixed(0)}</p><p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-bold tracking-widest">{new Date(sale.timestamp).toLocaleTimeString()} • {sale.paymentMethod}</p></div>
                <div className="flex items-center gap-1 text-gray-300"><ChevronRight size={16}/></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuSettings: React.FC<{ 
  products: Product[]; onUpdateProducts: (p: Product[]) => void;
  categories: string[]; onUpdateCategories: (c: string[]) => void;
}> = ({ products, onUpdateProducts, categories, onUpdateCategories }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [productForm, setProductForm] = useState<Partial<Product>>({ name: '', price: 0, category: categories[0] || '', color: 'bg-orange-50' });

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price) return;
    if (editingId) {
      onUpdateProducts(products.map(p => p.id === editingId ? { ...p, ...productForm } as Product : p));
      setEditingId(null);
    } else {
      onUpdateProducts([...products, { ...productForm as Product, id: Date.now().toString(), color: productForm.color || 'bg-gray-50' }]);
      setShowAddForm(false);
    }
    setProductForm({ name: '', price: 0, category: categories[0] || '', color: 'bg-orange-50' });
  };

  const handleAddCategory = () => {
    const trimmed = newCatName.trim().toUpperCase();
    if (trimmed && !categories.includes(trimmed)) {
      onUpdateCategories([...categories, trimmed]);
      setNewCatName('');
    }
  };

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto bg-gray-50 pb-32 lg:pb-6">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-2xl font-black text-gray-900 uppercase">Configuration</h1><p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Menu Management</p></div>
        <button onClick={() => setShowAddForm(true)} className="bg-orange-500 text-white p-3 rounded-xl font-black shadow-lg active-scale transition-all"><Plus size={20}/></button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
          <h3 className="font-black mb-6 uppercase tracking-tighter text-gray-800">Categories</h3>
          <div className="flex gap-2 mb-6">
            <input type="text" placeholder="NEW CAT..." className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-100" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} />
            <button onClick={handleAddCategory} className="bg-blue-600 text-white p-3 rounded-xl font-bold active-scale"><Plus size={18}/></button>
          </div>
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group transition-all hover:bg-gray-100">
                <span className="text-[10px] font-black tracking-widest text-gray-600 uppercase">{cat}</span>
                <button onClick={() => onUpdateCategories(categories.filter(c => c !== cat))} className="p-1.5 text-red-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-8">
          {(showAddForm || editingId) && (
            <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 animate-in slide-in-from-top-4">
              <h3 className="font-black mb-4 text-orange-600 uppercase tracking-tighter">{editingId ? 'Edit Item' : 'New Item'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1"><label className="text-[10px] font-black text-gray-400 uppercase">Name</label><input type="text" className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} /></div>
                <div className="flex flex-col gap-1"><label className="text-[10px] font-black text-gray-400 uppercase">Price</label><input type="number" className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} /></div>
                <div className="flex flex-col gap-1"><label className="text-[10px] font-black text-gray-400 uppercase">Category</label><select className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="flex gap-2 items-end"><button onClick={handleSaveProduct} className="flex-1 bg-green-500 text-white p-3 rounded-xl font-bold active-scale"><Check size={20}/></button><button onClick={() => { setEditingId(null); setShowAddForm(false); }} className="flex-1 bg-gray-100 p-3 rounded-xl font-bold active-scale"><X size={20}/></button></div>
              </div>
            </div>
          )}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase border-b"><tr><th className="px-6 py-4">Item</th><th className="px-6 py-4 text-center">Category</th><th className="px-6 py-4 text-right">Price</th><th className="px-6 py-4 text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-gray-800 text-sm uppercase">{p.name}</td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-1 bg-gray-100 text-gray-400 rounded-full text-[9px] font-black uppercase">{p.category}</span></td>
                    <td className="px-6 py-4 font-black text-sm text-orange-600 text-right">₹{p.price}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2"><button onClick={() => { setEditingId(p.id); setProductForm(p); }} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button><button onClick={() => onUpdateProducts(products.filter(it => it.id !== p.id))} className="p-2 text-red-300 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/** --- MAIN APP --- **/
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'POS' | 'REPORTS' | 'MENU'>('POS');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentSale, setCurrentSale] = useState<SaleRecord | null>(null);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    setSales(getFromStorage(STORAGE_KEYS.SALES, []));
    const p = getFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const c = getFromStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    setProducts(p);
    setCategories(c);
    if (c.length > 0) setActiveCategory(c[0]);
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      saveToStorage(STORAGE_KEYS.SALES, sales);
      saveToStorage(STORAGE_KEYS.PRODUCTS, products);
      saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    }
  }, [sales, products, categories, isDataLoaded]);

  const subtotal = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
  const total = subtotal * 1.05;

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleCheckout = (method: PaymentMethod) => {
    const newSale: SaleRecord = {
      id: Date.now().toString(), billNo: (7000 + sales.length + 1).toString(),
      items: [...cart], subtotal, gst: total - subtotal, total, paymentMethod: method, timestamp: Date.now()
    };
    setSales(prev => [...prev, newSale]);
    setCurrentSale(newSale);
    setCart([]);
    setIsBasketOpen(false);
  };

  if (!isDataLoaded) return <div className="h-screen bg-gray-950 flex flex-col items-center justify-center text-orange-500 gap-4"><RefreshCcw className="animate-spin" size={48}/><p className="font-black tracking-widest uppercase">Initializing POS...</p></div>;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 overflow-hidden font-sans">
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-950 flex lg:flex-col items-center justify-around lg:justify-start py-2 lg:py-8 z-[60] lg:relative lg:w-24 shadow-2xl border-t lg:border-t-0 lg:border-r border-gray-800">
        <button onClick={() => setActiveTab('POS')} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${activeTab === 'POS' ? 'bg-orange-500 text-white' : 'text-gray-500'}`}><ShoppingCart size={20}/><span className="text-[8px] font-black uppercase">POS</span></button>
        <button onClick={() => setActiveTab('REPORTS')} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${activeTab === 'REPORTS' ? 'bg-orange-500 text-white' : 'text-gray-500'}`}><TrendingUp size={20}/><span className="text-[8px] font-black uppercase">STATS</span></button>
        <button onClick={() => setActiveTab('MENU')} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${activeTab === 'MENU' ? 'bg-orange-500 text-white' : 'text-gray-500'}`}><SettingsIcon size={20}/><span className="text-[8px] font-black uppercase">STORE</span></button>
      </nav>
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {activeTab === 'POS' ? (
          <div className="flex h-full relative overflow-hidden">
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-3 bg-white border-b flex gap-2 overflow-x-auto hide-scrollbar sticky top-0 z-10 shadow-sm">
                {categories.map(c => (
                  <button key={c} onClick={() => { setActiveCategory(c); setIsBasketOpen(false); }} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest whitespace-nowrap active-scale ${activeCategory === c ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>{c}</button>
                ))}
              </div>
              <div className="flex-1 p-3 md:p-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 overflow-y-auto pb-32">
                {products.filter(p => p.category === activeCategory).map(p => {
                  const inCart = cart.find(i => i.id === p.id);
                  return (
                    <button key={p.id} onClick={() => addToCart(p)} className={`p-4 rounded-[24px] border-2 h-32 flex flex-col justify-between text-left active-scale transition-all relative ${p.color || 'bg-white border-gray-200'} shadow-sm hover:shadow-xl`}>
                      <span className="font-black text-sm leading-tight uppercase line-clamp-2 tracking-tighter">{p.name}</span>
                      <span className="font-black text-xs opacity-80">₹{p.price}</span>
                      {inCart && <div className="absolute top-2 right-2 bg-black text-white w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] animate-in zoom-in shadow-lg">{inCart.quantity}</div>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={`fixed inset-0 lg:relative lg:inset-auto z-[70] lg:z-40 lg:flex w-full lg:w-[400px] bg-white border-l border-gray-100 shadow-2xl transition-transform duration-300 transform ${isBasketOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}`}>
              <div className="flex flex-col h-full w-full">
                <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-white"><h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Basket</h2><button onClick={() => setCart([])} className="text-red-400 font-bold text-xs uppercase">Clear</button></div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/20 hide-scrollbar">
                  {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-gray-200 gap-4 opacity-50"><ShoppingCart size={80}/><p className="font-black text-xs uppercase">Empty Basket</p></div> : cart.map(i => (
                    <div key={i.id} className="flex justify-between items-center p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex-1 min-w-0 pr-2"><h4 className="font-bold text-gray-800 text-xs truncate uppercase">{i.name}</h4><p className="text-[9px] text-gray-400 font-black">₹{i.price}</p></div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCart(cart.map(item => item.id === i.id ? {...item, quantity: Math.max(0, item.quantity - 1)} : item).filter(it => it.quantity > 0))} className="p-2 bg-gray-50 rounded-xl"><Minus size={12}/></button>
                        <span className="font-black text-[11px] w-4 text-center">{i.quantity}</span>
                        <button onClick={() => addToCart(i)} className="p-2 bg-gray-50 rounded-xl"><Plus size={12}/></button>
                      </div>
                      <div className="w-14 text-right font-black text-xs ml-2 text-orange-600">₹{i.price * i.quantity}</div>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-gray-100 bg-white mb-[72px] lg:mb-0">
                  <div className="flex justify-between text-2xl font-black mb-6 text-gray-950 uppercase tracking-tighter"><span>Total</span><span className="text-orange-600">₹{total.toFixed(0)}</span></div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleCheckout('UPI')} disabled={cart.length === 0} className="bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] disabled:opacity-50 active-scale uppercase tracking-widest">UPI</button>
                    <button onClick={() => handleCheckout('CASH')} disabled={cart.length === 0} className="bg-green-600 text-white py-4 rounded-2xl font-black text-[10px] disabled:opacity-50 active-scale uppercase tracking-widest">CASH</button>
                  </div>
                </div>
              </div>
            </div>
            {cart.length > 0 && !isBasketOpen && <button onClick={() => setIsBasketOpen(true)} className="lg:hidden fixed bottom-20 right-4 left-4 bg-orange-600 text-white p-4 rounded-2xl flex justify-between items-center shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-8"><div className="flex items-center gap-3"><span className="font-black text-sm uppercase">Order Review</span></div><span className="font-black text-lg tracking-tighter">₹{total.toFixed(0)}</span></button>}
          </div>
        ) : activeTab === 'REPORTS' ? (
          <ReportsView sales={sales} onClear={() => { setSales([]); localStorage.removeItem(STORAGE_KEYS.SALES); }} onSelectSale={setCurrentSale} />
        ) : (
          <MenuSettings products={products} onUpdateProducts={setProducts} categories={categories} onUpdateCategories={setCategories} />
        )}
      </main>
      {currentSale && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="w-full max-w-[80mm] animate-in zoom-in-95 duration-200">
              <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl p-1"><Receipt sale={currentSale} id="receipt-print-area"/></div>
              <div className="mt-6 flex flex-col gap-3 print:hidden">
                 <button onClick={() => window.print()} className="w-full bg-white text-black py-4 rounded-2xl font-black flex items-center justify-center gap-3 active-scale uppercase tracking-widest"><Printer size={20}/> Print Invoice</button>
                 <button onClick={() => setCurrentSale(null)} className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black shadow-xl active-scale uppercase tracking-widest">Next Order</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
