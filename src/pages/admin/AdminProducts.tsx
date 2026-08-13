import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { Product } from '../../types';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Power, Package } from 'lucide-react';
import {
  PageHeader,
  Button,
  Badge,
  Modal,
  Input,
  Textarea,
  Skeleton,
  EmptyState,
  Container,
} from '../../components/ui';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
      toast.error('Error fetching products');
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
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully!');
      }

      handleCloseModal();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async (productId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting product');
    }
  };

  const handleToggleActive = async (product: Product): Promise<void> => {
    try {
      await api.put(`/products/${product._id}`, {
        isActive: !product.isActive
      });
      toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'} successfully!`);
      fetchProducts();
    } catch (error: any) {
      toast.error('Error updating product status');
    }
  };

  return (
    <Container className="py-8 sm:py-10">
      <PageHeader
        eyebrow="Admin"
        title="Products"
        description={`${products.length} ${products.length === 1 ? 'listing' : 'listings'} in your catalog`}
        actions={
          <Button icon={<Plus />} onClick={() => handleOpenModal()}>
            Add product
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-surface">
          <EmptyState
            icon={<Package />}
            title="No products yet"
            description="Add your first product to start selling."
            action={
              <Button icon={<Plus />} onClick={() => handleOpenModal()}>
                Add product
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-hairline bg-surface overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Product</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Price</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Stock</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-faint">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b border-hairline last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-canvas-raised shrink-0" />
                        <span className="text-sm font-medium text-ink truncate">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-ink-faint capitalize">{product.category}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-ink">${product.price.toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-medium ${product.quantity > 0 ? 'text-ink' : 'text-danger'}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={product.isActive ? 'success' : 'neutral'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenModal(product)} aria-label="Edit" className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-faint hover:text-gold hover:bg-gold-soft transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleActive(product)} aria-label="Toggle status" className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-faint hover:text-warning hover:bg-warning-soft transition-colors">
                          <Power className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product._id)} aria-label="Delete" className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-faint hover:text-danger hover:bg-danger-soft transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {products.map((product) => (
              <div key={product._id} className="rounded-xl border border-hairline bg-surface p-4">
                <div className="flex gap-3">
                  <img src={product.imageUrl} alt={product.name} className="w-14 h-14 rounded-lg object-cover bg-canvas-raised shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-ink truncate">{product.name}</p>
                      <Badge tone={product.isActive ? 'success' : 'neutral'}>{product.isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <p className="text-xs text-ink-faint capitalize mt-0.5">{product.category}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="font-semibold text-ink">${product.price.toFixed(2)}</span>
                      <span className={product.quantity > 0 ? 'text-ink-faint' : 'text-danger'}>{product.quantity} in stock</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-hairline">
                  <Button variant="secondary" size="sm" icon={<Pencil />} onClick={() => handleOpenModal(product)} className="flex-1">
                    Edit
                  </Button>
                  <Button variant="secondary" size="sm" icon={<Power />} onClick={() => handleToggleActive(product)} className="flex-1">
                    {product.isActive ? 'Disable' : 'Enable'}
                  </Button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    aria-label="Delete"
                    className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-ink-faint hover:text-danger hover:bg-danger-soft transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={handleCloseModal}
        title={editingProduct ? 'Edit product' : 'Add new product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Product name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter product name" />

          <Textarea label="Description" name="description" value={formData.description} onChange={handleChange} required rows={4} placeholder="Enter product description" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleChange} required placeholder="0.00" />
            <Input label="Quantity" type="number" min="0" name="quantity" value={formData.quantity} onChange={handleChange} required placeholder="0" />
          </div>

          <Input label="Category" name="category" value={formData.category} onChange={handleChange} required placeholder="Category" />

          <div>
            <label className="block text-[13px] font-medium text-ink-muted mb-1.5">Product image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-ink-faint file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-surface-hover file:text-ink file:text-sm file:font-medium hover:file:bg-hairline-strong file:cursor-pointer cursor-pointer"
            />
            {formData.image ? (
              <img src={URL.createObjectURL(formData.image)} alt="Preview" className="h-20 w-20 mt-3 object-cover rounded-lg border border-hairline" />
            ) : formData.imageUrl ? (
              <img src={formData.imageUrl} alt="Current" className="h-20 w-20 mt-3 object-cover rounded-lg border border-hairline" />
            ) : null}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">{editingProduct ? 'Update product' : 'Add product'}</Button>
          </div>
        </form>
      </Modal>
    </Container>
  );
};

export default AdminProducts;
