import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  Package, MapPin, FileText, Settings, LogOut, ChevronRight, 
  FileUp, Calendar, Download, Eye, Plus, Trash2, Edit2, 
  CheckCircle2, Clock, Printer, BookOpen, Truck, ClipboardList, ShieldCheck, Zap, Activity, AlertCircle, DollarSign, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseError';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { Logo } from '../components/Logo';

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/auth');
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    if(!user || !user.id) return;

    console.log("Fetching orders for userId:", user.id);
    const q = query(collection(db, 'orders'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Orders fetched for user:", ordersData);
      
      // Only valid orders, assuming they have sort of a createdAt
      ordersData.sort((a: any, b: any) => {
          const d1 = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const d2 = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return d2 - d1;
      });
      setOrders(ordersData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
    });
    return () => unsubscribe();
  }, [user]);

  if(!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
       <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0">
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-28">
                <div className="flex items-center space-x-4 mb-8">
                   <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-2xl uppercase shadow-inner">
                     {user.name?.[0] || 'U'}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="font-bold text-gray-900 text-lg truncate">{user.name || 'User'}</div>
                     <div className="text-sm text-gray-500 truncate">{user.phone || user.email || 'user@email.com'}</div>
                   </div>
                </div>

                <nav className="space-y-1.5">
                   <SidebarItem to="/upload" icon={FileUp} label="Start New Order" isCta />
                   <div className="my-4 border-t border-gray-100"></div>
                   <SidebarItem to="/dashboard" icon={Package} label="My Orders" exact />
                   <SidebarItem to="/dashboard/files" icon={FileText} label="My Files" />
                   <SidebarItem to="/dashboard/addresses" icon={MapPin} label="My Addresses" />
                   <SidebarItem to="/dashboard/invoices" icon={FileText} label="Invoices" />
                   <SidebarItem to="/dashboard/settings" icon={Settings} label="Settings" />
                   <button 
                     onClick={async () => { await signOut(auth); localStorage.clear(); window.location.href='/'; }}
                     className="w-full flex items-center space-x-3 px-4 py-3 mt-4 text-red-600 rounded-xl hover:bg-red-50 transition font-medium"
                   >
                     <LogOut className="w-5 h-5" />
                     <span>Logout</span>
                   </button>
                </nav>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
             <Routes>
               <Route path="/" element={<OrdersList orders={orders} />} />
               <Route path="/orders/:id" element={<OrderDetails orders={orders} />} />
               <Route path="/files" element={<FilesManager user={user} />} />
               <Route path="/addresses" element={<AddressesManager user={user} />} />
               <Route path="/invoices" element={<InvoicesPage orders={orders} />} />
               <Route path="/settings" element={<SettingsPage user={user} />} />
             </Routes>
          </div>
       </div>
    </div>
  )
}

