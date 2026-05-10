import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle, ArrowRight, ShieldCheck, Zap, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.email || !form.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Your message has been sent successfully.');
      setForm({ name: '', mobile: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-[#7B1113] text-white">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80" 
            alt="Support Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#7B1113]/80 to-[#7B1113]"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-black mb-6"
          >
            Contact Lagunya Prints
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-indigo-100 max-w-2xl mx-auto"
          >
            We're here to help with thesis printing, binding, bulk orders, and delivery support.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 -mt-10 relative z-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
            
            {/* LEFT SIDE: Contact Info */}
            <div className="w-full lg:w-5/12 space-y-8">
              
              {/* Phone Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-white"
              >
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Phone className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Phone Support</h3>
                <p className="text-gray-500 mb-6 text-lg">+91-9560597115</p>
                <a 
                  href="tel:+919560597115"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-[#7B1113] text-white font-bold rounded-xl shadow-md hover:bg-[#600f11] hover:shadow-lg transition-all"
                >
                  Call Now
                </a>
              </motion.div>

              {/* Email Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-white"
              >
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-500 mb-6 text-lg">support@lagunyaprints.com</p>
                <a 
                  href="mailto:support@lagunyaprints.com"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-[#7B1113] text-white font-bold rounded-xl shadow-md hover:bg-[#600f11] hover:shadow-lg transition-all"
                >
                  Send Email
                </a>
              </motion.div>

              {/* Business Hours & Highlights */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6"
              >
                <div>
                  <h4 className="font-bold text-gray-900 flex items-center text-lg mb-4">
                    <Clock className="w-5 h-5 mr-3 text-indigo-500" /> Working Hours
                  </h4>
                  <ul className="space-y-2 text-gray-600 ml-8">
                    <li className="flex justify-between"><span>Mon - Sat:</span> <span className="font-medium text-gray-900">9:00 AM – 8:00 PM</span></li>
                    <li className="flex justify-between"><span>Sunday:</span> <span className="text-indigo-600 font-medium">Limited Support</span></li>
                  </ul>
                </div>
                
                <div className="pt-6 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">Support Highlights</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Zap className="w-5 h-5 mr-3 text-yellow-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600">Fast Response Support</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="w-5 h-5 mr-3 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600">Thesis Printing Assistance</span>
                    </li>
                    <li className="flex items-start">
                      <Truck className="w-5 h-5 mr-3 text-blue-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600">Order Tracking & Delivery Help</span>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-6 border-t border-gray-100">
                  <a 
                    href="https://wa.me/919560597115"
                    target="_blank" rel="noopener noreferrer"
                    className="flex justify-center items-center w-full px-6 py-4 bg-[#25D366] text-white font-bold rounded-xl shadow-md hover:bg-[#20bd5a] hover:shadow-lg transition-all"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" /> Chat on WhatsApp
                  </a>
                </div>
              </motion.div>
            </div>

            {/* RIGHT SIDE: Contact Form */}
            <div className="w-full lg:w-7/12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-indigo-100/40 border border-gray-100 h-full"
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">Send an Inquiry</h2>
                  <p className="text-gray-500">Fill out the form below and our team will get back to you within 24 hours.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                      <input 
                        type="text" 
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number *</label>
                      <input 
                        type="tel" 
                        value={form.mobile}
                        onChange={e => setForm({...form, mobile: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                      <input 
                        type="email" 
                        value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                      <input 
                        type="text" 
                        value={form.subject}
                        onChange={e => setForm({...form, subject: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                        placeholder="e.g. Bulk Order Inquiry"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Message *</label>
                    <textarea 
                      value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition h-40 resize-none"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex justify-center items-center px-8 py-4 bg-[#7B1113] text-white font-bold rounded-xl shadow-lg shadow-[#7B1113]/20 hover:bg-[#600f11] transition-all disabled:bg-[#7B1113]/50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>Send Message <Send className="w-5 h-5 ml-2" /></>
                      )}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setForm({ name: '', mobile: '', email: '', subject: '', message: '' })}
                      className="px-8 py-4 bg-white text-gray-600 border border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition"
                    >
                      Reset Form
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Visit Our Office</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Drop by our printing facility to review paper qualities, binding samples, or pick up your bulk orders.</p>
          </div>
          
          <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50 w-full h-[400px] relative">
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <MapPin className="w-16 h-16 mb-4 text-indigo-300" />
                <p className="font-medium text-lg">Google Maps Integration Area</p>
                <p className="text-sm">Location details will be displayed here</p>
             </div>
             {/* Replace this div with an actual iframe from Google Maps embed when true location is available */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-50 border-t border-indigo-100">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-serif font-black text-gray-900 mb-6">Need Urgent Thesis Printing?</h2>
          <p className="text-xl text-gray-600 mb-10">Upload your file now and we'll ensure fast, premium delivery across India.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={() => navigate('/upload')}
              className="px-8 py-4 bg-[#7B1113] text-white font-bold rounded-xl shadow-lg shadow-[#7B1113]/20 hover:bg-[#600f11] transition hover:-translate-y-1 flex items-center justify-center text-lg"
            >
              Upload Thesis <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <a 
               href="tel:+919560597115"
               className="px-8 py-4 bg-white text-[#7B1113] font-bold rounded-xl border border-[#C59978] shadow-sm hover:bg-[#7B1113]/10 transition flex items-center justify-center text-lg"
            >
              <Phone className="w-5 h-5 mr-2" /> Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
