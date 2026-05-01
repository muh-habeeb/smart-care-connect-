import { useState, useMemo } from 'react';
import useDataStore from '../../store/useDataStore';
import { EmptyState } from '../../components/ui/EmptyState';
import { Box, Plus, ArrowUpDown, ArrowUp, ArrowDown, Clock, Search, Edit2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';

export default function MedicalShopProducts() {
  const { products, updateProduct, addProduct } = useDataStore();
  const productsList = Object.entries(products || {}).map(([id, data]) => ({ id, ...data }));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', price: '', stock: '', unit: '' });
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ column: 'name', direction: 'asc' });

  const handleSort = (column) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredProducts = useMemo(() => {
    return productsList
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const valA = a[sortConfig.column];
        const valB = b[sortConfig.column];
        return sortConfig.direction === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
  }, [productsList, searchTerm, sortConfig]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addProduct({ ...formData, price: Number(formData.price), stock: Number(formData.stock) });
      toast.success('Product added successfully!');
      setIsModalOpen(false);
      setFormData({ name: '', category: '', price: '', stock: '', unit: '' });
    } catch (err) {
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProduct(editingProduct.id, { 
        name: editingProduct.name,
        category: editingProduct.category,
        price: Number(editingProduct.price),
        stock: Number(editingProduct.stock),
        unit: editingProduct.unit
      });
      toast.success('Product updated successfully!');
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 smooth-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Manage Inventory</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Update stock levels and medicine pricing.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20 rounded-2xl h-12 px-6" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add New Medicine
        </Button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input 
          type="text"
          placeholder="Search by name or category..."
          className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-100 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState title="No products found" description="Try adjusting your search or add a new product." icon={Box} />
      ) : (
        <div className="bg-white border border-slate-100 overflow-hidden clay-shadow rounded-3xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase cursor-pointer" onClick={() => handleSort('name')}>Medicine Name</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase cursor-pointer" onClick={() => handleSort('category')}>Category</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase text-right">Price</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase text-right">Stock</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{product.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-500">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">₹{product.price}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex flex-col items-end">
                      <span className={`text-sm font-black ${product.stock < 10 ? 'text-red-500' : 'text-slate-900'}`}>
                        {product.stock} {product.unit}
                      </span>
                      {product.stock < 10 && <span className="text-[8px] font-black uppercase text-red-400">Low Stock</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-lg hover:bg-primary/5 hover:text-primary"
                      onClick={() => {
                        setEditingProduct(product);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Medicine">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Medicine Name</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Category</label>
              <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Unit (e.g. Tabs)</label>
              <input required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Price (₹)</label>
              <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Initial Stock</label>
              <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs mt-4">
            {loading ? 'Adding...' : 'Add Product'}
          </Button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Medicine">
        {editingProduct && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Medicine Name</label>
              <input required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Category</label>
                <input required value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Unit</label>
                <input required value={editingProduct.unit} onChange={e => setEditingProduct({...editingProduct, unit: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Price (₹)</label>
                <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Current Stock</label>
                <input type="number" required value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs mt-4">
              {loading ? 'Updating...' : 'Save Changes'}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