function SidebarItem({to, icon: Icon, label, exact, isCta}: any) {
  const location = useLocation();
  const isActive = exact ? location.pathname === to : location.pathname.startsWith(to) && to !== '/dashboard';
  
  if (isCta) {
    return (
      <Link to={to} className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200 transition font-bold">
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <Link to={to} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}>
       <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
       <span>{label}</span>
       {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
    </Link>
  )
}

function OrdersList({ orders }: { orders: any[] }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 min-h-[600px]">
      <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">My Orders</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No orders found.</h3>
          <p className="text-gray-500 mb-6 max-w-md">Start your first order.</p>
          <Link to="/upload" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition">
             Start Your First Order
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const createdAtStr = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date(order.createdAt).toLocaleDateString();
            return (
            <div key={order.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border border-gray-100 rounded-2xl hover:border-indigo-100 hover:shadow-md transition bg-[#f8fafc] group">
               <div className="mb-4 sm:mb-0 space-y-1.5">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-indigo-600 text-lg">{order.id}</span>
                    <span className="inline-flex px-2.5 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded uppercase tracking-wider">
                       {order.status || 'Received'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5" /> 
                    Placed on {createdAtStr}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {order.options?.pages || 0} Pages • {order.options?.copies || 1} Copies • {order.options?.binding || 'soft'} Binding
                  </div>
               </div>
               <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between sm:space-y-3">
                  <div className="text-2xl font-black text-gray-900">₹{order.totalAmount || 0}</div>
                  <div className="flex space-x-2">
                    <button onClick={() => navigate(`/dashboard/orders/${order.id}`)} className="px-5 py-2.5 border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-100 transition">
                      View Details
                    </button>
                  </div>
               </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

function OrderDetails({ orders }: { orders: any[] }) {
  const { id } = useParams<{ id: string }>();
  const order = orders.find(o => o.id === id);
  const navigate = useNavigate();

  if (!order) return <div className="p-8 text-center bg-white rounded-3xl">Order not found</div>;

  const stages = [
    { id: 'Order Received', label: 'Order Received', icon: ClipboardList, message: 'Your order details have been received and logged.' },
    { id: 'File Verified', label: 'File Verified', icon: ShieldCheck, message: 'We have verified your PDF files for print-readiness.' },
    { id: 'Printing Started', label: 'Printing Started', icon: Printer, message: 'Your thesis is currently being printed on premium 100 GSM paper.' },
    { id: 'Printing Completed', label: 'Printing Completed', icon: Printer, message: 'All pages have been successfully printed.' },
    { id: 'Binding In Process', label: 'Binding In Process', icon: BookOpen, message: 'Binding team is preparing and hard-binding your thesis.' },
    { id: 'Binding Completed', label: 'Binding Completed', icon: BookOpen, message: 'Binding completed with your chosen specifications.' },
    { id: 'Packed', label: 'Packed', icon: Package, message: 'Your order is packed securely and ready for dispatch.' },
    { id: 'Shipped', label: 'Shipped', icon: Truck, message: 'Your package is on its way to your destination.' },
    { id: 'Delivered', label: 'Delivered', icon: CheckCircle2, message: 'Order delivered successfully. Thank you!' },
  ];

  const getCurrentStepIndex = () => {
    return stages.findIndex(s => s.id === order.status) !== -1 
        ? stages.findIndex(s => s.id === order.status) 
        : 2; // Default to printing started if not found perfectly
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center">
          <button onClick={() => navigate('/dashboard')} className="p-2 mr-4 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition">
             <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">Order {order.id}</h2>
            <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100">
           <Activity className="w-4 h-4 animate-pulse" />
           <span className="font-bold text-sm uppercase tracking-wider">Live Status</span>
        </div>
      </div>

      <div className="bg-gray-900 text-white rounded-3xl overflow-hidden relative shadow-lg">
         {/* Background Elements */}
         <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-600/30 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-600/30 rounded-full blur-3xl"></div>
         
         <div className="relative z-10 p-6 sm:p-10">
            <h3 className="text-xl font-bold mb-8">Production Timeline</h3>
            <div className="relative">
               {/* Vertical Progress Line Background */}
               <div className="absolute left-[27px] top-4 bottom-8 w-1 bg-white/10 rounded-full"></div>
               
               {/* Animated Progress Line Fill */}
               <motion.div 
                 initial={{ height: 0 }}
                 animate={{ height: `${(getCurrentStepIndex() / (stages.length - 1)) * 100}%` }}
                 transition={{ duration: 1.5, ease: "easeInOut" }}
                 className="absolute left-[27px] top-4 w-1 bg-gradient-to-b from-indigo-400 to-blue-400 rounded-full origin-top"
               ></motion.div>
               
               {/* Moving light dot on the progress line */}
               {getCurrentStepIndex() > 0 && getCurrentStepIndex() < stages.length - 1 && (
                  <motion.div
                    animate={{ y: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-[27px] top-4 w-1 h-32 bg-gradient-to-b from-transparent via-white to-transparent opacity-50 z-10"
                    style={{ height: `${(getCurrentStepIndex() / (stages.length - 1)) * 100}%` }}
                  ></motion.div>
               )}

               <div className="space-y-4">
                 {stages.map((stage, idx) => {
                    const isCompleted = getCurrentStepIndex() > idx;
                    const isCurrent = getCurrentStepIndex() === idx;
                    const isPending = getCurrentStepIndex() < idx;
                    const Icon = stage.icon;

                    return (
                      <div key={stage.id} className={`relative flex items-start group ${isPending && !isCurrent ? 'opacity-40 hover:opacity-70 transition-opacity' : ''}`}>
                         {/* Timeline Node */}
                         <div className="relative py-2 flex items-center justify-center shrink-0 w-14">
                            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center z-20 transition-all duration-500 ${
                              isCompleted ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/50' :
                              isCurrent ? 'bg-gray-900 text-indigo-400 border-[3px] border-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.4)]' :
                              'bg-gray-800 border-2 border-gray-700 text-gray-400'
                            }`}>
                               <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                               {isCurrent && (
                                  <>
                                     <span className="absolute -inset-1 rounded-full border border-indigo-400 animate-ping opacity-50"></span>
                                     <motion.span 
                                       animate={{ rotate: 360 }}
                                       transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                       className="absolute -inset-2 rounded-full border border-indigo-400 border-t-transparent border-b-transparent opacity-50"
                                     ></motion.span>
                                  </>
                               )}
                            </div>
                         </div>

                         {/* Content Box */}
                         <div className={`ml-4 w-full p-4 rounded-2xl transition-all duration-300 ${
                           isCurrent ? 'bg-white/10 border border-indigo-400/30 backdrop-blur-sm' : 'border border-transparent'
                         }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                               <h4 className={`text-base font-bold flex items-center ${isCurrent ? 'text-white' : isCompleted ? 'text-gray-200' : 'text-gray-400'}`}>
                                  {stage.label}
                                  {isCurrent && (
                                     <span className="ml-3 px-2 py-0.5 bg-indigo-500 text-white text-[10px] uppercase font-black tracking-wider rounded-md animate-pulse">LIVE</span>
                                  )}
                               </h4>
                            </div>
                            {(isCurrent || isCompleted) && (
                               <p className={`text-sm mt-1 max-w-xl ${isCurrent ? 'text-indigo-200' : 'text-gray-400'}`}>{stage.message}</p>
                            )}
                            {isCurrent && (
                               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-white/10 flex items-start space-x-2">
                                  <Zap className="w-4 h-4 text-indigo-400 mt-0.5" />
                                  <div className="text-xs text-indigo-300 font-mono">Processing actively...</div>
                               </motion.div>
                            )}
                         </div>
                      </div>
                    )
                 })}
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center"><FileText className="w-5 h-5 mr-2 text-indigo-600"/> Uploaded Files</h3>
            <div className="space-y-3">
              {order.files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-3">
                     <FileText className="w-8 h-8 text-indigo-400" />
                     <div>
                       <div className="font-semibold text-sm text-gray-900">{f.name}</div>
                       <div className="text-xs text-gray-500">{f.size}</div>
                     </div>
                  </div>
                  <a href={f.downloadURL || f.url || '#'} target="_blank" rel="noopener noreferrer" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye className="w-4 h-4"/></a>
                </div>
              ))}
            </div>
         </div>
         <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center"><Settings className="w-5 h-5 mr-2 text-indigo-600"/> Printing Specs</h3>
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <span className="block text-gray-500 mb-1">Color Mode</span>
                   <span className="font-semibold text-gray-900 capitalize">{order.options.colorMode}</span>
                 </div>
                 <div>
                   <span className="block text-gray-500 mb-1">Total Pages</span>
                   <span className="font-semibold text-gray-900">{order.options.pages} ({order.options.colorPages} Color)</span>
                 </div>
                 <div>
                   <span className="block text-gray-500 mb-1">Paper</span>
                   <span className="font-semibold text-gray-900 uppercase">{order.options.paperType}</span>
                 </div>
                 <div>
                   <span className="block text-gray-500 mb-1">Binding</span>
                   <span className="font-semibold text-gray-900 capitalize">{order.options.binding}</span>
                 </div>
              </div>
              
              {order.options.specialInstructions && (
                 <div className="bg-amber-100/50 rounded-lg p-4 border border-amber-200 mt-2">
                   <span className="block font-bold text-amber-900 mb-1 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1.5 text-amber-600" />
                      Special Instructions
                   </span>
                   <p className="text-sm text-gray-800 whitespace-pre-wrap">{order.options.specialInstructions}</p>
                 </div>
              )}
            </div>
         </div>
         <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2 text-indigo-600"/> Shipping Address</h3>
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
               <p className="font-medium text-gray-900">{order.address}</p>
            </div>
         </div>
         <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center"><DollarSignIcon className="w-5 h-5 mr-2 text-indigo-600"/> Payment Summary</h3>
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
               <div className="flex justify-between items-center font-bold text-lg mb-2">
                 <span>Total Amount</span>
                 <span className="text-indigo-600">₹{order.totalAmount}</span>
               </div>
               <div className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded inline-block">PAID • {order.paymentId}</div>
            </div>
         </div>
      </div>
    </div>
  )
}

function AddressesManager({ user }: { user: any }) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      const q = query(collection(db, 'users', user.id, 'addresses'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setAddresses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.id}/addresses`);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const [form, setForm] = useState({
    name: '', mobile: '', altMobile: '', line1: '', line2: '', landmark: '', pincode: '', city: '', state: '', country: 'India'
  });

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value;
    setForm(prev => ({ ...prev, pincode: pin }));
    
    if (pin.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setForm(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State,
            country: postOffice.Country || 'India'
          }));
          toast.success("Location auto-filled successfully!");
        } else {
          toast.error("Invalid pincode entered.");
        }
      } catch (err) {
        toast.error("Failed to fetch location data.");
      }
    }
  };

  const handleSave = async () => {
    if(!form.name || !form.mobile || !form.line1 || !form.pincode || !form.city || !form.state) {
      toast.error("Please fill all required fields.");
      return;
    }
    try {
      if (editingId) {
        await updateDoc(doc(db, 'users', user.id, 'addresses', editingId), form);
        toast.success("Address updated successfully!");
      } else {
        await addDoc(collection(db, 'users', user.id, 'addresses'), { ...form, isDefault: addresses.length === 0 });
        toast.success("New address added successfully!");
      }
      cancelEdit();
    } catch (e: any) {
       toast.error("Failed to save address: " + e.message);
       handleFirestoreError(e, editingId ? OperationType.UPDATE : OperationType.CREATE, `users/${user.id}/addresses`);
    }
  };
  
  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm({ name: '', mobile: '', altMobile: '', line1: '', line2: '', landmark: '', pincode: '', city: '', state: '', country: 'India' });
  }

  const handleEdit = (addr: any) => {
    setForm(addr);
    setEditingId(addr.id);
    setIsAdding(true);
  };
  
  const handleDelete = async (id: string) => {
    if(window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteDoc(doc(db, 'users', user.id, 'addresses', id));
        toast.success("Address deleted successfully!");
      } catch (e: any) {
        toast.error("Failed to delete address: " + e.message);
        handleFirestoreError(e, OperationType.DELETE, `users/${user.id}/addresses/${id}`);
      }
    }
  };
  
  const handleSetDefault = async (id: string) => {
    try {
      // Set all to false
      for (const addr of addresses) {
         if (addr.isDefault) {
            await updateDoc(doc(db, 'users', user.id, 'addresses', addr.id), { isDefault: false });
         }
      }
      // Set the target to true
      await updateDoc(doc(db, 'users', user.id, 'addresses', id), { isDefault: true });
      toast.success("Default address updated!");
    } catch (e: any) {
      toast.error("Failed to update default address: " + e.message);
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.id}/addresses/${id}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 min-h-[600px]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Saved Addresses</h2>
        {(!isAdding) && (
          <button onClick={() => setIsAdding(true)} className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition text-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Add New
          </button>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
             >
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                   <h3 className="font-bold text-gray-900 text-xl">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
                   <button onClick={cancelEdit} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                     <Plus className="w-5 h-5 rotate-45"/>
                   </button>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">Full Name *</label>
                       <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="John Doe" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">Mobile Number *</label>
                       <input type="tel" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="10-digit number" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">Alternate Mobile</label>
                       <input type="tel" value={form.altMobile} onChange={e => setForm({...form, altMobile: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Optional" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">Pincode *</label>
                       <input type="text" value={form.pincode} onChange={handlePincodeChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="6-digit pincode" />
                     </div>
                     <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-gray-500 mb-1">House/Flat No, Building Name *</label>
                       <input type="text" value={form.line1} onChange={e => setForm({...form, line1: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="House/Flat No, Building Name" />
                     </div>
                     <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-gray-500 mb-1">Area, Street, Sector, Village</label>
                       <input type="text" value={form.line2} onChange={e => setForm({...form, line2: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Street, Area, Village" />
                     </div>
                     <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-gray-500 mb-1">Landmark</label>
                       <input type="text" value={form.landmark} onChange={e => setForm({...form, landmark: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="E.g. Near Apollo Hospital" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">City *</label>
                       <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="City" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">State *</label>
                       <input type="text" value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="State" />
                     </div>
                     <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-gray-500 mb-1">Country *</label>
                       <input type="text" value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Country" />
                     </div>
                  </div>
                  <div className="mt-8 flex justify-end space-x-3">
                     <button onClick={cancelEdit} className="px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition">Cancel</button>
                     <button onClick={handleSave} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition">Save Address</button>
                  </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map(addr => (
          <div key={addr.id} className={`relative bg-white border ${addr.isDefault ? 'border-indigo-500 shadow-sm' : 'border-gray-200'} rounded-2xl p-6 hover:shadow-md transition group`}>
            {addr.isDefault && (
               <span className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">DEFAULT</span>
            )}
            <h3 className="font-bold text-gray-900 mb-1 pr-16">{addr.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{addr.mobile} {addr.altMobile && <span className="text-gray-400">/ {addr.altMobile}</span>}</p>
            <p className="text-sm text-gray-500 mb-1">{addr.line1}</p>
            {addr.line2 && <p className="text-sm text-gray-500 mb-1">{addr.line2}</p>}
            <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
            <p className="text-sm text-gray-500">{addr.country}</p>

            <div className="mt-6 grid grid-cols-3 gap-2">
               <button onClick={() => handleEdit(addr)} className="flex items-center justify-center p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition font-bold text-xs"><Edit2 className="w-3.5 h-3.5 mr-1" /> Edit</button>
               <button onClick={() => handleDelete(addr.id)} className="flex items-center justify-center p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition font-bold text-xs"><Trash2 className="w-3.5 h-3.5 mr-1" /> Delete</button>
               {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} className="flex items-center justify-center p-2 text-gray-600 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition font-bold text-xs">Set Default</button>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InvoicesPage({ orders }: { orders: any[] }) {
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);

  const handleDownload = (orderId: string) => {
    toast.success(`Invoice for ${orderId} downloaded locally.`);
  };

  const deliveredOrders = orders.filter(o => o.status === 'Delivered');

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 min-h-[600px] relative">
      <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">Invoices</h2>
      
      {deliveredOrders.length === 0 ? (
         <div className="text-center py-16 text-gray-500">No invoices generated yet. Invoices are generated once an order is delivered.</div>
      ) : (
        <div className="space-y-4">
           {deliveredOrders.map(order => {
             const createdAtStr = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date(order.createdAt).toLocaleDateString();
             return (
             <div key={order.id} className="flex flex-col sm:flex-row items-center justify-between p-6 bg-gray-50 border border-gray-100 rounded-2xl">
               <div className="flex items-center space-x-4 mb-4 sm:mb-0 w-full sm:w-auto">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">Invoice #{order.id.split('-')[1] || order.id.substring(0, 8)}</div>
                    <div className="text-sm text-gray-500">Date: {createdAtStr} • Amount: <span className="font-bold text-gray-900">₹{order.totalAmount || 0}</span></div>
                  </div>
               </div>
               <div className="flex space-x-3 w-full sm:w-auto">
                 <button onClick={() => setViewingInvoice(order)} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 border border-gray-300 bg-white rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
                    <Eye className="w-4 h-4 mr-2" /> View
                 </button>
                 <button onClick={() => handleDownload(order.id)} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-indigo-600 rounded-xl text-sm font-bold text-white hover:bg-indigo-700 transition shadow-md">
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                 </button>
               </div>
             </div>
             );
           })}
        </div>
      )}

      {/* Invoice Modal Viewer */}
      <AnimatePresence>
        {viewingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
             >
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
                   <h3 className="font-bold text-gray-900">Invoice Preview - {viewingInvoice.id}</h3>
                   <div className="flex space-x-2">
                     <button onClick={() => handleDownload(viewingInvoice.id)} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold flex items-center hover:bg-indigo-100">
                       <Printer className="w-4 h-4 mr-1.5"/> Print
                     </button>
                     <button onClick={() => setViewingInvoice(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                       <Plus className="w-5 h-5 rotate-45"/>
                     </button>
                   </div>
                </div>
                
                {/* PDF Content Mock */}
                <div className="p-8 sm:p-12 font-sans bg-white text-gray-800">
                   <div className="flex justify-between items-start mb-10 pb-8 border-b-2 border-gray-200">
                      <div>
                         <div className="flex items-center space-x-2 mb-4">
                           <Logo className="h-8" textClassName="text-xl" />
                         </div>
                         <div className="text-sm text-gray-500 leading-relaxed">
                            123 University Road,<br/>
                            New Delhi, 110001<br/>
                            GSTIN: 07AABCU9603R1ZX
                         </div>
                      </div>
                      <div className="text-right">
                         <h1 className="text-3xl font-black text-indigo-600 uppercase tracking-widest mb-2">INVOICE</h1>
                         <div className="text-sm font-bold text-gray-900">#INV-{viewingInvoice.id.split('-')[1]}</div>
                         <div className="text-sm text-gray-500">Date: {new Date(viewingInvoice.createdAt).toLocaleDateString()}</div>
                      </div>
                   </div>

                   <div className="flex justify-between items-start mb-10">
                     <div>
                       <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</div>
                       <div className="font-bold text-gray-900 text-lg mb-1">{viewingInvoice.address?.split(',')[0]}</div>
                       <div className="text-sm text-gray-600">{viewingInvoice.address}</div>
                     </div>
                     <div className="text-right">
                       <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Info</div>
                       <div className="font-bold text-gray-900">Order ID: {viewingInvoice.id}</div>
                       <div className="text-sm text-gray-600">Payment: Completed</div>
                     </div>
                   </div>

                   <table className="w-full text-left mb-10">
                      <thead>
                        <tr className="border-b-2 border-gray-900 text-sm font-bold text-gray-900">
                           <th className="pb-3">Description</th>
                           <th className="pb-3 text-right">Qty</th>
                           <th className="pb-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-b border-gray-100">
                          <td className="py-4">
                             <div className="font-bold text-gray-900 mb-1">Thesis Printing</div>
                             <div className="text-gray-500 text-xs">A4 • {viewingInvoice.options.paperType} • {viewingInvoice.options.pages} pages</div>
                          </td>
                          <td className="py-4 text-right align-top">{viewingInvoice.options.copies}</td>
                          <td className="py-4 text-right align-top font-mono">₹{Math.floor(parseFloat(viewingInvoice.totalAmount) * 0.6)}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-4">
                             <div className="font-bold text-gray-900 mb-1">Binding Service</div>
                             <div className="text-gray-500 text-xs">{viewingInvoice.options.binding} binding • {viewingInvoice.options.coverColor} cover</div>
                          </td>
                          <td className="py-4 text-right align-top">{viewingInvoice.options.copies}</td>
                          <td className="py-4 text-right align-top font-mono">₹{Math.floor(parseFloat(viewingInvoice.totalAmount) * 0.25)}</td>
                        </tr>
                      </tbody>
                   </table>

                   <div className="flex justify-end mb-10">
                      <div className="w-64 space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="font-mono">₹{(parseFloat(viewingInvoice.totalAmount) / 1.18).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">CGST (9%)</span>
                          <span className="font-mono">₹{((parseFloat(viewingInvoice.totalAmount) / 1.18) * 0.09).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">SGST (9%)</span>
                          <span className="font-mono">₹{((parseFloat(viewingInvoice.totalAmount) / 1.18) * 0.09).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-gray-900 font-bold text-lg">
                          <span>Total</span>
                          <span>₹{viewingInvoice.totalAmount}</span>
                        </div>
                      </div>
                   </div>

                   <div className="text-center text-sm text-gray-400 mt-20 pt-8 border-t border-gray-100">
                      This is a computer-generated invoice. No signature is required.
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SettingsPage({user}: {user: any}) {
  const [profileForm, setProfileForm] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) return JSON.parse(saved);
    return { 
      name: user.name || '', 
      phone: user.phone || '', 
      email: user.email || '',
      gender: 'not-specified',
      dob: ''
    };
  });
  
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' });

  const [notificationPrefs, setNotificationPrefs] = useState(() => {
    const saved = localStorage.getItem('user_notifications');
    if (saved) return JSON.parse(saved);
    return {
      orderUpdates: true,
      sms: true,
      email: true,
      whatsapp: false
    };
  });

  const [savedPrefs, setSavedPrefs] = useState(() => {
    const saved = localStorage.getItem('user_prefs');
    if (saved) return JSON.parse(saved);
    return {
      paperType: '100 GSM Bond',
      printMode: 'Color',
      bindingType: 'Hard Binding',
    };
  });

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const handleProfileUpdate = () => {
    if(!profileForm.name || !profileForm.phone) {
      toast.error('Name and Mobile Number are required.'); return;
    }
    if (profileForm.phone !== user.phone && !showOtp) {
      toast.success('OTP sent to new mobile number.');
      setShowOtp(true);
      return;
    }
    if (showOtp) {
      if (otp !== '1234') {
        toast.error('Invalid OTP. Please use 1234.');
        return;
      }
      setShowOtp(false);
      setOtp('');
      toast.success('Mobile number verified successfully!');
    }
    
    localStorage.setItem('user_profile', JSON.stringify(profileForm));
    toast.success('Profile updated successfully!');
  }

  const handlePasswordUpdate = () => {
    if(!passForm.current || !passForm.newPass || !passForm.confirm) {
      toast.error('All password fields are required.'); return;
    }
    if(passForm.newPass !== passForm.confirm) {
      toast.error('New passwords do not match.'); return;
    }
    toast.success('Password updated successfully!');
    setPassForm({ current: '', newPass: '', confirm: '' });
  }

  const handleNotificationUpdate = () => {
    localStorage.setItem('user_notifications', JSON.stringify(notificationPrefs));
    toast.success('Notification preferences updated!');
  }

  const handleSavedPrefsUpdate = () => {
    localStorage.setItem('user_prefs', JSON.stringify(savedPrefs));
    toast.success('Default printing preferences saved!');
  }

  const handleDeleteAccount = () => {
    if(window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      toast.success('Account deletion request initiated. A verification link has been sent to your email.');
    }
  }

  const handleLogoutAll = () => {
    if(window.confirm('Are you sure you want to log out of all other devices?')) {
      toast.success('Logged out of all other devices.');
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 min-h-[600px]">
      <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">Account Settings</h2>
      
      <div className="max-w-3xl space-y-8">
         {/* Profile Picture */}
         <div className="flex items-center space-x-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-3xl uppercase tracking-wider shadow-inner">
               {profileForm.name?.[0] || 'U'}
            </div>
            <div>
               <h3 className="font-bold text-gray-900 text-lg">{profileForm.name || 'User'}</h3>
               <p className="text-sm text-gray-500">{profileForm.email || 'Customer Account'}</p>
            </div>
         </div>

         {/* Personal Info */}
         <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                 <label className="block text-xs font-bold text-gray-500 mb-1">Full Name *</label>
                 <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition" />
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Mobile Number *</label>
                 <div className="flex relative">
                   <div className="absolute left-4 top-3 text-gray-400 font-medium">+91</div>
                   <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                 </div>
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Email Address</label>
                 <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition" />
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Gender (Optional)</label>
                 <select value={profileForm.gender} onChange={e => setProfileForm({...profileForm, gender: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition">
                   <option value="not-specified">Prefer not to say</option>
                   <option value="male">Male</option>
                   <option value="female">Female</option>
                   <option value="other">Other</option>
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Date of Birth (Optional)</label>
                 <input type="date" value={profileForm.dob} onChange={e => setProfileForm({...profileForm, dob: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition" />
              </div>

              <AnimatePresence>
                {showOtp && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:col-span-2 overflow-hidden">
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl mt-2">
                       <label className="block text-xs font-bold text-indigo-700 mb-2">Enter OTP to verify new mobile number (Use 1234)</label>
                       <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 4-digit OTP" className="w-full max-w-xs px-4 py-2 bg-white border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono" maxLength={4} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="md:col-span-2 mt-2">
                 <button onClick={handleProfileUpdate} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition">
                    {showOtp ? 'Verify & Save' : 'Save Personal Info'}
                 </button>
              </div>
            </div>
         </div>

         {/* Security Settings */}
         <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Security Settings</h3>
            <div className="space-y-4 max-w-xl">
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Current Password</label>
                 <input type="password" value={passForm.current} onChange={e => setPassForm({...passForm, current: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">New Password</label>
                   <input type="password" value={passForm.newPass} onChange={e => setPassForm({...passForm, newPass: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">Confirm New Password</label>
                   <input type="password" value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                 </div>
              </div>
              <div className="flex">
                 <button onClick={handlePasswordUpdate} className="px-6 py-3 bg-white text-indigo-700 border border-indigo-200 font-bold rounded-xl shadow-sm hover:bg-indigo-50 transition mt-2">Update Password</button>
                 <button className="px-6 py-3 text-gray-500 font-medium hover:text-gray-900 transition mt-2 ml-2 text-sm underline underline-offset-2">Forgot Password?</button>
              </div>
            </div>
         </div>

         {/* Notification Preferences */}
         <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                 <input type="checkbox" checked={notificationPrefs.orderUpdates} onChange={e => setNotificationPrefs({...notificationPrefs, orderUpdates: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                 <span className="text-gray-700 font-medium text-sm">Order Status Updates</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                 <input type="checkbox" checked={notificationPrefs.sms} onChange={e => setNotificationPrefs({...notificationPrefs, sms: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                 <span className="text-gray-700 font-medium text-sm">SMS Notifications</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                 <input type="checkbox" checked={notificationPrefs.email} onChange={e => setNotificationPrefs({...notificationPrefs, email: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                 <span className="text-gray-700 font-medium text-sm">Email Newsletters & Offers</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                 <input type="checkbox" checked={notificationPrefs.whatsapp} onChange={e => setNotificationPrefs({...notificationPrefs, whatsapp: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                 <span className="text-gray-700 font-medium text-sm">WhatsApp Notifications</span>
              </label>
              <button onClick={handleNotificationUpdate} className="px-6 py-2.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition mt-4 inline-block">Save Preferences</button>
            </div>
         </div>

         {/* Saved Preferences */}
         <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Default Order Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Default Paper</label>
                <select value={savedPrefs.paperType} onChange={e => setSavedPrefs({...savedPrefs, paperType: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                  <option>100 GSM Bond</option>
                  <option>115 GSM Imported</option>
                  <option>130 GSM Gloss</option>
                  <option>85 GSM Standard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Default Mode</label>
                <select value={savedPrefs.printMode} onChange={e => setSavedPrefs({...savedPrefs, printMode: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                  <option>Color</option>
                  <option>B/W</option>
                  <option>Auto (Mixed)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Default Binding</label>
                <select value={savedPrefs.bindingType} onChange={e => setSavedPrefs({...savedPrefs, bindingType: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                  <option>Hard Binding</option>
                  <option>Soft Binding</option>
                  <option>Spiral Binding</option>
                </select>
              </div>
            </div>
            <button onClick={handleSavedPrefsUpdate} className="px-6 py-2.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition">Save Defaults</button>
         </div>

         {/* Account Management */}
         <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <h3 className="font-bold text-red-600 mb-2 z-10 relative">Danger Zone</h3>
            <p className="text-sm text-gray-500 mb-6 z-10 relative">Permanent account actions and active sessions.</p>
            
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 z-10 relative">
               <button onClick={handleLogoutAll} className="px-6 py-3 bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition flex items-center justify-center">
                  <LogOut className="w-4 h-4 mr-2" /> Logout All Devices
               </button>
               <button onClick={handleDeleteAccount} className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-100 transition flex items-center justify-center shadow-sm">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Account
               </button>
            </div>
         </div>

      </div>
    </div>
  )
}

function DollarSignIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
  );
}

function FilesManager({ user }: { user: any }) {
  const [filesList, setFilesList] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      const q = query(
        collection(db, 'users', user.id, 'files'),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setFilesList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.id}/files`);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !user?.id) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const storagePath = `user_uploads/${user.id}/${selectedFile.name}`;
    const storageRef = ref(storage, storagePath);
    
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);
    
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        setIsUploading(false);
        setUploadError(error.message);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          await addDoc(collection(db, 'users', user.id, 'files'), {
            name: selectedFile.name,
            storagePath,
            downloadURL,
            size: selectedFile.size,
            type: selectedFile.type || 'application/octet-stream',
            createdAt: serverTimestamp()
          });
          
          toast.success("File uploaded successfully!");
          setShowUploadModal(false);
          setSelectedFile(null);
        } catch (error: any) {
          setUploadError("Failed to save file metadata: " + error.message);
          handleFirestoreError(error, OperationType.CREATE, `users/${user.id}/files`);
        } finally {
          setIsUploading(false);
        }
      }
    );
  };

  const handleDeleteFile = async (docId: string, storagePath: string) => {
    try {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
      await deleteDoc(doc(db, 'users', user.id, 'files', docId));
      toast.success("File deleted successfully!");
    } catch (e: any) {
      toast.error("Failed to delete file.");
      handleFirestoreError(e, OperationType.DELETE, `users/${user.id}/files/${docId}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 min-h-[600px]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-gray-900">My Files</h2>
        <button 
          onClick={() => {
            setUploadError(null);
            setSelectedFile(null);
            setShowUploadModal(true);
          }} 
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-md text-sm"
        >
          <FileUp className="w-4 h-4 mr-1.5" /> Add File
        </button>
      </div>

      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-xl">Upload File</h3>
                <button 
                  onClick={() => {
                    if (!isUploading) {
                      setShowUploadModal(false);
                      setUploadError(null);
                    }
                  }}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                  disabled={isUploading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {uploadError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl font-medium border border-red-100 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {uploadError}
                  </div>
                )}
                {!selectedFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-indigo-50/50 hover:border-indigo-300 transition-colors relative cursor-pointer">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-indigo-500">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-gray-900">Click to browse file</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="p-2 bg-white rounded shadow-sm text-indigo-600 shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium text-gray-900 text-sm truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    {!isUploading && (
                      <button 
                        onClick={() => setSelectedFile(null)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                      >
                       <X className="w-4 h-4"/>
                      </button>
                    )}
                  </div>
                )}

                {isUploading && (
                  <div className="mt-4 mb-2">
                    <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadError(null);
                    }} 
                    disabled={isUploading}
                    className="px-5 py-2.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpload} 
                    disabled={!selectedFile || isUploading}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
         )}
      </AnimatePresence>

      <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4 rounded-tl-2xl">Name</th>
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filesList.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-200 mb-3" />
                    <p className="font-medium text-gray-900">No files found</p>
                    <p className="text-sm">You haven't uploaded any files yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filesList.map(file => (
                <tr key={file.id} className="hover:bg-gray-50/50 transition border-b border-gray-100 last:border-b-0">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 truncate max-w-xs">{file.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {file.createdAt?.toDate ? file.createdAt.toDate().toLocaleString() : 'Just now'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {file.type ? file.type.split('/')[1] || 'binary' : 'document'}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                       <button 
                         onClick={() => window.open(file.downloadURL, '_blank', 'noopener,noreferrer')}
                         className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition"
                       >
                         <Download className="w-3.5 h-3.5 mr-1" /> Download
                       </button>
                       <button 
                         onClick={() => handleDeleteFile(file.id, file.storagePath)}
                         className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                       >
                         <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                       </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

