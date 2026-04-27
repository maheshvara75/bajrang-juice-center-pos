
import React, { useMemo } from 'react';
import { SaleRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trash2, TrendingUp, Calendar, CreditCard, ChevronRight } from 'lucide-react';

interface HistoryProps {
  sales: SaleRecord[];
  onClear: () => void;
  onSelectSale: (sale: SaleRecord) => void;
}

const History: React.FC<HistoryProps> = ({ sales, onClear, onSelectSale }) => {
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
    const count = sales.length;
    const methodCounts = sales.reduce((acc, s) => {
      acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.total;
      return acc;
    }, {} as Record<string, number>);

    return { totalRevenue, count, methodCounts };
  }, [sales]);

  const chartData = useMemo(() => {
    // Group by hour for today's visual
    const hours: Record<string, number> = {};
    sales.forEach(s => {
      const hour = new Date(s.timestamp).getHours();
      const label = `${hour}:00`;
      hours[label] = (hours[label] || 0) + s.total;
    });
    return Object.entries(hours).map(([name, total]) => ({ name, total }));
  }, [sales]);

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales Dashboard</h1>
          <p className="text-gray-500 text-sm">Real-time performance metrics</p>
        </div>
        <button 
          onClick={() => {
            if(confirm("Are you sure you want to clear all data?")) onClear();
          }}
          className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
          Clear Records
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Sales</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">₹ {stats.totalRevenue.toLocaleString()}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Calendar size={24} />
            </div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Order Count</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.count}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <CreditCard size={24} />
            </div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">UPI Share</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalRevenue > 0 ? Math.round(((stats.methodCounts['UPI'] || 0) / stats.totalRevenue) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 h-80">
        <h3 className="font-bold text-gray-800 mb-4">Sales by Hour</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
            <Tooltip 
              cursor={{fill: '#f8f8f8'}}
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#f59e0b" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {sales.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No transactions recorded yet</div>
          ) : (
            sales.slice().reverse().map(sale => (
              <button 
                key={sale.id}
                onClick={() => onSelectSale(sale)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold">
                    #{sale.billNo.slice(-3)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">₹ {sale.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {sale.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400 group-hover:text-orange-500">
                   <span className="text-sm font-medium">{sale.items.length} items</span>
                   <ChevronRight size={18} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
