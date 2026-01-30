
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  ShoppingCart, Plus, Minus, X, Check, Printer, Smartphone, 
  Banknote, History as HistoryIcon, Sliders, Bluetooth, 
  ChevronRight, LayoutDashboard, TrendingUp, Calendar, 
  CreditCard, Download, FileText, PieChart as PieIcon, List, 
  Edit2, Trash2, Settings as SettingsIcon, Save, ArrowLeft
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
interface ItemSummary { name: string; quantity: number; revenue: number; }

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
];

/** --- COMPONENTS --- **/
const Receipt: React.FC<{ sale: SaleRecord; id?: string }> = ({ sale, id }) => (
  <div id={id} className="bg-white p-4 md:p-6 font-mono text-[10px] w-full max-w-[80mm] mx-auto text-black border border-gray-200 shadow-sm">
    <div className="text-center mb-4">
      <h1 className="font-bold text-sm uppercase">{STORE_DETAILS.name}</h1>
      <p className="text-[8px]">{STORE_DETAILS.tagline}</p>
      <p className="text-[7px]">{STORE_DETAILS.address}</p>
    </div>
    <div className="border-t border-dashed border-gray-400 my-2"></div>
    <div className="flex justify-between"><span>Bill: {sale.billNo}</span><span>{new Date(sale.timestamp).toLocaleDateString()}</span></div>
    <div className="border-t border-dashed border-gray-400 my-2"></div>
    {sale.items.map(item => (
      <div key={item.id} className="flex justify-between py-1">
        <span className="truncate pr-2">{item.name} x{item.quantity}</span>
        <span className="whitespace-nowrap">₹{(item.price * item.quantity).toFixed(2)}</span>
      </div>
    ))}
    <div className="border-t border-dashed border-gray-400 my-2"></div>
    <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-100"><span>TOTAL</span><span>₹{sale.total.toFixed(2)}</span></div>
    <div className="text-center mt-6 uppercase font-bold">Payment: {sale.paymentMethod}</div>
    <div className="text-center mt-2">THANK YOU 😊</div>
  </div>
);

