
import React from 'react';
import { SaleRecord } from '../types';
import { STORE_DETAILS } from '../constants';

interface ReceiptProps {
  sale: SaleRecord;
  id?: string;
}

const Receipt: React.FC<ReceiptProps> = ({ sale, id }) => {
  const dateStr = new Date(sale.timestamp).toLocaleDateString();
  const timeStr = new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      id={id}
      className="bg-white p-6 font-mono text-xs w-[80mm] mx-auto text-black border border-gray-200 shadow-sm"
      style={{ minHeight: '100px' }}
    >
      <div className="text-center mb-4">
        <h1 className="font-bold text-lg uppercase">{STORE_DETAILS.name}</h1>
        <p>{STORE_DETAILS.tagline}</p>
        <p className="text-[10px]">{STORE_DETAILS.address} | GSTIN: {STORE_DETAILS.gstin}</p>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>
      
      <div className="flex justify-between">
        <span>Bill No: {sale.billNo}</span>
      </div>
      <div className="flex justify-between">
        <span>Date: {dateStr}</span>
        <span>Time: {timeStr}</span>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-1">Item</th>
            <th className="py-1 text-center">Qty</th>
            <th className="py-1 text-right">Amt</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item) => (
            <tr key={item.id}>
              <td className="py-1 max-w-[120px] truncate">{item.name}</td>
              <td className="py-1 text-center">{item.quantity}</td>
              <td className="py-1 text-right">{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{sale.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST (5%)</span>
          <span>{sale.gst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm pt-1">
          <span>TOTAL</span>
          <span>₹ {sale.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>
      
      <div className="text-center font-bold mb-4">
        Payment: {sale.paymentMethod}
      </div>

      <div className="text-center space-y-1">
        <p>Thank You 😊</p>
        <p>Visit Again!</p>
      </div>
      
      <div className="border-b border-dashed border-gray-400 my-4"></div>
    </div>
  );
};

export default Receipt;
