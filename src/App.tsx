import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Printer, Search, Menu, X, CheckSquare, Upload, Phone, User, Settings, Package, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Logo } from './components/Logo';

// Pages
import Home from './pages/Home';
import UploadThesis from './pages/UploadThesis';
import OrderTracking from './pages/OrderTracking';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import { Toaster } from 'sonner';

import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <Logo className="h-8" textClassName="text-lg" />
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-gray-800 hover:text-red-700 transition">Home</Link>
            <Link to="/pricing" className="text-sm font-medium text-gray-800 hover:text-red-700 transition">Pricing</Link>
            <Link to="/upload" className="text-sm font-medium text-gray-800 hover:text-red-700 transition">Upload Thesis</Link>
            <Link to="/track" className="text-sm font-medium text-gray-800 hover:text-red-700 transition">Track Order</Link>
            <Link to="/contact" className="text-sm font-medium text-gray-800 hover:text-red-700 transition">Contact</Link>
            
            <div className="flex items-center space-x-4 pl-8 border-l border-gray-200">
              {token ? (
                <div className="flex items-center space-x-4">
                  <Link to={user?.role === 'admin' ? "/admin" : "/dashboard"} className="flex items-center space-x-2 text-sm font-medium text-gray-800 hover:text-red-700">
                     <User className="w-5 h-5"/>
                     <span>Dashboard</span>
                  </Link>
                  <button onClick={async () => { await signOut(auth); localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/'; }} className="text-sm font-medium text-gray-500 hover:text-red-700 transition">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/auth" className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium transition flex items-center space-x-2 shadow-lg shadow-gray-900/20">
                    <User className="w-4 h-4"/>
                    <span>Customer Login</span>
                  </Link>
                  <Link to="/admin/login" className="bg-red-800 hover:bg-red-900 text-white px-5 py-2.5 rounded-full text-sm font-medium transition flex items-center space-x-2 shadow-lg shadow-red-900/20">
                    <User className="w-4 h-4"/>
                    <span>Admin Login</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-red-700 transition">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-4 shadow-xl">
          <Link to="/" className="block text-sm font-medium text-gray-700" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/pricing" className="block text-sm font-medium text-gray-700" onClick={() => setIsOpen(false)}>Pricing</Link>
          <Link to="/upload" className="block text-sm font-medium text-gray-700" onClick={() => setIsOpen(false)}>Upload Thesis</Link>
          <Link to="/track" className="block text-sm font-medium text-gray-700" onClick={() => setIsOpen(false)}>Track Order</Link>
          <Link to="/contact" className="block text-sm font-medium text-gray-700" onClick={() => setIsOpen(false)}>Contact</Link>
          <div className="pt-4 border-t border-gray-100 flex flex-col space-y-4">
             {token ? (
                <>
                  <Link to={user?.role === 'admin' ? "/admin" : "/dashboard"} className="block text-sm font-medium text-gray-700" onClick={() => setIsOpen(false)}>Dashboard</Link>
                  <button onClick={async () => { await signOut(auth); localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/'; }} className="block text-sm font-medium text-left text-gray-700">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="bg-gray-800 text-white text-center px-4 py-3 rounded-xl text-sm font-medium shadow-md flex items-center justify-center space-x-2" onClick={() => setIsOpen(false)}>
                    <User className="w-4 h-4"/> <span>Customer Login</span>
                  </Link>
                  <Link to="/admin/login" className="bg-red-800 text-white text-center px-4 py-3 rounded-xl text-sm font-medium shadow-md flex items-center justify-center space-x-2" onClick={() => setIsOpen(false)}>
                    <User className="w-4 h-4"/> <span>Admin Login</span>
                  </Link>
                </>
              )}
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer id="contact" className="bg-[#7B1113] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-6">
              <Logo className="h-8" textClassName="text-xl" lightText />
            </Link>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Professional thesis printing and binding services trusted by universities worldwide. Elevate your academic achievements.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-6 text-white">Services</h4>
            <ul className="space-y-4 text-sm text-white/80">
              <li><a href="#" className="hover:text-[#C59978] transition">Thesis Printing</a></li>
              <li><a href="#" className="hover:text-[#C59978] transition">Hardcover Binding</a></li>
              <li><a href="#" className="hover:text-[#C59978] transition">Spiral Binding</a></li>
              <li><a href="#" className="hover:text-[#C59978] transition">Same Day Delivery</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-6 text-white">Quick Links</h4>
            <ul className="space-y-4 text-sm text-white/80">
              <li><Link to="/pricing" className="hover:text-[#C59978] transition">Pricing Calculator</Link></li>
              <li><Link to="/upload" className="hover:text-[#C59978] transition">Upload Document</Link></li>
              <li><Link to="/track" className="hover:text-[#C59978] transition">Track Order</Link></li>
              <li><a href="#" className="hover:text-[#C59978] transition">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-6 text-white">Contact Us</h4>
            <ul className="space-y-4 text-sm text-white/80">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 flex-shrink-0 text-[#C59978]" />
                <span>Delhi, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#C59978]" />
                <span>+91-9560597115</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#C59978]" />
                <span>support@lagunyaprints.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-white/60">&copy; {new Date().getFullYear()} Lagunya Print. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
             <a href="#" className="text-sm text-white/60 hover:text-white transition">Privacy Policy</a>
             <a href="#" className="text-sm text-white/60 hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<UploadThesis />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/track" element={<OrderTracking />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard/*" element={<UserDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      <Toaster position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
