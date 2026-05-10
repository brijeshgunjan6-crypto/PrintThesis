import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, Truck, CheckCircle2, Search, ClipboardList, ShieldCheck, Printer, BookOpen, Clock, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [orderId, setOrderId] = useState(initialId);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('timeline');

  const fetchOrder = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        // Mock fallback for tracking via both Mobile and Order ID
        if(id === '9876543210' || id.toUpperCase() === 'ORD-89192') {
           setTimeout(() => {
             setOrder({
               id: 'ORD-89192', customerName: 'Rahul Sharma', mobile: '9876543210',
               status: 'Printing Started', createdAt: '2026-05-06T10:30:00Z',
               updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
               eta: 'Tomorrow, 4:00 PM'
             });
             setLoading(false);
           }, 800);
        } else {
           throw new Error('Order not found with that Track ID or Mobile Number');
        }
      } else {
        const data = await res.json();
        setOrder(data);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order status');
      setOrder(null);
      setLoading(false);
    }
  }

  useEffect(() => {
    if(initialId) {
       fetchOrder(initialId);
    }
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(orderId) fetchOrder(orderId);
  }

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
     if(!order) return -1;
     return stages.findIndex(s => s.id === order.status);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
       <div className="max-w-4xl w-full mx-auto relative z-10">
          <div className="text-center mb-10">
             <motion.h1 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-4xl font-serif font-black text-gray-900 mb-4"
             >
               Live Track Your Thesis
             </motion.h1>
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.1 }}
               className="text-gray-500"
             >
               Enter your Order ID or Mobile Number to monitor production in real-time.
             </motion.p>
          </div>

          <form onSubmit={handleSearch} className="mb-12 relative z-20">
            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="relative max-w-xl mx-auto flex shadow-2xl shadow-indigo-200/50 rounded-full"
            >
               <input 
                 type="text" 
                 value={orderId}
                 onChange={e => setOrderId(e.target.value)}
                 className="w-full pl-8 pr-16 py-5 bg-white border-2 border-transparent focus:border-indigo-500 rounded-full text-lg shadow-inner outline-none transition uppercase font-mono font-bold placeholder:font-sans placeholder:font-normal"
                 placeholder="e.g. ORD-1681284 or 9876543210"
               />
               <button type="submit" className="absolute right-2 top-2 bottom-2 w-14 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition shadow-md group">
                 <Search className="w-6 h-6 group-hover:scale-110 transition-transform"/>
               </button>
            </motion.div>
          </form>

          {loading && (
             <div className="flex flex-col items-center justify-center py-20">
                 <div className="relative w-20 h-20">
                   <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                   <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                 </div>
                 <h3 className="mt-6 text-xl font-bold text-gray-900 animate-pulse">Connecting to Production Floor...</h3>
             </div>
          )}

          {error && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-red-600 font-bold bg-red-50 border border-red-200 p-6 rounded-2xl shadow-sm max-w-md mx-auto">
                {error}
             </motion.div>
          )}

          {order && !loading && (
             <motion.div 
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ type: "spring", stiffness: 100, damping: 20 }}
               className="bg-white rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100"
             >
                {/* Header Section */}
                <div className="bg-gray-900 text-white p-8 relative overflow-hidden">
                   {/* Background Elements */}
                   <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-600/30 rounded-full blur-3xl"></div>
                   <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-600/30 rounded-full blur-3xl"></div>
                   
                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="mb-6 md:mb-0">
                         <div className="flex items-center space-x-3 mb-2">
                           <h2 className="text-3xl font-black font-mono tracking-tight">{order.id}</h2>
                           <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm shadow-sm flex items-center">
                             <Activity className="w-3 h-3 mr-1.5 animate-pulse text-green-400" />
                             Live
                           </span>
                         </div>
                         <p className="text-gray-400 flex items-center">
                           <Clock className="w-4 h-4 mr-2" />
                           Placed on {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                         </p>
                      </div>
                      <div className="text-left md:text-right bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                         <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider font-bold">Est. Delivery</div>
                         <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">
                           {order.eta || '3-5 Business Days'}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-8 sm:p-12">
                   <div className="relative">
                      {/* Vertical Progress Line Background */}
                      <div className="absolute left-[27px] top-4 bottom-8 w-1 bg-gray-100 rounded-full"></div>
                      
                      {/* Animated Progress Line Fill */}
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${(getCurrentStepIndex() / (stages.length - 1)) * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute left-[27px] top-4 w-1 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full origin-top"
                      ></motion.div>
                      
                      {/* Moving light dot on the progress line */}
                      {getCurrentStepIndex() > 0 && getCurrentStepIndex() < stages.length - 1 && (
                         <motion.div
                           animate={{
                              y: ['0%', '100%', '0%']
                           }}
                           transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear"
                           }}
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
                             <div key={stage.id} className="relative flex items-start group">
                                {/* Timeline Node */}
                                <div className="relative py-2 flex items-center justify-center shrink-0 w-14">
                                   <div className={`relative w-10 h-10 rounded-full flex items-center justify-center z-20 transition-all duration-500 ${
                                     isCompleted ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300' :
                                     isCurrent ? 'bg-white text-indigo-600 border-[3px] border-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]' :
                                     'bg-white border-2 border-gray-200 text-gray-300'
                                   }`}>
                                      <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                                      
                                      {/* Current step animated rings */}
                                      {isCurrent && (
                                         <>
                                            <span className="absolute -inset-1 rounded-full border border-indigo-500 animate-ping opacity-50"></span>
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
                                <div className={`ml-4 w-full p-5 rounded-2xl border transition-all duration-300 ${
                                  isCurrent ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200 shadow-sm transform scale-[1.02]' :
                                  isCompleted ? 'bg-white border-transparent' :
                                  'bg-transparent border-transparent opacity-50'
                                }`}>
                                   <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                                      <h4 className={`text-lg font-bold flex items-center ${isCurrent ? 'text-indigo-900' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                         {stage.label}
                                         {isCurrent && (
                                            <span className="ml-3 px-2 py-0.5 bg-indigo-600 text-white text-[10px] uppercase font-black tracking-wider rounded-md animate-pulse">
                                               LIVE
                                            </span>
                                         )}
                                      </h4>
                                      {/* Timestamp (mocked) */}
                                      {(isCompleted || isCurrent) && (
                                        <div className="text-xs font-semibold text-gray-400 mt-1 sm:mt-0">
                                          {isCurrent ? 'Just Now' : new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                      )}
                                   </div>
                                   
                                   {(isCurrent || isCompleted) && (
                                      <p className={`text-sm mt-1 leading-relaxed max-w-xl ${isCurrent ? 'text-indigo-700 font-medium' : 'text-gray-500'}`}>
                                         {stage.message}
                                      </p>
                                   )}

                                   {/* Extra Live Activity Details when Current */}
                                   {isCurrent && (
                                      <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-4 pt-4 border-t border-indigo-100 flex items-start space-x-3"
                                      >
                                         <Zap className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                                         <div>
                                            <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">System Status</div>
                                            <div className="text-sm text-indigo-700 font-mono bg-white/50 inline-block px-3 py-1.5 rounded-lg border border-indigo-100">
                                              [INFO] Processing order #{order.id.split('-')[1]} • Optimizing setup
                                            </div>
                                         </div>
                                      </motion.div>
                                   )}
                                </div>
                             </div>
                           )
                        })}
                      </div>
                   </div>
                </div>
             </motion.div>
          )}
       </div>
    </div>
  )
}

