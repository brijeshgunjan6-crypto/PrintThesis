import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  Users, FileText, CheckSquare, PlusSquare, DollarSign, 
  Printer, Package, Truck, Search, Filter, Eye, Download, 
  ChevronRight, Calendar, AlertCircle, CheckCircle2,
  Clock, X, LogOut, ArrowLeft, Send, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

// Mock Data for the system
const MOCK_ORDERS = [
  { 
    id: 'ORD-89192', 
    customerName: 'Rahul Sharma', 
    mobile: '9876543210',
    email: 'rahul@example.com',
    address: 'Sector 62, Noida, UP',
    status: 'Pending', 
    totalAmount: 1450, 
    date: '2026-05-08T10:30:00Z',
    files: [{ name: 'Final_Thesis_v2.pdf', size: '14MB' }],
    options: { pages: 240, colorPages: 10, colorMode: 'mixed', paperType: '85gsm', binding: 'hard', coverColor: 'Black', copies: 3, specialInstructions: 'Please ensure that the cover page text is embossed in gold.\nAlso, print pages 15-25 strictly in color as they contain important charts.\nUrgent delivery requested for Monday morning.' },
    payment: { id: 'pay_MKs82js9D', status: 'Paid', amount: 1450 }
  },
  { 
    id: 'ORD-77211', 
    customerName: 'Priya Patel', 
    mobile: '9123456780',
    email: 'priya@example.com',
    address: 'Koramangala, Bengaluru',
    status: 'Printing', 
    totalAmount: 850, 
    date: '2026-05-07T14:20:00Z',
    files: [{ name: 'Priya_Thesis.pdf', size: '22MB' }],
    options: { pages: 120, colorPages: 0, colorMode: 'bw', paperType: '100gsm', binding: 'premium', coverColor: 'Navy Blue', copies: 2 },
    payment: { id: 'pay_LKh81ns8D', status: 'Paid', amount: 850 }
  },
  { 
    id: 'ORD-66233', 
    customerName: 'Amit Kumar', 
    mobile: '9988776655',
    email: 'amit.k@example.com',
    address: 'Connaught Place, New Delhi',
    status: 'Binding', 
    totalAmount: 450, 
    date: '2026-05-06T09:15:00Z',
    files: [{ name: 'Project_Report.pdf', size: '8MB' }],
    options: { pages: 80, colorPages: 80, colorMode: 'color', paperType: '75gsm', binding: 'soft', coverColor: 'Default', copies: 1 },
    payment: { id: 'pay_PKd88md9S', status: 'Paid', amount: 450 }
  },
  { 
    id: 'ORD-55411', 
    customerName: 'Neha Gupta', 
    mobile: '9871234560',
    email: 'neha.g@example.com',
    address: 'Andheri West, Mumbai',
    status: 'Ready for Dispatch', 
    totalAmount: 2100, 
    date: '2026-05-05T16:45:00Z',
    files: [{ name: 'PhD_Thesis_Final.pdf', size: '45MB' }],
    options: { pages: 350, colorPages: 50, colorMode: 'mixed', paperType: '100gsm', binding: 'hard', coverColor: 'Maroon', copies: 4 },
    payment: { id: 'pay_XJm99ls8A', status: 'Paid', amount: 2100 }
  }
];

