
import React, { useState, useEffect } from 'react';
import { Product, Category, PrinterConfig } from '../types.ts';
import { CATEGORIES } from '../constants.ts';
import { printerService } from '../services/PrinterService.ts';
import { Plus, Edit2, Trash2, X, Check, Printer, Bluetooth, Settings as SettingsIcon } from 'lucide-react';

interface MenuManagerProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  printerConfig: PrinterConfig;
  onUpdatePrinter: (config: PrinterConfig) => void;
}

const MenuManager: React.FC<MenuManagerProps> = ({ products, onUpdateProducts, printerConfig, onUpdatePrinter }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'JUICES',
    color: 'bg-orange-50 border-orange-100 text-orange-700'
  });

  const handlePrinterConnect = async () => {
    setIsConnecting(true);
    const success = await printerService.connect();
    if (success) {
      onUpdatePrinter({ ...printerConfig, type: 'BLUETOOTH' });
    } else {
      alert("Could not connect to Bluetooth Printer. Ensure it's in pairing mode.");
    }
    setIsConnecting(false);
  };

  const handleSave = (id?: string) => {
    if (!formData.name || formData.price === undefined) return;

    if (id) {
      const updated = products.map(p => p.id === id ? { ...p, ...formData } as Product : p);
      onUpdateProducts(updated);
      setIsEditing(null);
    } else {
      const newProduct: Product = {
        ...formData as Product,
        id: Date.now().toString(),
        color: formData.color || 'bg-gray-50 border-gray-200 text-gray-800'
      };
      onUpdateProducts([...products, newProduct]);
      setShowAddForm(false);
    }
    setFormData({ name: '', price: 0, category: 'JUICES', color: 'bg-orange-50 border-orange-100 text-orange-700' });
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Store Settings</h1>
          <p className="text-gray-500 text-sm">Hardware and Menu configuration</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95"
        >
          Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Bluetooth size={24} /></div>
            <h3 className="font-bold text-gray-800">Thermal Printer</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">Status</span>
              {printerService.isConnected() ? (
                <span className="flex items-center gap-2 text-green-600 font-bold text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  CONNECTED
                </span>
              ) : (
                <span className="text-gray-400 font-bold text-xs uppercase">Disconnected</span>
              )}
            </div>

            <button
              onClick={handlePrinterConnect}
              disabled={isConnecting}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                printerService.isConnected() 
                ? 'bg-green-50 text-green-600' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isConnecting ? 'Searching...' : printerService.isConnected() ? 'Reconnect Printer' : 'Pair Bluetooth Printer'}
            </button>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Paper Width</p>
              <div className="grid grid-cols-2 gap-2">
                {(['58mm', '80mm'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => onUpdatePrinter({ ...printerConfig, paperWidth: size })}
                    className={`py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                      printerConfig.paperWidth === size ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <SettingsIcon size={18} className="text-orange-500" />
            <h3 className="font-bold text-gray-800">Menu List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400">
                <tr>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-black uppercase">{p.category}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">₹ {p.price}</td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => setIsEditing(p.id)} className="p-2 text-gray-400 hover:text-blue-500"><Edit2 size={16}/></button>
                       <button onClick={() => onUpdateProducts(products.filter(item => item.id !== p.id))} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </td>
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

export default MenuManager;
