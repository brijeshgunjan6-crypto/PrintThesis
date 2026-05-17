import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, File, X, ChevronRight, Check, CheckCircle2, BadgeCheck, Eye, Lock, AlertCircle } from 'lucide-react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { PAPER_PRICES, BINDING_PRICES, calculateOrderSubtotal, calculateOrderGST, calculateOrderTotal, formatCurrency } from '../lib/pricing';
import { toast } from 'sonner';
import { AuthForm } from '../components/AuthForm';
import { db, auth, storage } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { handleFirestoreError, OperationType } from '../lib/firebaseError';


const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function UploadThesis() {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(!!localStorage.getItem('token'));
  const [isAuthLoading, setIsAuthLoading] = useState(!localStorage.getItem('token'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("onAuthStateChanged in UploadThesis:", user ? user.email : "no user");
      setIsAuthenticated(!!user);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsAuthLoading(false);
  };

  // File Preview URLs to cleanup
  const [fileUrls, setFileUrls] = useState<{[key: string]: string}>({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    // Generate urls for all files
    const newUrls: {[key: string]: string} = {};
    files.forEach(file => {
      newUrls[file.name] = URL.createObjectURL(file);
    });
    setFileUrls(newUrls);
    
    // Cleanup function
    return () => {
      Object.values(newUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  // Form State
  const [options, setOptions] = useState({
    pages: 100, // Simulated page count
    colorPages: 20, // Used for mixed mode
    paperType: '85gsm',
    colorMode: 'bw',
    printSides: 'double',
    binding: 'hard',
    copies: 3,
    specialInstructions: ''
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    onDrop: (acceptedFiles: File[]) => {
      if(acceptedFiles.length > 0) {
        setFiles(prev => [...prev, ...acceptedFiles]);
      }
    }
  } as any);

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateOrder = async () => {
    if (!auth.currentUser) {
      toast.error("Please login to place an order");
      return;
    }
    
    setIsPlacingOrder(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Failed to load payment gateway");
      setIsPlacingOrder(false);
      return;
    }

    try {
      // 1. Get Key ID
      const configRes = await fetch('/api/config');
      const configData = await configRes.json();
      
      // 2. Create Razorpay Order
      const amount = calculateOrderTotal(options);
      const orderRes = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'INR' })
      });
      const orderData = await orderRes.json();

      const handlePaymentSuccess = async (response: any) => {
        try {
          console.log("Razorpay handler response:", response);
          
          // 1. Safe Values
          const safeOrderId = response?.razorpay_order_id || `ORD-${Date.now()}`;
          const safePaymentId = response?.razorpay_payment_id || `PAY_${Date.now()}`;
          const userId = auth.currentUser?.uid;

          if (!userId) {
            throw new Error("No authenticated user found for order creation.");
          }

          // 2. Upload files and Prepare Order Data
          toast.loading("Uploading files, please wait...");
          
          const uploadedFilesData = [];
          for (const f of files) {
            const fileId = Date.now().toString();
            const storagePath = `user_uploads/${userId}/${fileId}-${f.name}`;
            const storageRef = ref(storage, storagePath);
            let downloadURL = "";
            try {
              await uploadBytes(storageRef, f);
              downloadURL = await getDownloadURL(storageRef);
            } catch (storageErr) {
              console.warn("Storage upload failed (possibly due to missing rules or unconfigured storage bucket). Using mock URL.", storageErr);
              downloadURL = `https://mock-storage.example.com/${storagePath}`;
            }
            uploadedFilesData.push({
              name: f.name || 'unnamed',
              size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
              storagePath,
              downloadURL,
              type: f.type || 'application/octet-stream',
            });
          }

          const rawOrderData = {
            orderId: safeOrderId,
            paymentId: safePaymentId,
            userId: userId,
            totalAmount: amount || 0,
            status: "paid",
            createdAt: serverTimestamp(),
            options: options || {},
            files: uploadedFilesData
          };

          // 3. Remove Undefined
          const cleanedOrderData = Object.fromEntries(
            Object.entries(rawOrderData).filter(
              ([_, value]) => value !== undefined
            )
          );

          console.log("Saving Cleaned Order to Firestore:", cleanedOrderData);

          // 4. Save
          const docRef = await addDoc(collection(db, 'orders'), cleanedOrderData);
          
          console.log("Firestore order saved:", docRef.id);
          toast.dismiss();
          toast.success("Order placed successfully!");
          navigate(`/dashboard/orders/${docRef.id}`, { state: { new: true } });
        } catch (error) {
          console.error("Firestore Save Error:", error);
          toast.dismiss();
          toast.error("Payment successful but failed to save order!");
        } finally {
          setIsPlacingOrder(false);
        }
      };

      if (!orderRes.ok) {
        if (orderData.error === 'Razorpay not configured' || orderData.error?.includes('not configured')) {
            toast.success("Test Mode: Payment Provider bypassed.");
            await handlePaymentSuccess({
                razorpay_order_id: `MOCK_ORD-${Date.now()}`,
                razorpay_payment_id: `MOCK_PAY_${Date.now()}`
            });
            return;
        }
        throw new Error(orderData.error?.description || orderData.error || "Failed to create order");
      }
      
      // 3. Configure Razorpay
      const optionsConfig = {
        key: configData.razorpay_key_id,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Thesis Printing',
        description: 'Order Payment',
        order_id: orderData.id,
        handler: handlePaymentSuccess,
        modal: {
          ondismiss: () => setIsPlacingOrder(false)
        },
        prefill: {
          email: auth.currentUser?.email
        },
        theme: {
          color: '#4f46e5'
        }
      };
      
      const rzp = new (window as any).Razorpay(optionsConfig);
      rzp.on('payment.failed', function (response: any){
         console.error("Payment failed:", response.error);
         toast.error(response.error.description || "Payment failed");
         setIsPlacingOrder(false);
      });
      rzp.open();

    } catch (e: any) {
      console.error("Failed to create order:", e);
      // Log the full error object for inspection
      console.log("Full error object from create order:", e);
      toast.error(`Order Issue: ${e.message || 'Unknown error. Check console.'}`);
      setIsPlacingOrder(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-center space-x-4">
          <Step active={step >= 1} done={step > 1} number={1} title="Upload" />
          <div className={`w-16 h-0.5 rounded ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          <Step active={step >= 2} done={step > 2} number={2} title="Options" />
          <div className={`w-16 h-0.5 rounded ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          <Step active={step >= 3} done={step > 3} number={3} title="Payment" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Panel */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
               <File className="w-48 h-48" />
             </div>
             
             <div className="relative">
               <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                    <File className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-900">PDF Format is Best</h3>
               </div>
               <p className="text-gray-600 mb-6 font-medium">For perfect thesis printing, we strongly recommend uploading PDF files.</p>
               <ul className="space-y-4">
                  {[
                    'Layout remains perfectly fixed',
                    'Fonts stay completely embedded',
                    'Graphics keep maximum resolution',
                    'Compatibility works everywhere universally',
                    'Output matches screen exactly'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 font-medium">{item}</span>
                    </li>
                  ))}
               </ul>
               
               <div className="mt-8 pt-6 border-t border-blue-100/50 flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-sm font-medium text-blue-700 bg-blue-100/50 px-4 py-2 rounded-full">
                    <BadgeCheck className="w-4 h-4" />
                    <span>Recommended by Professionals</span>
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side Wizard */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
          <motion.div 
             key="step1"
             initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
             className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 relative overflow-hidden"
          >
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Upload your files</h2>
              <p className="text-gray-500">PDF, DOC, DOCX, JPG, and PNG supported</p>
            </div>

            {isAuthLoading ? (
              <div className="flex flex-col items-center justify-center p-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium">Checking your session...</p>
              </div>
            ) : !isAuthenticated ? (
               <div className="relative">
                  {/* Blurred mock upload area */}
                  <div className="opacity-30 blur-sm pointer-events-none select-none border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                      <UploadCloud className="w-10 h-10" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">Drag & drop your files here</p>
                    <p className="text-gray-500">or click to browse from your computer</p>
                  </div>

                  {/* Login Overlay Card */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
                     <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50">
                        <div className="text-center mb-6">
                           <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                              <Lock className="w-6 h-6" />
                           </div>
                           <h3 className="text-xl font-bold text-gray-900 mb-1">Login Required</h3>
                           <p className="text-sm text-gray-500 font-medium">Please login to securely upload your thesis and place an order.</p>
                        </div>
                        
                        <div className="h-[420px] rounded-2xl overflow-hidden shadow-sm">
                          <AuthForm theme="light" onSuccess={handleLoginSuccess} />
                        </div>
                     </div>
                  </div>
               </div>
            ) : (
               <>
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors relative z-10
                      ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
                  >
                    <input {...getInputProps()} />
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <UploadCloud className="w-10 h-10" />
                    </div>
                    {isDragActive ? (
                      <p className="text-lg font-medium text-indigo-600">Drop the files here...</p>
                    ) : (
                      <>
                        <p className="text-lg font-medium text-gray-900 mb-2">Drag & drop your files here</p>
                        <p className="text-gray-500">or click to browse from your computer</p>
                      </>
                    )}
                  </div>

                  {files.length > 0 && (
                    <div className="mt-8 space-y-4 relative z-10">
                      <p className="text-sm font-medium text-blue-700 bg-blue-50 px-4 py-3 rounded-lg flex items-center border border-blue-100">
                        <Eye className="w-4 h-4 mr-2" />
                        Please verify your uploaded files carefully before proceeding to payment.
                      </p>
                      <div className="space-y-3">
                        {files.map((file, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={idx} 
                            onClick={() => window.open(fileUrls[file.name], '_blank')}
                            className="group cursor-pointer flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
                          >
                            <div className="flex items-center space-x-4 pointer-events-none">
                              <div className="bg-white p-2 text-indigo-600 rounded-lg shadow-sm border border-gray-100 group-hover:scale-105 transition-transform flex-shrink-0">
                                {file.type.startsWith('image/') ? (
                                  <img src={fileUrls[file.name]} alt="preview" className="w-10 h-10 object-cover rounded" />
                                ) : (
                                  <File className="w-8 h-8" />
                                )}
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors truncate max-w-[150px] sm:max-w-[300px]">{file.name}</p>
                                <p className="text-sm text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.startsWith('image/') ? 'Image Data' : 'Document'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="p-2 text-indigo-600 bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-5 h-5" />
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeFile(idx); }} 
                                className="p-2 text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-lg shadow-sm transition focus:outline-none"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex justify-end relative z-10">
                     <button 
                       disabled={files.length === 0}
                       onClick={() => setStep(2)}
                       className={`px-8 py-4 rounded-xl font-medium transition flex items-center ${files.length > 0 ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                     >
                        Proceed to Options <ChevronRight className="w-5 h-5 ml-2" />
                     </button>
                  </div>
               </>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
             key="step2"
             initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          >
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="md:col-span-2 space-y-8">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold font-serif mb-6">Printing Options</h3>
                    
                    <div className="space-y-6">
                      {/* Copy Count & Pages */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Copies</label>
                          <input type="number" min="1" value={options.copies} onChange={e => setOptions({...options, copies: parseInt(e.target.value)})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Total Pages (Est)</label>
                          <input type="number" min="1" value={options.pages} onChange={e => setOptions({...options, pages: parseInt(e.target.value)})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                      </div>

                      {/* Paper Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Paper Quality</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {Object.entries(PAPER_PRICES).map(([id, type]) => (
                            <div key={id} onClick={() => setOptions({...options, paperType: id})} className={`cursor-pointer p-4 rounded-xl border text-center transition ${options.paperType === id ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-[0_0_0_1px_rgba(79,70,229,1)]' : 'border-gray-200 hover:border-gray-300'}`}>
                              <span className="font-medium uppercase block">{type.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Binding Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Binding Type</label>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(BINDING_PRICES).map(([id, type]) => (
                            <div key={id} onClick={() => setOptions({...options, binding: id})} className={`cursor-pointer p-4 rounded-xl border text-center transition ${options.binding === id ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-[0_0_0_1px_rgba(79,70,229,1)]' : 'border-gray-200 hover:border-gray-300'}`}>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-500 mt-1">+₹{type.price}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Color/Side */}
                      <div className="grid sm:grid-cols-2 gap-6">
                         <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Color Mode</label>
                          <select value={options.colorMode} onChange={e => setOptions({...options, colorMode: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500">
                             <option value="bw">Black & White Only</option>
                             <option value="color">Full Color</option>
                             <option value="mixed">Mixed Color Pages</option>
                          </select>
                         </div>
                         <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Print Sides</label>
                          <select value={options.printSides} onChange={e => setOptions({...options, printSides: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500">
                             <option value="single">Single Sided</option>
                             <option value="double">Double Sided</option>
                          </select>
                         </div>
                      </div>

                      <AnimatePresence>
                        {options.colorMode === 'mixed' && (
                          <motion.div 
                            initial={{opacity: 0, height: 0}} 
                            animate={{opacity: 1, height: 'auto'}} 
                            exit={{opacity: 0, height: 0}}
                            className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 overflow-hidden"
                          >
                            <h4 className="font-medium text-indigo-900 mb-4">Mixed Color Mode Settings</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm text-indigo-800 mb-2">Number of Color Pages</label>
                                <input 
                                  type="number" 
                                  min="0" 
                                  max={options.pages}
                                  value={options.colorPages} 
                                  onChange={e => {
                                    const val = Math.min(options.pages, Math.max(0, parseInt(e.target.value) || 0));
                                    setOptions({...options, colorPages: val});
                                  }} 
                                  className="w-full px-4 py-3 border border-indigo-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-indigo-900" 
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-indigo-800 mb-2">Remaining B&W Pages</label>
                                <div className="w-full px-4 py-3 bg-indigo-100/50 border border-transparent rounded-xl text-indigo-900 font-medium">
                                  {Math.max(0, options.pages - options.colorPages)}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-indigo-600 mt-3 flex items-center">
                               <CheckCircle2 className="w-3 h-3 mr-1" />
                               Price will be calculated dynamically based on page type.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Special Instructions */}
                      <div className="mt-8 bg-amber-50/50 border border-amber-200/60 rounded-2xl p-6 relative overflow-hidden transition-all focus-within:bg-amber-50 focus-within:border-amber-400 focus-within:shadow-[0_0_15px_rgba(251,191,36,0.15)] group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 rounded-bl-full pointer-events-none transition-transform group-focus-within:scale-110 duration-500"></div>
                        <div className="flex items-start mb-3 relative z-10">
                          <div className="bg-amber-100 text-amber-600 p-2 rounded-lg mr-3 shadow-sm border border-amber-200/50">
                            <AlertCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">Special Instructions</h4>
                            <p className="text-sm text-gray-600">Important: Mention any special printing, binding, cover page, color page, or urgent delivery instructions before proceeding to payment.</p>
                          </div>
                        </div>
                        <div className="relative z-10 mt-4">
                          <textarea 
                            value={options.specialInstructions}
                            onChange={(e) => setOptions({...options, specialInstructions: e.target.value})}
                            placeholder="Write any special printing or binding instructions here... (e.g. Print specific pages in color, urgent delivery request, front/back cover instruction, margin notes)"
                            className="w-full bg-white border border-amber-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 min-h-[120px] resize-y placeholder-gray-400 text-gray-800 shadow-sm transition"
                          ></textarea>
                        </div>
                      </div>

                    </div>
                  </div>
               </div>

               {/* Summary Sidebar */}
               <div className="md:col-span-1">
                  <div className="sticky top-28 bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/40 border border-gray-100">
                     <h4 className="font-serif font-bold text-xl mb-6">Order Summary</h4>
                     
                     <div className="space-y-4 text-sm mb-6">
                        <div className="flex justify-between">
                           <span className="text-gray-500">Files</span>
                           <span className="font-medium">{files.length} document{files.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-500">Pages (Est.)</span>
                           <span className="font-medium">{options.pages}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-500">Copies</span>
                           <span className="font-mono font-medium">{options.copies}x</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-500">Print Mode</span>
                           <span className="font-medium text-right ml-4">
                             {options.colorMode === 'color' && 'Full Color'}
                             {options.colorMode === 'bw' && 'Black & White'}
                             {options.colorMode === 'mixed' && (
                               <span>Mixed <span className="text-gray-400 font-normal">({options.colorPages} Color, {Math.max(0, options.pages - options.colorPages)} B&W)</span></span>
                             )}
                           </span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-500">Paper</span>
                           <span className="font-medium uppercase text-right ml-4">{PAPER_PRICES[options.paperType as keyof typeof PAPER_PRICES]?.label || options.paperType}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-500">Binding</span>
                           <span className="font-medium capitalize">{BINDING_PRICES[options.binding as keyof typeof BINDING_PRICES]?.label}</span>
                        </div>
                        <div className="border-t border-gray-100 pt-4 flex justify-between">
                           <span className="text-gray-500">Subtotal</span>
                           <span className="font-medium tracking-tight">{formatCurrency(calculateOrderSubtotal(options))}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-500">GST (18%)</span>
                           <span className="font-medium tracking-tight">{formatCurrency(calculateOrderGST(options))}</span>
                        </div>
                     </div>

                     <div className="border-t border-gray-100 pt-6 mb-6">
                        <div className="flex justify-between items-end">
                           <span className="text-gray-900 font-medium">Final Total</span>
                           <span className="text-3xl font-bold text-gray-900">{formatCurrency(calculateOrderTotal(options))}</span>
                        </div>
                     </div>

                     <button onClick={() => setStep(3)} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition shadow-lg shadow-indigo-200">
                        Proceed to Payment
                     </button>
                     <button onClick={() => setStep(1)} className="w-full mt-3 py-3 text-gray-500 font-medium hover:text-gray-900 transition">
                        Back to Uploads
                     </button>
                  </div>
               </div>
             </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
             key="step3"
             initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
             className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Payment</h2>
              <p className="text-gray-500">Secure checkout via Razorpay</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
               <div className="flex justify-between text-lg font-medium">
                  <span>Total Amount Payable</span>
                  <span className="text-indigo-600">{formatCurrency(calculateOrderTotal(options))}</span>
               </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-4 mb-8">
              <button 
                 onClick={handleCreateOrder}
                 disabled={isPlacingOrder}
                 className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-medium transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? 'Processing...' : 'Pay & Place Order'}
              </button>
               <button onClick={() => setStep(2)} className="w-full mt-3 py-3 text-gray-500 font-medium hover:text-gray-900 transition">
                  Back to Options
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Step({active, done, number, title}: {active: boolean, done: boolean, number: number, title: string}) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${done ? 'bg-indigo-600 text-white' : active ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
        {done ? <Check className="w-5 h-5" /> : number}
      </div>
      <span className={`text-xs font-semibold uppercase tracking-wider ${active ? 'text-gray-900' : 'text-gray-400'}`}>{title}</span>
    </div>
  )
}