const ORDER_STATUSES = [
  'Pending', 'File Verified', 'Printing', 'Binding', 'Ready for Dispatch', 'Shipped', 'Delivered'
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  return (
    <div className="flex flex-1 bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white shrink-0 flex flex-col hidden md:flex">
         <div className="p-6 border-b border-gray-800">
            <span className="font-serif text-2xl font-bold tracking-tight">Print<span className="text-indigo-400">Thesis</span></span>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Admin Portal</div>
         </div>
         <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <SidebarLink to="/admin" icon={<DollarSign />} label="Dashboard Analytics" exact />
            <SidebarLink to="/admin/orders" icon={<FileText />} label="All Orders" />
            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Production Queue</div>
            <SidebarLink to="/admin/queue/new" icon={<AlertCircle />} label="New Orders" badge="1" />
            <SidebarLink to="/admin/queue/printing" icon={<Printer />} label="Printing Queue" badge="1" />
            <SidebarLink to="/admin/queue/binding" icon={<BookOpen />} label="Binding Queue" badge="1" />
            <SidebarLink to="/admin/queue/dispatch" icon={<Package />} label="Ready to Dispatch" badge="1" />
            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Management</div>
            <SidebarLink to="/admin/customers" icon={<Users />} label="Customers" />
         </nav>
         <div className="p-4 border-t border-gray-800">
           <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
             <LogOut className="w-5 h-5" />
             <span className="font-medium">Logout</span>
           </button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
           <div className="flex items-center text-gray-900 font-semibold text-lg">
             Order Management System
           </div>
           <div className="flex items-center space-x-4">
             <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
               Admin User
             </div>
             <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
               A
             </div>
           </div>
        </header>

        {/* Scrollable routing area */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
           <Routes>
             <Route path="/" element={<DashboardOverview />} />
             <Route path="/orders" element={<OrderList />} />
             <Route path="/orders/:id" element={<OrderDetails />} />
             <Route path="/queue/:type" element={<OrderList filterType="queue" />} />
             <Route path="*" element={<DashboardOverview />} />
           </Routes>
        </main>
      </div>
    </div>
  )
}

function SidebarLink({ to, icon, label, exact = false, badge }: any) {
  const location = useLocation();
  const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
  return (
    <Link to={to} className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
      <div className="flex items-center space-x-3">
        {React.cloneElement(icon, { className: "w-5 h-5" })}
        <span className="font-medium text-sm">{label}</span>
      </div>
      {badge && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
          {badge}
        </span>
      )}
    </Link>
  )
}

