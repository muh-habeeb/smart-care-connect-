import { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import useDataStore from '../../store/useDataStore';
import { EmptyState } from '../../components/ui/EmptyState';
import { Box, Plus, ArrowUpDown, ArrowUp, ArrowDown, Clock, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function ManagerProducts() {
  const { products, addProduct, deleteProduct, updateProduct } = useDataStore();
  const productsList = useMemo(() => Object.entries(products || {}).map(([id, data]) => ({ id, ...data })), [products]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'Medicines', stock: 0, price: 0 });
  const [loading, setLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [sortConfig, setSortConfig] = useState({ column: null, step: 0 }); // step: 0(created asc), 1(created desc), 2(alpha asc), 3(alpha desc)
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSort = (column) => {
    if (sortConfig.column !== column) {
      setSortConfig({ column, step: 0 });
    } else {
      setSortConfig({ column, step: (sortConfig.step + 1) % 4 });
    }
  };

  const sortedProducts = useMemo(() => {
    let items = [...productsList];
    if (!sortConfig.column) return items;

    return items.sort((a, b) => {
      const step = sortConfig.step;
      
      // Step 0 & 1: Based on createdAt (or ID as fallback)
      if (step === 0 || step === 1) {
        const dateA = a.createdAt || a.id;
        const dateB = b.createdAt || b.id;
        return step === 0 
          ? (dateA > dateB ? 1 : -1) 
          : (dateA < dateB ? 1 : -1);
      }

      // Step 2 & 3: Alphabetical/Numeric
      let valA = a[sortConfig.column];
      let valB = b[sortConfig.column];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return step === 2 ? -1 : 1;
      if (valA > valB) return step === 2 ? 1 : -1;
      return 0;
    });
  }, [productsList, sortConfig]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addProduct({ 
        ...formData, 
        stock: parseInt(formData.stock) || 0,
        price: parseFloat(formData.price) || 0 
      });
      toast.success('Product added successfully!');
      setIsModalOpen(false);
      setFormData({ name: '', category: 'Medicines', stock: 0, price: 0 });
    } catch (err) {
      console.error(err);
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const { id, ...data } = editingProduct;
      await updateProduct(id, {
        ...data,
        stock: parseInt(data.stock) || 0,
        price: parseFloat(data.price) || 0
      });
      toast.success('Product updated successfully!');
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update product');
    } finally {
      setEditLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      await deleteProduct(deletingProduct.id);
      toast.success('Product deleted successfully');
      setDeletingProduct(null);
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const SortIcon = ({ col }) => {
    if (sortConfig.column !== col) return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100" />;
    if (sortConfig.step === 0) return <Clock className="w-3 h-3 text-slate-400" />;
    if (sortConfig.step === 1) return <Clock className="w-3 h-3 text-slate-500" />;
    if (sortConfig.step === 2) return <ArrowUp className="w-3 h-3 text-primary" />;
    return <ArrowDown className="w-3 h-3 text-primary" />;
  };

  return (
    <div className="space-y-6 smooth-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage hospital inventory including medicines and equipment.</p>
        </div>
        <Button className="gap-2 shadow-md hover:shadow-lg transition-all" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {productsList.length === 0 ? (
        <EmptyState 
          title="No products found" 
          description="Start building your inventory by adding new products."
          icon={Box}
        />
      ) : (
        <div className="bg-white border border-slate-100 overflow-hidden clay-shadow rounded-3xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100/50 transition-colors select-none group"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Product Name <SortIcon col="name" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100/50 transition-colors select-none group"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-1">
                    Category <SortIcon col="category" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100/50 transition-colors select-none group"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center gap-1">
                    Price <SortIcon col="price" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100/50 transition-colors select-none group"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center gap-1">
                    Stock <SortIcon col="stock" />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">₹{product.price || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${product.stock > 10 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        onClick={() => {
                          setEditingProduct(product);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeletingProduct(product)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Product">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
            <input 
              required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
              placeholder="Ex: Paracetamol 500mg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select 
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
            >
              <option value="Medicines">Medicines</option>
              <option value="Equipment">Equipment</option>
              <option value="Laboratory Items">Laboratory Items</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
              <input 
                type="number" required min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
              <input 
                type="number" required min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-500">Cancel</Button>
            <Button type="submit" disabled={loading} className="shadow-md">{loading ? 'Adding...' : 'Add Product'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Product">
        {editingProduct && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input 
                required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select 
                value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
              >
                <option value="Medicines">Medicines</option>
                <option value="Equipment">Equipment</option>
                <option value="Laboratory Items">Laboratory Items</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                <input 
                  type="number" required min="0" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                <input 
                  type="number" required min="0" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-slate-500">Cancel</Button>
              <Button type="submit" disabled={editLoading} className="shadow-md">{editLoading ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={!!deletingProduct} onClose={() => setDeletingProduct(null)} title="Delete Product">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-slate-900">{deletingProduct?.name}</span>? 
            This action is permanent and cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setDeletingProduct(null)} className="text-slate-500">Cancel</Button>
            <Button 
              type="button" 
              className="bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20"
              disabled={deleteLoading}
              onClick={handleConfirmDelete}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Product'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


