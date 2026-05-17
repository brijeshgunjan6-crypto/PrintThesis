import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPagePrice, getBindingPrice, formatCurrency, PAPER_PRICES, BINDING_PRICES } from '../lib/pricing';

export function QuickCalculator() {
  const [pages, setPages] = useState(100);
  const [colorPages, setColorPages] = useState(10);
  const [paper, setPaper] = useState('85gsm');
  const [binding, setBinding] = useState('hard');
  const [copies, setCopies] = useState(1);

  const bwPagesCount = Math.max(0, pages - colorPages);
  
  const bwPrice = getPagePrice(paper, 'bw');
  const colorPrice = getPagePrice(paper, 'color');
  const bindingPrice = getBindingPrice(binding);

  const calculateSubtotal = () => {
    return ((bwPagesCount * bwPrice) + (colorPages * colorPrice) + bindingPrice) * copies;
  };

  const calculateTotal = () => {
    return calculateSubtotal() * 1.18; // +18% GST
  };

  return (
    <div className="w-full h-full bg-[#09090b] rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 flex flex-col relative overflow-hidden text-white transition-all duration-500 ring-1 ring-white/5 hover:ring-white/10 z-20">
      {/* Decorative premium gradients */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8 relative z-10 transition-transform duration-500">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3.5 rounded-2xl text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] ring-1 ring-white/20">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm flex items-center gap-2">
            Instant Quote <Sparkles className="w-5 h-5 text-yellow-400" />
          </h2>
          <p className="text-sm font-medium mt-1 text-white/50 tracking-wide">Calculate your printing cost instantly</p>
        </div>
      </div>

      <div className="flex flex-col space-y-6 relative z-10 w-full mb-8">
        {/* Sliders Container */}
        <div className="space-y-6">
          {/* Total Pages */}
          <div className="group/slider">
            <div className="flex justify-between mb-3 items-end">
              <label className="text-sm font-semibold text-white/80 group-hover/slider:text-white transition-colors">Total Pages</label>
              <div className="bg-white/10 px-3 py-1 rounded-lg text-indigo-300 font-mono text-sm font-bold border border-white/5">{pages}</div>
            </div>
            <input 
              type="range" min="10" max="1000" value={pages} 
              onChange={e => {
                const val = parseInt(e.target.value);
                setPages(val);
                if (colorPages > val) setColorPages(val);
              }} 
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none flex cursor-pointer accent-indigo-500 hover:bg-white/20 transition-colors" 
            />
          </div>

          {/* Color Pages */}
          <div className="group/slider">
            <div className="flex justify-between mb-3 items-end">
              <label className="text-sm font-semibold text-white/80 group-hover/slider:text-white transition-colors">Color Pages</label>
              <div className="bg-white/10 px-3 py-1 rounded-lg text-indigo-300 font-mono text-sm font-bold border border-white/5">{colorPages}</div>
            </div>
            <input 
              type="range" min="0" max={pages} value={colorPages} 
              onChange={e => setColorPages(parseInt(e.target.value))} 
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none flex cursor-pointer accent-indigo-500 hover:bg-white/20 transition-colors" 
            />
          </div>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Paper Quality</label>
            <div className="relative">
              <select 
                value={paper} 
                onChange={e => setPaper(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none font-medium transition-all hover:bg-white/10"
              >
                {Object.entries(PAPER_PRICES).map(([key, value]) => (
                  <option key={key} value={key} className="bg-gray-900">{value.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-white/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Binding Type</label>
            <div className="relative">
              <select 
                value={binding} 
                onChange={e => setBinding(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none font-medium transition-all hover:bg-white/10"
              >
                {Object.entries(BINDING_PRICES).map(([key, value]) => (
                  <option key={key} value={key} className="bg-gray-900">{value.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-white/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copies */}
        <div className="flex justify-between items-center bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm mt-2">
           <label className="text-sm font-semibold text-white/90">Number of Copies</label>
           <div className="flex items-center space-x-2 bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner">
             <button title="Decrease" aria-label="Decrease" onClick={() => setCopies(Math.max(1, copies-1))} className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all font-bold text-white hover:scale-105 active:scale-95 border border-white/5">-</button>
             <span className="w-8 text-center font-mono font-bold text-white text-lg">{copies}</span>
             <button title="Increase" aria-label="Increase" onClick={() => setCopies(copies+1)} className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all font-bold text-white hover:scale-105 active:scale-95 border border-white/5">+</button>
           </div>
        </div>
      </div>

      {/* Summary Bottom */}
      <div className="mt-auto pt-6 border-t border-white/10 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col">
          <span className="text-xs text-indigo-300 uppercase tracking-wider font-bold mb-1.5 flex items-center">
            Total (Inc. GST)
          </span>
          <motion.span 
            key={calculateTotal()}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-xl"
          >
            {formatCurrency(calculateTotal())}
          </motion.span>
        </div>

        <Link to="/upload" className="group/btn relative inline-flex items-center justify-center px-8 py-4 bg-white text-black rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] overflow-hidden shrink-0 flex-1 sm:flex-none">
          <span className="relative z-10 text-lg">Place Order</span> 
          <ArrowRight className="relative z-10 w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>
      
    </div>
  );
}
