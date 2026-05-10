import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPagePrice, getBindingPrice, formatCurrency, PAPER_PRICES, BINDING_PRICES } from '../lib/pricing';

export default function Pricing() {
  const [pages, setPages] = useState(100);
  const [copies, setCopies] = useState(1);
  const [colorPages, setColorPages] = useState(10);
  const [paper, setPaper] = useState('85gsm');
  const [binding, setBinding] = useState('hard');

  const bwPagesCount = Math.max(0, pages - colorPages);
  
  const bwPrice = getPagePrice(paper, 'bw');
  const colorPrice = getPagePrice(paper, 'color');
  const bindingPrice = getBindingPrice(binding);

  const calculateSubtotal = () => {
    let cost = 0;
    
    cost += bwPagesCount * bwPrice;
    cost += colorPages * colorPrice;
    
    // Binding
    cost += bindingPrice;
    
    return cost * copies;
  }

  const calculateGST = () => {
    return calculateSubtotal() * 0.18;
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGST();
  }

  const printCostPerCopy = (bwPagesCount * bwPrice) + (colorPages * colorPrice);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Pricing Calculator</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Transparent pricing. No hidden fees. Get an instant quote for your thesis printing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Calculator Interface */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
           <div className="flex items-center space-x-3 mb-8">
              <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                 <Calculator className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold font-serif text-gray-900">Calculate Cost</h2>
           </div>

           <div className="space-y-6">
             <div>
                <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-gray-700">Total Pages</label>
                   <span className="text-indigo-600 font-mono font-medium">{pages}</span>
                </div>
                <input type="range" min="10" max="1000" value={pages} onChange={e => {setPages(parseInt(e.target.value)); if(colorPages > parseInt(e.target.value)) setColorPages(parseInt(e.target.value));}} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
             </div>

             <div>
                <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-gray-700">Color Pages</label>
                   <span className="text-indigo-600 font-mono font-medium">{colorPages}</span>
                </div>
                <input type="range" min="0" max={pages} value={colorPages} onChange={e => setColorPages(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
             </div>

             <div className="grid grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paper Quality</label>
                  <select value={paper} onChange={e => setPaper(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none">
                    {Object.entries(PAPER_PRICES).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Binding Type</label>
                  <select value={binding} onChange={e => setBinding(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none">
                    {Object.entries(BINDING_PRICES).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
               </div>
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Copies</label>
                <div className="flex items-center space-x-4">
                  <button onClick={() => setCopies(Math.max(1, copies-1))} className="w-12 h-12 rounded-xl border border-gray-200 flex flex-center items-center justify-center text-gray-500 hover:bg-gray-50">-</button>
                  <span className="w-12 text-center text-xl font-medium font-mono">{copies}</span>
                  <button onClick={() => setCopies(copies+1)} className="w-12 h-12 rounded-xl border border-gray-200 flex flex-center items-center justify-center text-gray-500 hover:bg-gray-50">+</button>
                </div>
             </div>
           </div>
        </div>

        {/* Live Summary */}
        <div className="sticky top-28 bg-[#0a0a0a] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
           <h3 className="text-2xl font-serif font-bold mb-8 relative z-10">Estimated Quote</h3>
           
           <div className="space-y-4 mb-8 relative z-10 font-mono text-sm">
             <div className="flex justify-between pb-4 border-b border-white/10">
                <span className="text-gray-400">Print Cost ({bwPagesCount} B&amp;W, {colorPages} Color)</span>
                <span>{formatCurrency(printCostPerCopy)} / copy</span>
             </div>
             <div className="flex justify-between pb-4 border-b border-white/10">
                <span className="text-gray-400">Binding ({BINDING_PRICES[binding as keyof typeof BINDING_PRICES]?.label})</span>
                <span>{formatCurrency(bindingPrice)} / copy</span>
             </div>
             <div className="flex justify-between pt-4">
                <span className="text-gray-400">Copies</span>
                <span>x {copies}</span>
             </div>
             <div className="flex justify-between pt-4 border-t border-white/10">
                <span className="text-gray-400">Subtotal</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
             </div>
             <div className="flex justify-between pt-4 pb-4 border-b border-white/10">
                <span className="text-gray-400">GST (18%)</span>
                <span>{formatCurrency(calculateGST())}</span>
             </div>
           </div>

           <div className="flex justify-between items-end mb-10 relative z-10">
              <span className="text-xl font-medium">Final Total</span>
              <motion.span 
                 key={calculateTotal()}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-5xl font-bold tracking-tighter"
              >
                 {formatCurrency(calculateTotal())}
              </motion.span>
           </div>

           <Link to="/upload" className="w-full inline-flex justify-center items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition">
              Start Order <ArrowRight className="ml-2 w-5 h-5"/>
           </Link>
        </div>
      </div>
    </div>
  )
}


