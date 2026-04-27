
import React, { useMemo } from 'react';
import { SaleRecord, ItemSummary } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Trash2, TrendingUp, Calendar, CreditCard, ChevronRight, Download, FileText, PieChart as PieIcon, List } from 'lucide-react';

interface ReportsProps {
  sales: SaleRecord[];
  onClear: () => void;
  onSelectSale: (sale: SaleRecord) => void;
}

const Reports: React.FC<ReportsProps> = ({ sales, onClear, onSelectSale }) => {
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
    const totalGst = sales.reduce((acc, s) => acc + s.gst, 0);
    const count = sales.length;
    const methodCounts = sales.reduce((acc, s) => {
      acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.total;
      return acc;
    }, {} as Record<string, number>);

    return { totalRevenue, totalGst, count, methodCounts };
  }, [sales]);

  const itemSummary = useMemo(() => {
    const items: Record<string, ItemSummary> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!items[item.id]) {
          items[item.id] = { name: item.name, quantity: 0, revenue: 0 };
        }
        items[item.id].quantity += item.quantity;
        items[item.id].revenue += (item.price * item.quantity);
      });
    });
    return Object.values(items).sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  const chartData = useMemo(() => {
    const hours: Record<string, number> = {};
    sales.forEach(s => {
      const hour = new Date(s.timestamp).getHours();
      const label = `${hour}:00`;
      hours[label] = (hours[label] || 0) + s.total;
    });
    return Object.entries(hours).map(([name, total]) => ({ name, total }));
  }, [sales]);

  const pieData = useMemo(() => {
    return Object.entries(stats.methodCounts).map(([name, value]) => ({ name, value }));
  }, [stats]);

  const exportToCSV = () => {
    const headers = ['Bill No', 'Date', 'Time', 'Payment', 'Subtotal', 'GST', 'Total'];
    const rows = sales.map(s => [
      s.billNo,
      new Date(s.timestamp).toLocaleDateString(),
      new Date(s.timestamp).toLocaleTimeString(),
      s.paymentMethod,
      s.subtotal.toFixed(2),
      s.gst.toFixed(2),
      s.total.toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Sales_Report_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-gray-50/50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales & Operations</h1>
          <p className="text-gray-500 text-sm">Track business performance and generate reports</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 border border-gray-200 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold shadow-lg shadow-orange-100 transition-all hover:bg-orange-600 active:scale-95"
          >
            <FileText size={18} />
            Print Daily PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl"><TrendingUp size={24} /></div>
            <span className="text-sm font-medium text-gray-500 uppercase">Gross Revenue</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">₹ {stats.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Calendar size={24} /></div>
            <span className="text-sm font-medium text-gray-500 uppercase">Orders</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.count}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><CreditCard size={24} /></div>
            <span className="text-sm font-medium text-gray-500 uppercase">Cash Closing</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">₹ {(stats.methodCounts['CASH'] || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><PieIcon size={24} /></div>
            <span className="text-sm font-medium text-gray-500 uppercase">GST Collected</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">₹ {stats.totalGst.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-orange-500" />
            Hourly Sales Velocity
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f8f8f8'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => <Cell key={`cell-${index}`} fill="#f59e0b" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <PieIcon size={18} className="text-blue-500" />
            Payment Split
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#f59e0b', '#3b82f6', '#8b5cf6'][index % 3]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs font-bold text-gray-500">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6'][i % 3]}}></div>
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Item Wise Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <List size={18} className="text-orange-500" />
            <h3 className="font-bold text-gray-800">Item-wise Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500 uppercase font-bold text-[10px] bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Item Name</th>
                  <th className="px-6 py-3 text-center">Qty Sold</th>
                  <th className="px-6 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {itemSummary.map(item => (
                  <tr key={item.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{item.name}</td>
                    <td className="px-6 py-4 text-center">{item.quantity}</td>
                    <td className="px-6 py-4 text-right font-bold">₹ {item.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-orange-500" />
              <h3 className="font-bold text-gray-800">Recent Logs</h3>
            </div>
            <button onClick={onClear} className="text-xs text-red-500 hover:underline">Clear History</button>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {sales.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No transactions recorded</div>
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
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-orange-500" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
