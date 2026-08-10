import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { Product } from '../../types';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const PAGE_SIZE = 15;
const INPUT_CLS = 'w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const featuredCount = products.filter(p => p.featured).length;
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    quantity: string;
    category: string;
    image?: File | null;
    imageUrl?: string;
  }>({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    image: null,
    imageUrl: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get('/products?limit=1000');
      setProducts(response.data.data.products);
    } catch (error: any) {
      toast.error('Error fetching logs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Product): void => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        quantity: product.quantity.toString(),
        category: product.category,
        image: null,
        imageUrl: product.imageUrl
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        quantity: '',
        category: '',
        image: null,
        imageUrl: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      quantity: '',
      category: '',
      image: null,
      imageUrl: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('quantity', formData.quantity);
      data.append('category', formData.category);

      if (formData.image) {
        data.append('image', formData.image);
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Log updated successfully!');
      } else {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Log created successfully!');
      }

      handleCloseModal();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving log');
    }
  };

  const handleDelete = async (productId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;

    try {
      await api.delete(`/products/${productId}`);
      toast.success('Log deleted successfully!');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting log');
    }
  };

  const handleToggleActive = async (product: Product): Promise<void> => {
    try {
      await api.put(`/products/${product._id}`, {
        isActive: !product.isActive
      });
      toast.success(`Log ${product.isActive ? 'deactivated' : 'activated'} successfully!`);
      fetchProducts();
    } catch (error: any) {
      toast.error('Error updating log status');
    }
  };

  const handleToggleFeatured = async (product: Product): Promise<void> => {
    try {
      await api.patch(`/products/${product._id}/featured`);
      toast.success(`Log ${product.featured ? 'removed from featured' : 'marked as featured'}!`);
      fetchProducts();
    } catch (error: any) {
      toast.error('Error updating featured status');
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paginated = products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex justify-center items-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading logs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Manage Logs</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{products.length} total logs · {featuredCount} featured</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors text-sm font-medium">
          + Add New Log
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 py-16">
          <p className="text-gray-500 dark:text-gray-400">No logs yet. Add your first log above.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-50 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-950">
                <tr>
                  {['Log', 'Category', 'Price', 'Qty', 'Status', 'Featured', 'Actions'].map((h) => (
                    <th key={h} className={`px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {paginated.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={product.imageUrl} alt={product.name} className="h-9 w-9 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[160px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full capitalize">{product.category}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">${product.price.toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-semibold ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>{product.quantity}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${product.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        title={product.featured ? 'Remove from featured' : 'Mark as featured'}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${ product.featured ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600' }`}
                      >
                        <Star className={`w-3 h-3 ${product.featured ? 'fill-yellow-500' : ''}`} />
                        {product.featured ? 'Featured' : 'Set Featured'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenModal(product)} className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Edit</button>
                        <button onClick={() => handleToggleActive(product)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${product.isActive ? 'text-yellow-700 hover:bg-yellow-50' : 'text-green-700 hover:bg-green-50'}`}>
                          {product.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400 dark:text-gray-500">Page {currentPage} of {totalPages}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p); return acc;
                  }, [])
                  .map((p, i) => p === '...'
                    ? <span key={`e-${i}`} className="px-1 text-gray-300 text-sm">…</span>
                    : <button key={p} onClick={() => setCurrentPage(p as number)}
                        className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${currentPage === p ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
                  )}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {editingProduct ? 'Edit Log' : 'Add New Log'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Log Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={INPUT_CLS}
                    placeholder="Enter log name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className={INPUT_CLS}
                    placeholder="Enter log description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className={INPUT_CLS}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                    <input
                      type="number"
                      min="0"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      className={INPUT_CLS}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className={INPUT_CLS}
                    placeholder="Category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Log Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={INPUT_CLS}
                  />
                  {formData.image ? (
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      className="h-24 w-24 mt-2 object-cover rounded"
                    />
                  ) : formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Current"
                      className="h-24 w-24 mt-2 object-cover rounded"
                    />
                  ) : null}
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors text-sm font-medium">
                    {editingProduct ? 'Update Log' : 'Add Log'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
