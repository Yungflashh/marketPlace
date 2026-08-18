import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { Product } from '../../types';
import { toast } from 'react-toastify';
import { Star, Package, Plus, Pencil, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Pagination from '../../components/ui/Pagination';
import Dialog from '../../components/ui/Dialog';
import EmptyState from '../../components/ui/EmptyState';
import PageLoader from '../../components/ui/PageLoader';
import ConfirmDialog from '../../components/ConfirmDialog';

const PAGE_SIZE = 15;

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const featuredCount = products.filter((p) => p.featured).length;
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    quantity: string;
    category: string;
    image?: File | null;
    imageUrl?: string;
  }>({ name: '', description: '', price: '', quantity: '', category: '', image: null, imageUrl: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get('/products?limit=1000');
      setProducts(response.data.data.products);
    } catch {
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
        imageUrl: product.imageUrl,
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', quantity: '', category: '', image: null, imageUrl: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', quantity: '', category: '', image: null, imageUrl: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('quantity', formData.quantity);
      data.append('category', formData.category);
      if (formData.image) data.append('image', formData.image);

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Log updated successfully!');
      } else {
        await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Log created successfully!');
      }

      handleCloseModal();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving log');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      toast.success('Log deleted successfully!');
      setDeleteTarget(null);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting log');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (product: Product): Promise<void> => {
    try {
      await api.put(`/products/${product._id}`, { isActive: !product.isActive });
      toast.success(`Log ${product.isActive ? 'deactivated' : 'activated'} successfully!`);
      fetchProducts();
    } catch {
      toast.error('Error updating log status');
    }
  };

  const handleToggleFeatured = async (product: Product): Promise<void> => {
    try {
      await api.patch(`/products/${product._id}/featured`);
      toast.success(`Log ${product.featured ? 'removed from featured' : 'marked as featured'}!`);
      fetchProducts();
    } catch {
      toast.error('Error updating featured status');
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(products.length / PAGE_SIZE) || 1;
  const paginated = products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-[21px] font-bold text-ink">Manage logs</h1>
          <p className="text-[13px] text-ink-muted mt-0.5">{products.length} total logs · {featuredCount} featured</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={<Plus className="w-4 h-4" />}>Add new log</Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<Package className="w-6 h-6" />}
          title="No logs yet"
          description="Add your first log to start selling."
          className="bg-surface border border-border rounded-[var(--radius-xl)]"
        />
      ) : (
        <Card padded={false}>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--vault-border)]">
              <thead className="bg-surface-hover">
                <tr>
                  {['Log', 'Category', 'Price', 'Qty', 'Status', 'Featured', 'Actions'].map((h) => (
                    <th key={h} className={`px-5 py-3 text-[10.5px] font-semibold text-ink-muted uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--vault-border)]">
                {paginated.map((product) => (
                  <tr key={product._id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={product.imageUrl} alt={product.name} className="h-9 w-9 rounded-[var(--radius-sm)] object-cover bg-surface-hover shrink-0" />
                        <span className="text-[13px] font-medium text-ink truncate max-w-[160px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><Badge tone="neutral" className="capitalize">{product.category}</Badge></td>
                    <td className="px-5 py-3.5"><span className="text-[13px] font-bold text-ink">${product.price.toFixed(2)}</span></td>
                    <td className="px-5 py-3.5"><span className={`text-[13px] font-semibold ${product.quantity > 0 ? 'text-success' : 'text-error'}`}>{product.quantity}</span></td>
                    <td className="px-5 py-3.5"><Badge tone={product.isActive ? 'success' : 'error'}>{product.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        title={product.featured ? 'Remove from featured' : 'Mark as featured'}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${product.featured ? 'bg-accent-soft text-accent' : 'bg-surface-hover text-ink-muted hover:text-ink-soft'}`}
                      >
                        <Star className={`w-3 h-3 ${product.featured ? 'fill-current' : ''}`} />
                        {product.featured ? 'Featured' : 'Set featured'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenModal(product)} className="px-3 py-1.5 text-[11.5px] font-medium text-ink-soft hover:bg-surface-hover rounded-[var(--radius-sm)] transition-colors">Edit</button>
                        <button onClick={() => handleToggleActive(product)} className={`px-3 py-1.5 text-[11.5px] font-medium rounded-[var(--radius-sm)] transition-colors ${product.isActive ? 'text-warning hover:bg-warning-soft' : 'text-success hover:bg-success-soft'}`}>
                          {product.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => setDeleteTarget(product)} className="px-3 py-1.5 text-[11.5px] font-medium text-error hover:bg-error-soft rounded-[var(--radius-sm)] transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-[var(--vault-border)]">
            {paginated.map((product) => (
              <div key={product._id} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img src={product.imageUrl} alt={product.name} className="h-11 w-11 rounded-[var(--radius-sm)] object-cover bg-surface-hover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium text-ink truncate">{product.name}</p>
                    <p className="text-[11px] text-ink-muted capitalize">{product.category}</p>
                  </div>
                  <span className="text-[14px] font-bold text-ink shrink-0">${product.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  <Badge tone={product.isActive ? 'success' : 'error'}>{product.isActive ? 'Active' : 'Inactive'}</Badge>
                  <Badge tone="neutral">{product.quantity} in stock</Badge>
                  {product.featured && <Badge tone="accent"><Star className="w-2.5 h-2.5 fill-current" /> Featured</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleOpenModal(product)} icon={<Pencil className="w-3 h-3" />}>Edit</Button>
                  <Button size="sm" variant="secondary" onClick={() => handleToggleActive(product)}>{product.isActive ? 'Deactivate' : 'Activate'}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(product)} icon={<Trash2 className="w-3 h-3" />} className="!text-error ml-auto" />
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-border flex items-center justify-between flex-wrap gap-3">
              <p className="text-[11.5px] text-ink-muted">Page {currentPage} of {totalPages}</p>
              <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
            </div>
          )}
        </Card>
      )}

      <Dialog
        open={showModal}
        onClose={handleCloseModal}
        title={editingProduct ? 'Edit log' : 'Add new log'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button form="product-form" type="submit" loading={saving}>{editingProduct ? 'Update log' : 'Add log'}</Button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Log name</label>
            <Input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter log name" />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Description</label>
            <Textarea name="description" value={formData.description} onChange={handleChange} required rows={4} placeholder="Enter log description" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Price</label>
              <Input type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleChange} required placeholder="0.00" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Quantity</label>
              <Input type="number" min="0" name="quantity" value={formData.quantity} onChange={handleChange} required placeholder="0" />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Category</label>
            <Input type="text" name="category" value={formData.category} onChange={handleChange} required placeholder="Category" />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Log image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-[13px] text-ink-soft file:mr-3 file:py-2 file:px-3.5 file:rounded-[var(--radius-md)] file:border-0 file:text-[12.5px] file:font-medium file:bg-primary-soft file:text-primary hover:file:brightness-95"
            />
            {formData.image ? (
              <img src={URL.createObjectURL(formData.image)} alt="Preview" className="h-24 w-24 mt-2.5 object-cover rounded-[var(--radius-md)] border border-border" />
            ) : formData.imageUrl ? (
              <img src={formData.imageUrl} alt="Current" className="h-24 w-24 mt-2.5 object-cover rounded-[var(--radius-md)] border border-border" />
            ) : null}
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete log"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminProducts;