const Reports: React.FC<{ sales: SaleRecord[]; onClear: () => void; onSelectSale: (s: SaleRecord) => void }> = ({ sales, onClear, onSelectSale }) => {
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((a, s) => a + s.total, 0);
    const methodCounts = sales.reduce((acc, s) => {
      acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.total;
      return acc;
    }, {} as Record<string, number>);
    return { revenue: totalRevenue, count: sales.length, methods: methodCounts };
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

  const exportCSV = () => {
    const headers = ['Bill No', 'Date', 'Payment', 'Total'];
    const rows = sales.map(s => [s.billNo, new Date(s.timestamp).toLocaleDateString(), s.paymentMethod, s.total.toFixed(2)]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Sales_Report.csv";
    link.click();
  };

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto bg-gray-50 pb-32 lg:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div><h1 className="text-2xl font-black">Sales & Reports</h1><p className="text-sm text-gray-500">Business performance metrics</p></div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={exportCSV} className="flex-1 md:flex-none bg-white border p-3 rounded-xl hover:bg-gray-100 flex items-center justify-center gap-2 text-xs font-bold"><Download size={16}/> CSV</button>
          <button onClick={() => { if(confirm("Delete history?")) onClear(); }} className="flex-1 md:flex-none bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-100 flex items-center justify-center gap-2 text-xs font-bold"><Trash2 size={16}/> RESET</button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm"><p className="text-[10px] font-bold text-gray-400 uppercase">Gross Sales</p><h2 className="text-lg md:text-2xl font-black">₹{stats.revenue.toLocaleString()}</h2></div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm"><p className="text-[10px] font-bold text-gray-400 uppercase">Total Orders</p><h2 className="text-lg md:text-2xl font-black">{stats.count}</h2></div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm text-green-600"><p className="text-[10px] font-bold text-gray-400 uppercase">Cash</p><h2 className="text-lg md:text-2xl font-black">₹{(stats.methods['CASH'] || 0).toLocaleString()}</h2></div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm text-blue-600"><p className="text-[10px] font-bold text-gray-400 uppercase">UPI</p><h2 className="text-lg md:text-2xl font-black">₹{(stats.methods['UPI'] || 0).toLocaleString()}</h2></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-sm md:text-base"><List size={18} className="text-orange-500"/> Item Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] md:text-xs">
              <thead className="text-gray-400 font-bold uppercase border-b"><tr className="border-b"><th className="pb-3 px-2">Item</th><th className="pb-3 text-center px-2">Qty</th><th className="pb-3 text-right px-2">Revenue</th></tr></thead>
              <tbody>
                {itemSummary.map(item => (
                  <tr key={item.name} className="border-b last:border-0 hover:bg-gray-50 transition-colors"><td className="py-3 px-2 font-semibold">{item.name}</td><td className="py-3 text-center px-2">{item.quantity}</td><td className="py-3 text-right px-2 font-black">₹{item.revenue.toFixed(0)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-sm md:text-base"><HistoryIcon size={18} className="text-blue-500"/> Recent Logs</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
            {sales.slice().reverse().map(sale => (
              <button key={sale.id} onClick={() => onSelectSale(sale)} className="w-full flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl hover:bg-gray-100 transition-all active-scale">
                <div className="text-left"><p className="font-bold text-sm">₹{sale.total.toFixed(0)}</p><p className="text-[9px] md:text-[10px] text-gray-400 uppercase">{new Date(sale.timestamp).toLocaleTimeString()} • {sale.paymentMethod}</p></div>
                <ChevronRight size={16} className="text-gray-300"/>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuManager: React.FC<{ products: Product[]; onUpdate: (p: Product[]) => void }> = ({ products, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({ name: '', price: 0, category: 'JUICES', color: 'bg-orange-50' });

  const handleSave = () => {
    if (!form.name || !form.price) return;
    if (editingId) {
      onUpdate(products.map(p => p.id === editingId ? { ...p, ...form } as Product : p));
      setEditingId(null);
    } else {
      const newP: Product = { ...form as Product, id: Date.now().toString(), color: form.color || 'bg-gray-50' };
      onUpdate([...products, newP]);
      setShowAdd(false);
    }
    setForm({ name: '', price: 0, category: 'JUICES', color: 'bg-orange-50' });
  };

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto bg-gray-50 pb-32 lg:pb-6">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-2xl font-black">Menu Settings</h1><p className="text-sm text-gray-500">Manage items and pricing</p></div>
        <button onClick={() => setShowAdd(true)} className="bg-orange-500 text-white p-3 rounded-xl md:rounded-2xl font-black shadow-lg shadow-orange-100 active-scale"><Plus size={20}/></button>
      </div>

      {(showAdd || editingId) && (
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 mb-8 animate-in slide-in-from-top-4">
          <h3 className="font-black mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-gray-400 px-1">NAME</label><input type="text" placeholder="Mango Special" className="p-3 bg-gray-50 border rounded-xl text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-gray-400 px-1">PRICE</label><input type="number" placeholder="80" className="p-3 bg-gray-50 border rounded-xl text-sm" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} /></div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-gray-400 px-1">CATEGORY</label><select className="p-3 bg-gray-50 border rounded-xl text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value as Category})}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select></div>
            <div className="flex gap-2 items-end">
              <button onClick={handleSave} className="flex-1 bg-green-500 text-white p-3 rounded-xl font-bold flex items-center justify-center"><Check size={20}/></button>
              <button onClick={() => { setEditingId(null); setShowAdd(false); }} className="flex-1 bg-gray-200 p-3 rounded-xl font-bold flex items-center justify-center"><X size={20}/></button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase"><tr className="border-b"><th className="px-4 md:px-6 py-4">Item</th><th className="px-4 md:px-6 py-4">Category</th><th className="px-4 md:px-6 py-4">Price</th><th className="px-4 md:px-6 py-4 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-6 py-4 font-bold text-gray-800 text-sm">{p.name}</td>
                  <td className="px-4 md:px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded-full text-[9px] font-black uppercase">{p.category}</span></td>
                  <td className="px-4 md:px-6 py-4 font-black text-sm">₹{p.price}</td>
                  <td className="px-4 md:px-6 py-4 text-right flex justify-end gap-1 md:gap-2">
                    <button onClick={() => { setEditingId(p.id); setForm(p); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={14}/></button>
                    <button onClick={() => { if(confirm("Delete item?")) onUpdate(products.filter(it => it.id !== p.id)); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/** --- MAIN APP --- **/
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'POS' | 'REPORTS' | 'MENU'>('POS');
  const [activeCategory, setActiveCategory] = useState<Category>('JUICES');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [currentSale, setCurrentSale] = useState<SaleRecord | null>(null);
  const [isBasketOpen, setIsBasketOpen] = useState(false);

  useEffect(() => {
    const savedSales = localStorage.getItem('bjc_sales_db');
    const savedProducts = localStorage.getItem('bjc_products_db');
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedProducts) setProducts(JSON.parse(savedProducts));
  }, []);

  const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0) * 1.05;

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  const handleCheckout = (method: PaymentMethod) => {
    const newSale: SaleRecord = {
      id: Date.now().toString(),
      billNo: (2000 + sales.length + 1).toString(),
      items: [...cart],
      subtotal: total / 1.05,
      gst: total - (total / 1.05),
      total,
      paymentMethod: method,
      timestamp: Date.now()
    };
    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    localStorage.setItem('bjc_sales_db', JSON.stringify(updatedSales));
    setCurrentSale(newSale);
    setCart([]);
    setIsBasketOpen(false);
  };

  const NavItem = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-4 p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all w-full lg:w-auto ${activeTab === id ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 lg:text-gray-400 hover:text-white'}`}
    >
      <Icon size={20} className="lg:size-6" />
      <span className="text-[10px] lg:text-sm font-bold uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Navigation: Sidebar (Laptop) / Bottom Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-950 flex lg:flex-col items-center justify-around lg:justify-start py-2 lg:py-8 px-2 lg:px-0 gap-2 lg:gap-8 border-t lg:border-t-0 lg:border-r border-gray-800 z-[60] lg:relative lg:w-24">
        <div className="hidden lg:flex w-12 h-12 bg-orange-500 rounded-2xl items-center justify-center text-white shadow-lg mb-4"><LayoutDashboard size={24}/></div>
        <NavItem id="POS" icon={ShoppingCart} label="POS" />
        <NavItem id="REPORTS" icon={TrendingUp} label="Stats" />
        <NavItem id="MENU" icon={SettingsIcon} label="Menu" />
      </nav>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {activeTab === 'POS' ? (
          <div className="flex h-full relative overflow-hidden">
            
            {/* POS Content Grid */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-3 md:p-4 bg-white border-b border-gray-100 flex gap-2 overflow-x-auto hide-scrollbar sticky top-0 z-10 shadow-sm">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => { setActiveCategory(c); setIsBasketOpen(false); }} className={`px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black tracking-wider transition-all whitespace-nowrap active-scale ${activeCategory === c ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>{c}</button>
                ))}
              </div>
              <div className="flex-1 p-3 md:p-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 overflow-y-auto pb-32 lg:pb-6">
                {products.filter(p => p.category === activeCategory).map(p => {
                  const itemInCart = cart.find(i => i.id === p.id);
                  return (
                    <button key={p.id} onClick={() => addToCart(p)} className={`p-4 md:p-5 rounded-[24px] md:rounded-[32px] border-2 h-32 md:h-40 flex flex-col justify-between text-left active-scale transition-all relative ${p.color || 'bg-white border-gray-200'} shadow-sm hover:shadow-md`}>
                      <span className="font-black text-sm md:text-lg leading-tight line-clamp-2">{p.name}</span>
                      <span className="font-black text-xs md:text-sm opacity-80">₹{p.price}</span>
                      {itemInCart && <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-black text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-black text-[10px] md:text-xs animate-in zoom-in">{itemInCart.quantity}</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Basket Drawer/Panel */}
            <div className={`
              fixed inset-0 lg:relative lg:inset-auto z-[70] lg:z-40 lg:flex w-full lg:w-[380px] bg-white border-l border-gray-100 shadow-2xl transition-transform duration-300 transform
              ${isBasketOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
            `}>
              <div className="flex flex-col h-full w-full">
                <div className="p-5 md:p-6 border-b border-gray-50 flex justify-between items-center bg-white lg:rounded-none rounded-t-[32px]">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsBasketOpen(false)} className="lg:hidden p-2 -ml-2 text-gray-400"><ArrowLeft size={20}/></button>
                    <h2 className="text-xl font-black text-gray-800">Basket</h2>
                  </div>
                  <button onClick={() => { setCart([]); setIsBasketOpen(false); }} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/20 hide-scrollbar">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 opacity-50"><ShoppingCart size={64}/><p className="font-black text-xs uppercase tracking-widest">Basket Empty</p></div>
                  ) : cart.map(i => (
                    <div key={i.id} className="flex justify-between items-center p-3 md:p-4 bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
                      <div className="flex-1 min-w-0 pr-2"><h4 className="font-bold text-gray-800 text-xs md:text-sm truncate">{i.name}</h4><p className="text-[9px] md:text-[10px] text-gray-400 font-bold">₹{i.price}</p></div>
                      <div className="flex items-center gap-2 md:gap-3">
                        <button onClick={() => setCart(cart.map(item => item.id === i.id ? {...item, quantity: Math.max(0, item.quantity - 1)} : item).filter(it => it.quantity > 0))} className="p-2 bg-gray-50 border rounded-xl active-scale"><Minus size={12}/></button>
                        <span className="font-black text-[10px] md:text-xs w-4 text-center">{i.quantity}</span>
                        <button onClick={() => addToCart(i)} className="p-2 bg-gray-50 border rounded-xl active-scale"><Plus size={12}/></button>
                      </div>
                      <div className="w-14 md:w-16 text-right font-black text-xs md:text-sm ml-2 text-gray-900">₹{i.price * i.quantity}</div>
                    </div>
                  ))}
                </div>
                <div className="p-6 md:p-8 border-t border-gray-100 bg-white mb-[72px] lg:mb-0">
                  <div className="flex justify-between text-2xl md:text-3xl font-black mb-6 tracking-tight text-gray-950"><span>Total</span><span className="text-orange-600">₹{total.toFixed(0)}</span></div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleCheckout('UPI')} disabled={cart.length === 0} className="bg-blue-600 text-white py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs disabled:opacity-50 active-scale shadow-lg shadow-blue-50">UPI / PHONEPE</button>
                    <button onClick={() => handleCheckout('CASH')} disabled={cart.length === 0} className="bg-green-600 text-white py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs disabled:opacity-50 active-scale shadow-lg shadow-green-50">CASH PAY</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Basket FAB */}
            {cart.length > 0 && !isBasketOpen && (
              <button 
                onClick={() => setIsBasketOpen(true)}
                className="lg:hidden fixed bottom-20 right-4 left-4 bg-orange-600 text-white p-4 rounded-2xl flex justify-between items-center shadow-2xl animate-in fade-in slide-in-from-bottom-4 z-[50]"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center font-black">{cart.reduce((a, b) => a + b.quantity, 0)}</div>
                  <span className="font-black text-sm uppercase tracking-wider">Review Order</span>
                </div>
                <span className="font-black text-lg">₹{total.toFixed(0)}</span>
              </button>
            )}

          </div>
        ) : activeTab === 'REPORTS' ? (
          <Reports sales={sales} onClear={() => { setSales([]); localStorage.removeItem('bjc_sales_db'); }} onSelectSale={setCurrentSale} />
        ) : (
          <MenuManager products={products} onUpdate={(newP) => { setProducts(newP); localStorage.setItem('bjc_products_db', JSON.stringify(newP)); }} />
        )}
      </main>

      {/* Bill Modal */}
      {currentSale && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="w-full max-w-[80mm] animate-in zoom-in-95 duration-200">
              <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl p-2"><Receipt sale={currentSale}/></div>
              <div className="mt-6 flex flex-col gap-3">
                 <button onClick={() => window.print()} className="w-full bg-white text-black py-4 md:py-5 rounded-2xl md:rounded-3xl font-black flex items-center justify-center gap-3 active-scale"><Printer size={20}/> PRINT THERMAL</button>
                 <button onClick={() => setCurrentSale(null)} className="w-full bg-orange-500 text-white py-4 md:py-5 rounded-2xl md:rounded-3xl font-black shadow-xl shadow-orange-500/20 active-scale">NEXT CUSTOMER</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
