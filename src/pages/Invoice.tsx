import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import type { Order, User } from '../types';
import PageLoader from '../components/ui/PageLoader';
import Button from '../components/ui/Button';
import { toast } from 'react-toastify';

const Invoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (!cancelled) setOrder(res.data.data.order);
      } catch {
        toast.error('Order not found');
        navigate('/orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, navigate]);

  if (loading) return <PageLoader />;
  if (!order) return null;

  const user = typeof order.user === 'object' ? (order.user as User) : null;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6 gap-2 print:hidden">
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Back
        </Button>
        <Button onClick={() => window.print()} icon={<Printer className="w-3.5 h-3.5" />}>
          Print / Save PDF
        </Button>
      </div>

      <div className="bg-white text-black rounded-[var(--radius-lg)] p-8 sm:p-10 shadow-[var(--shadow-vault-md)] print:shadow-none print:p-6">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ShopLogs</h1>
            <p className="text-sm text-gray-600 mt-1">Receipt · Order confirmation</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-gray-500">Invoice</p>
            <p className="text-lg font-mono font-semibold">#{order.orderNumber}</p>
            <p className="text-xs text-gray-500 mt-1">{orderDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Billed to</p>
            <p className="font-semibold">{user?.name || 'Customer'}</p>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Status</p>
            <p className={`font-semibold uppercase text-sm ${
              order.status === 'completed' ? 'text-green-700' :
              order.status === 'cancelled' ? 'text-red-700' : 'text-blue-700'
            }`}>{order.status}</p>
            <p className="text-xs text-gray-500 mt-1">Paid with wallet</p>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <th className="text-left pb-2 font-semibold">Item</th>
              <th className="text-right pb-2 font-semibold w-16">Qty</th>
              <th className="text-right pb-2 font-semibold w-24">Price</th>
              <th className="text-right pb-2 font-semibold w-28">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3 text-sm">{item.productName}</td>
                <td className="py-3 text-sm text-right">{item.quantity}</td>
                <td className="py-3 text-sm text-right">${item.price.toFixed(2)}</td>
                <td className="py-3 text-sm text-right font-semibold">${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-bold">
              <span>Total</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>Thank you for shopping with ShopLogs.</p>
          <p className="mt-1">For questions about this order, contact support at shoplogshere.com</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
