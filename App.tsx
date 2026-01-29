
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, User, Plus, Minus, X, Check, Printer, Smartphone, CreditCard, Banknote, History as HistoryIcon, Sliders, Bluetooth, ChevronRight, LayoutDashboard } from 'lucide-react';
import { Product, CartItem, SaleRecord, Category, PaymentMethod, PrinterConfig } from './types';
import { PRODUCTS as INITIAL_PRODUCTS, CATEGORIES, STORE_DETAILS } from './constants';
import { printerService } from './services/PrinterService';
import Receipt from './components/Receipt';
import Reports from './components/Reports';
import MenuManager from './components/MenuManager';

const App: React.FC = () => {
  type AppTab = 'POS' | 'REPORTS' | 'MENU';
  const [activeTab, setActiveTab] = useState<AppTab>('POS');
  const [activeCategory, setActiveCategory] = useState<Category>('JUICES');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>({ type: 'SYSTEM', paperWidth: '80mm' });
  const [showCheckout, setShowCheckout] = useState(false);
  const [currentSale, setCurrentSale] = useState<SaleRecord | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const savedSales = localStorage.getItem('bjc_sales_history');
    if (savedSales) setSales(JSON.parse(savedSales));
    
    const savedProducts = localStorage.getItem('bjc_products');
    if (savedProducts) setProducts(JSON.parse(savedProducts));

    const savedPrinter = localStorage.getItem('bjc_printer_config');
    if (savedPrinter) setPrinterConfig(JSON.parse(savedPrinter));
  }, []);

  const saveSales = (newSales: SaleRecord[]) => {
    setSales(newSales);
    localStorage.setItem('bjc_sales_history', JSON.stringify(newSales));
  };

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('bjc_products', JSON.stringify(newProducts));
  };

  const savePrinterConfig = (config: PrinterConfig) => {
    setPrinterConfig(config);
    localStorage.setItem('bjc_printer_config', JSON.stringify(config));
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    // Haptic feedback simulation for Android
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
      return prev.filter(item => item.id !== productId);
    });
  };

  const clearCart = () => setCart([]);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const gst = useMemo(() => subtotal * STORE_DETAILS.gstRate, [subtotal]);
  const total = useMemo(() => subtotal + gst, [subtotal, gst]);

  const handleCheckout = async (method: PaymentMethod) => {
    const billNo = (1000 + sales.length + 1).toString();
    const newSale: SaleRecord = {
      id: Date.now().toString(),
      billNo,
      items: [...cart],
      subtotal,
      gst,
      total,
      paymentMethod: method,
      timestamp: Date.now()
    };

    saveSales([...sales, newSale]);
    setCurrentSale(newSale);
    setShowCheckout(false);
    clearCart();

    // Trigger Printing
    if (printerService.isConnected()) {
      setIsPrinting(true);
      try {
        await printerService.printReceipt(newSale, printerConfig.paperWidth);
      } catch (e) {
        console.error("BT Print failed, falling back to system", e);
        window.print();
      }
      setIsPrinting(false);
    } else {
      setTimeout(() => { window.print(); }, 500);
    }
  };

  const renderPOS = () => (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      <div className="flex-1 flex flex-col h-full bg-gray-50 border-r border-gray-200">
        <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all active-scale ${
                  activeCategory === cat 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 lg:pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.filter(p => p.category === activeCategory).map(product => {
              const inCart = cart.find(i => i.id === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`relative flex flex-col items-start p-4 rounded-3xl border-2 transition-all active-scale text-left h-36 ${product.color} shadow-sm hover:shadow-md overflow-hidden`}
                >
                  <span className="font-bold text-lg leading-tight mb-1 z-10">{product.name}</span>
                  <span className="font-black text-sm opacity-90 mt-auto z-10">₹ {product.price}</span>
                  {inCart && (
                    <div className="absolute top-3 right-3 bg-white text-orange-600 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-md">
                      {inCart.quantity}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-black/5 p-4 rounded-full">
                    <Plus size={32} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96 bg-white flex flex-col h-full shadow-2xl z-30 lg:z-10 absolute inset-x-0 bottom-0 lg:relative lg:translate-y-0 transition-transform duration-300 rounded-t-[32px] lg:rounded-none h-[80vh] lg:h-full">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <ShoppingCart className="text-orange-500" />
              {printerService.isConnected() && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-800">Basket ({cart.length})</h2>
          </div>
          <div className="flex gap-4">
             {cart.length > 0 && <button onClick={clearCart} className="text-gray-400 hover:text-red-500 p-2"><X size={20}/></button>}
             <button className="lg:hidden text-gray-300" onClick={() => {}}><Minus size={24} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                 <ShoppingCart size={32} />
              </div>
              <p className="font-medium text-sm">Select products to bill</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-right-4 duration-200">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm truncate pr-2">{item.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">₹ {item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => removeFromCart(item.id)} className="p-1.5 bg-white border border-gray-200 rounded-xl text-gray-600 active-scale"><Minus size={16} /></button>
                  <span className="font-black text-gray-800 w-4 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => addToCart(item)} className="p-1.5 bg-white border border-gray-200 rounded-xl text-gray-600 active-scale"><Plus size={16} /></button>
                </div>
                <div className="w-16 text-right font-black text-gray-800 ml-2 text-sm">
                  ₹ {item.price * item.quantity}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-100 pb-10 lg:pb-6">
          <div className="space-y-2 mb-6 text-sm font-medium">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹ {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-500"><span>GST (5%)</span><span>₹ {gst.toFixed(2)}</span></div>
            <div className="flex justify-between text-2xl font-black text-gray-900 pt-2 border-t border-gray-200 mt-2">
              <span>Total</span>
              <span className="text-orange-600">₹ {total.toFixed(2)}</span>
            </div>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)}
            className="w-full bg-orange-500 text-white font-black py-5 rounded-[20px] flex items-center justify-center gap-3 shadow-xl shadow-orange-100 disabled:opacity-50 disabled:shadow-none active-scale transition-all"
          >
            CONFIRM & PRINT
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-gray-100 font-sans">
      <div className="hidden sm:flex flex-col w-20 bg-gray-950 py-8 items-center gap-10">
        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
           <LayoutDashboard className="text-white" size={24} />
        </div>
        <nav className="flex flex-col gap-6">
          <button onClick={() => setActiveTab('POS')} className={`p-4 rounded-2xl transition-all ${activeTab === 'POS' ? 'bg-white/10 text-orange-500' : 'text-gray-500 hover:text-gray-300'}`}><ShoppingCart size={24} /></button>
          <button onClick={() => setActiveTab('REPORTS')} className={`p-4 rounded-2xl transition-all ${activeTab === 'REPORTS' ? 'bg-white/10 text-orange-500' : 'text-gray-500 hover:text-gray-300'}`}><HistoryIcon size={24} /></button>
          <button onClick={() => setActiveTab('MENU')} className={`p-4 rounded-2xl transition-all ${activeTab === 'MENU' ? 'bg-white/10 text-orange-500' : 'text-gray-500 hover:text-gray-300'}`}><Sliders size={24} /></button>
        </nav>
        <div className="mt-auto">
           <button className="text-gray-600 p-4"><User size={24} /></button>
        </div>
      </div>

      <main className="flex-1 h-full overflow-hidden relative">
        {activeTab === 'POS' ? renderPOS() : 
         activeTab === 'REPORTS' ? <Reports sales={sales} onClear={() => saveSales([])} onSelectSale={setCurrentSale} /> :
         <MenuManager 
           products={products} 
           onUpdateProducts={saveProducts} 
           printerConfig={printerConfig}
           onUpdatePrinter={savePrinterConfig}
         />}
      </main>

      {/* Payment Selection Sheet */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-[40px] sm:rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-20 duration-300">
            <div className="p-10 text-center border-b border-gray-50">
              <p className="text-gray-400 font-bold mb-1 uppercase text-xs tracking-widest">Billing Amount</p>
              <h2 className="text-5xl font-black text-gray-900">₹{total.toFixed(0)}</h2>
              <p className="text-orange-500 text-xs font-bold mt-2">Includes ₹{gst.toFixed(2)} GST</p>
            </div>
            <div className="p-8 space-y-4">
              <button onClick={() => handleCheckout('UPI')} className="w-full flex items-center justify-between p-6 rounded-3xl border-2 border-gray-100 hover:border-orange-500 hover:bg-orange-50 active-scale group">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Smartphone size={24} /></div>
                  <span className="font-black text-gray-800">PhonePe / GPay</span>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-orange-500"></div>
              </button>
              <button onClick={() => handleCheckout('CASH')} className="w-full flex items-center justify-between p-6 rounded-3xl border-2 border-gray-100 hover:border-orange-500 hover:bg-orange-50 active-scale group">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-green-100 text-green-600 rounded-2xl"><Banknote size={24} /></div>
                  <span className="font-black text-gray-800">Cash Payment</span>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-orange-500"></div>
              </button>
              <button onClick={() => setShowCheckout(false)} className="w-full text-center text-gray-400 font-bold py-4">Discard Bill</button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
      {currentSale && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="relative max-h-[90vh] w-full max-w-[80mm] overflow-y-auto">
             <button onClick={() => setCurrentSale(null)} className="absolute -top-12 right-0 text-white bg-white/20 p-2 rounded-full"><X size={24} /></button>
              <div className="bg-white rounded-xl shadow-2xl p-2"><Receipt sale={currentSale} /></div>
              <div className="mt-6 flex flex-col gap-3 no-print">
                 <button onClick={() => window.print()} className="bg-white text-gray-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg"><Printer size={20} /> PRINT AGAIN</button>
                 <button onClick={() => setCurrentSale(null)} className="bg-orange-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg"><Check size={20} /> NEW ORDER</button>
              </div>
          </div>
        </div>
      )}

      <div className="hidden">{currentSale && <Receipt sale={currentSale} id="receipt-print-area" />}</div>
    </div>
  );
};

export default App;