function DashboardOverview() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value="1,284" change="+12%" icon={<CheckSquare className="w-6 h-6 text-indigo-600"/>} />
        <StatCard title="Pending Review" value="14" change="+2" icon={<AlertCircle className="w-6 h-6 text-yellow-600"/>} />
        <StatCard title="In Production" value="28" change="-5" icon={<Printer className="w-6 h-6 text-blue-600"/>} />
        <StatCard title="Total Revenue" value="₹4.2L" change="+18%" icon={<DollarSign className="w-6 h-6 text-green-600"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Production Status</h3>
            <div className="space-y-4">
               <StatusProgress label="Pending" value={14} max={50} color="bg-yellow-500" />
               <StatusProgress label="Printing" value={18} max={50} color="bg-blue-500" />
               <StatusProgress label="Binding" value={10} max={50} color="bg-purple-500" />
               <StatusProgress label="Ready for Dispatch" value={22} max={50} color="bg-orange-500" />
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {MOCK_ORDERS.slice(0, 4).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                      {order.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.customerName} placed an order</p>
                      <p className="text-xs text-gray-500">{order.id} • {new Date(order.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">₹{order.totalAmount}</span>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  )
}

function StatusProgress({label, value, max, color}: any) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold text-gray-900">{value} orders</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  )
}

function StatCard({title, value, change, icon}: any) {
  const isUp = change.startsWith('+');
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
        <div className={`text-sm font-bold px-2 py-1 rounded-md ${isUp ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
           {change}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-500">{title}</div>
    </div>
  )
}

function OrderList({ filterType }: { filterType?: string }) {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Determine filter from path
  let activeFilter = 'All';
  if (location.pathname.includes('new')) activeFilter = 'Pending';
  if (location.pathname.includes('printing')) activeFilter = 'Printing';
  if (location.pathname.includes('binding')) activeFilter = 'Binding';
  if (location.pathname.includes('dispatch')) activeFilter = 'Ready for Dispatch';

  const filteredOrders = MOCK_ORDERS.filter(o => 
    (activeFilter === 'All' || o.status === activeFilter) &&
    (o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     o.mobile.includes(searchTerm))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{activeFilter === 'All' ? 'All Orders' : `${activeFilter} Queue`}</h1>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search ID, Name, Mobile..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID & Date</th>
                <th className="px-6 py-4 font-semibold">Customer Details</th>
                <th className="px-6 py-4 font-semibold">Print Info</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No orders found matching your criteria.</td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                   <td className="px-6 py-4">
                     <div className="font-mono font-bold text-indigo-600">{order.id}</div>
                     <div className="text-xs text-gray-500 mt-1 flex items-center"><Calendar className="w-3 h-3 mr-1"/> {new Date(order.date).toLocaleDateString()}</div>
                   </td>
                   <td className="px-6 py-4">
                     <div className="font-medium text-gray-900">{order.customerName}</div>
                     <div className="text-xs text-gray-500 mt-0.5">{order.mobile}</div>
                   </td>
                   <td className="px-6 py-4">
                     <div className="font-medium text-gray-800">{order.options.pages} Pages • {order.options.copies} Copies</div>
                     <div className="text-xs text-gray-500 mt-0.5 capitalize">{order.options.binding} Binding</div>
                   </td>
                   <td className="px-6 py-4">
                     <div className="font-bold text-gray-900">₹{order.totalAmount}</div>
                     <div className="text-[10px] font-bold text-green-600 uppercase mt-0.5">{order.payment.status}</div>
                   </td>
                   <td className="px-6 py-4">
                     <StatusBadge status={order.status} />
                   </td>
                   <td className="px-6 py-4 text-right">
                     <Link to={`/admin/orders/${order.id}`} className="inline-flex items-center justify-center p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition font-medium text-xs">
                       Manage <ChevronRight className="w-3.5 h-3.5 ml-1" />
                     </Link>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const getColors = () => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'File Verified': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Printing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Binding': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Ready for Dispatch': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Shipped': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${getColors()}`}>
      {status}
    </span>
  )
}

function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Find mock order
    const found = MOCK_ORDERS.find(o => o.id === id);
    if(found) setOrder({...found});
  }, [id]);

  if (!order) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;

  const handleStatusUpdate = (newStatus: string) => {
     setOrder({ ...order, status: newStatus });
     // In real app, call API to update status & trigger notifications
     alert(`Status updated to: ${newStatus}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
       <div className="flex items-center mb-6">
         <button onClick={() => navigate(-1)} className="mr-4 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
           <ArrowLeft className="w-5 h-5 text-gray-600" />
         </button>
         <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              Order {order.id}
              <span className="ml-4"><StatusBadge status={order.status} /></span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.date).toLocaleString()}</p>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Column - Details */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Customer & Payment Info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="p-5 border-b border-gray-200 bg-gray-50 font-bold text-gray-900 flex flex-col md:flex-row md:items-center justify-between">
                 <span>Customer Details</span>
                 <span className="text-sm font-medium text-gray-500 mt-2 md:mt-0 font-mono text-right md:text-left break-all">💳 TXN: {order.payment.id}</span>
               </div>
               <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Name</p>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Contact</p>
                    <p className="font-medium text-gray-900">{order.mobile}</p>
                    <p className="text-sm text-gray-500">{order.email}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Delivery Address</p>
                    <p className="font-medium text-gray-900">{order.address}</p>
                  </div>
               </div>
               <div className="bg-green-50 p-4 border-t border-green-100 flex justify-between items-center">
                 <div className="flex items-center text-green-800 font-bold">
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Payment Successful
                 </div>
                 <div className="text-2xl font-black text-green-900">₹{order.totalAmount}</div>
               </div>
            </div>

            {/* Print Preferences */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="p-5 border-b border-gray-200 bg-gray-50 font-bold text-gray-900">Printing & Binding Specs</div>
               <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Pages</p>
                      <p className="text-xl font-bold text-gray-900">{order.options.pages}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Color Mode</p>
                      <p className="text-sm font-bold text-gray-900 capitalize">{order.options.colorMode}</p>
                      {order.options.colorMode === 'mixed' && (
                        <p className="text-xs text-indigo-600 font-medium">{order.options.colorPages} Color Pages</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Paper Type</p>
                      <p className="text-sm font-bold text-gray-900 uppercase">{order.options.paperType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Copies</p>
                      <p className="text-xl font-bold text-gray-900">{order.options.copies}</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="flex items-start space-x-3">
                       <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><BookOpen className="w-5 h-5" /></div>
                       <div>
                         <p className="text-sm font-bold text-gray-900 capitalize">{order.options.binding} Binding</p>
                         <p className="text-xs text-gray-500">Cover Color: {order.options.coverColor}</p>
                       </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Special Instructions (If Any) */}
            {order.options.specialInstructions && (
              <div className="bg-amber-50 rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                 <div className="p-5 border-b border-amber-200 bg-amber-100/50 font-bold text-amber-900 flex items-center">
                   <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
                   Customer Special Instructions
                 </div>
                 <div className="p-6">
                    <p className="text-gray-800 whitespace-pre-wrap">{order.options.specialInstructions}</p>
                 </div>
              </div>
            )}

            {/* Files Management */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="p-5 border-b border-gray-200 bg-gray-50 font-bold text-gray-900 flex justify-between items-center">
                 <span>Uploaded Files</span>
                 <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Requires Verification</span>
               </div>
               <div className="p-6">
                  {order.files.map((file: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 mb-3 last:mb-0">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-indigo-600"><FileText className="w-6 h-6" /></div>
                        <div>
                          <p className="font-bold text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.size} • PDF Document</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                     <a href={file.downloadURL || file.url || '#'} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-600 hover:text-indigo-600 bg-white border border-gray-200 rounded-lg shadow-sm transition"><Eye className="w-4 h-4" /></a>
                     <a href={file.downloadURL || file.url || '#'} download target="_blank" rel="noopener noreferrer" className="p-2 text-gray-600 hover:text-indigo-600 bg-white border border-gray-200 rounded-lg shadow-sm transition"><Download className="w-4 h-4" /></a>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Right Column - Actions & Status */}
         <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
               <div className="p-5 border-b border-gray-200 bg-gray-900 text-white font-bold">
                 Admin Actions
               </div>
               <div className="p-6 space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Update Order Status</p>
                  
                  <AdminActionButton 
                    icon={<CheckSquare/>} label="Verify File & Approve" 
                    active={order.status === 'Pending'} 
                    onClick={() => handleStatusUpdate('File Verified')} 
                    color="text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100"
                  />
                  <AdminActionButton 
                    icon={<Printer/>} label="Start Printing" 
                    active={order.status === 'File Verified'} 
                    onClick={() => handleStatusUpdate('Printing')} 
                    color="text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                  />
                  <AdminActionButton 
                    icon={<BookOpen/>} label="Move to Binding" 
                    active={order.status === 'Printing'} 
                    onClick={() => handleStatusUpdate('Binding')} 
                    color="text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100"
                  />
                  <AdminActionButton 
                    icon={<Package/>} label="Mark Ready for Dispatch" 
                    active={order.status === 'Binding'} 
                    onClick={() => handleStatusUpdate('Ready for Dispatch')} 
                    color="text-orange-700 bg-orange-50 border-orange-200 hover:bg-orange-100"
                  />
                  
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Dispatch & Delivery</p>
                    <div className="space-y-3">
                      <div className="relative">
                        <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Tracking ID (e.g. BLUEDART123)" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <AdminActionButton 
                        icon={<Send/>} label="Mark Shipped" 
                        active={order.status === 'Ready for Dispatch'} 
                        onClick={() => handleStatusUpdate('Shipped')} 
                        color="text-cyan-700 bg-cyan-50 border-cyan-200 hover:bg-cyan-100"
                      />
                      <AdminActionButton 
                        icon={<CheckCircle2/>} label="Mark Delivered" 
                        active={order.status === 'Shipped'} 
                        onClick={() => handleStatusUpdate('Delivered')} 
                        color="text-green-700 bg-green-50 border-green-200 hover:bg-green-100"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Billing & Invoice</p>
                    <div className="flex space-x-3">
                      <button className="flex-1 flex items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-indigo-600 font-bold text-sm transition">
                        <Printer className="w-4 h-4 mr-2" /> Print
                      </button>
                      <button className="flex-1 flex items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-indigo-600 font-bold text-sm transition">
                        <Download className="w-4 h-4 mr-2" /> Invoice PDF
                      </button>
                    </div>
                  </div>

               </div>
            </div>
         </div>
       </div>
    </div>
  )
}

function AdminActionButton({icon, label, active, onClick, color}: any) {
  const baseClasses = "w-full flex items-center justify-between p-3 rounded-xl border font-bold text-sm transition-all";
  const disabledClasses = "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60";
  
  return (
    <button 
      disabled={!active}
      onClick={onClick}
      className={`${baseClasses} ${active ? color + ' shadow-sm' : disabledClasses}`}
    >
      <div className="flex items-center space-x-3">
        {React.cloneElement(icon, { className: "w-4 h-4" })}
        <span>{label}</span>
      </div>
      <ChevronRight className="w-4 h-4" />
    </button>
  )
}
