import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Lock, User, Eye, EyeOff, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toast } from 'sonner';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

interface AuthFormProps {
  theme?: 'dark' | 'light';
  onSuccess?: () => void;
}

export function AuthForm({ theme = 'light', onSuccess }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [authStep, setAuthStep] = useState<'form' | 'verification'>('form');

  // Form states
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const primaryColor = theme === 'dark' ? 'bg-[#C59978] hover:bg-[#b08768] text-gray-900' : 'bg-indigo-600 hover:bg-indigo-700 text-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedColor = theme === 'dark' ? 'text-white/60' : 'text-gray-500';
  const inputBg = theme === 'dark' ? 'bg-white text-gray-900 placeholder-gray-500' : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-indigo-500';
  const inputFocus = theme === 'dark' ? 'focus:ring-[#C59978]' : 'focus:ring-indigo-500';
  const cardOuter = theme === 'dark' ? 'bg-[#360806] border-[#5d120f]' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50';
  
  const handleSuccessRedirect = (userObj: any) => {
    const isAdmin = userObj.email === 'admin@printthesis.com';
    localStorage.setItem('token', userObj.accessToken || 'firebase_token');
    localStorage.setItem('user', JSON.stringify({
      id: userObj.uid,
      email: userObj.email,
      name: userObj.displayName || 'User',
      role: isAdmin ? 'admin' : 'user'
    }));
    
    if (onSuccess) {
      onSuccess();
    } else {
      window.location.href = isAdmin ? '/admin' : '/dashboard';
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleLoginSubmit called", { email });

    if (!email || !password) return toast.error('Please fill all fields');
    
    setIsLoading(true);
    console.log("setIsLoading(true) called, isLoading:", true);
    try {
      console.log("Attempting signInWithEmailAndPassword...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("signInWithEmailAndPassword success");
      toast.success('Logged in successfully!');
      handleSuccessRedirect(userCredential.user);
    } catch (error: any) {
      console.error("handleLoginSubmit error (code):", error.code);
      console.error("handleLoginSubmit error (message):", error.message);
      
      // Log the full error object for inspection
      console.log("Full error object:", error);

      // Provide better feedback instead of generic "Network error"
      toast.error(`Auth Error: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      console.log("setIsLoading(false) called, isLoading:", false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const isNewUser = userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime;
      
      toast.success(isNewUser ? 'Account created with Google!' : 'Successfully signed in with Google!');
      
      // Always update localStorage on success
      const userObj = userCredential.user;
      const isAdmin = userObj.email === 'admin@printthesis.com';
      localStorage.setItem('token', (userObj as any).accessToken || 'firebase_token');
      localStorage.setItem('user', JSON.stringify({
        id: userObj.uid,
        email: userObj.email,
        name: userObj.displayName || 'User',
        role: isAdmin ? 'admin' : 'user'
      }));

      if (onSuccess) {
         onSuccess();
      } else {
         window.location.href = isAdmin ? '/admin' : '/dashboard';
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        // Do nothing silently
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Network Error: This often means the current domain is not added to "Authorized Domains" in your NEW Firebase project settings.');
      } else {
        toast.error(error.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return toast.error('Please fill all required fields');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update display name
      await updateProfile(userCredential.user, { displayName: name });
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      setAuthStep('verification');
      toast.success('Account created! Please verify your email.');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('User already exists. Please sign in.');
        setActiveTab('login');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Network Error: Please check your connection or add this domain to "Authorized Domains" in your NEW Firebase project.');
      } else {
        toast.error(error.message || 'Something went wrong during signup.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full h-full flex flex-col rounded-2xl md:rounded-3xl border overflow-hidden ${cardOuter}`}>
      {/* Tabs */}
      {authStep === 'form' && (
        <div className="flex border-b border-white/10 relative">
          <button 
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-4 text-sm sm:text-base font-bold transition-colors ${activeTab === 'login' ? textColor : mutedColor}`}
          >
            Log In
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-4 text-sm sm:text-base font-bold transition-colors ${activeTab === 'signup' ? textColor : mutedColor}`}
          >
            Create Account
          </button>
          <div 
            className={`absolute bottom-0 h-0.5 transition-all duration-300 ${theme === 'dark' ? 'bg-[#C59978]' : 'bg-indigo-600'}`}
            style={{ width: '50%', left: activeTab === 'login' ? '0%' : '50%' }}
          />
        </div>
      )}

      <div className={`p-6 sm:p-8 flex-1 flex flex-col ${theme === 'dark' ? '' : 'bg-white'}`}>
        <AnimatePresence mode="wait">
          {authStep === 'verification' ? (
            <motion.div key="verification" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex-1 flex flex-col items-center justify-center pt-4">
               <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                 <CheckCircle2 className="w-8 h-8" />
               </div>
               <h3 className={`text-xl font-bold mb-2 text-center ${textColor}`}>Verification Required</h3>
               <p className={`text-sm text-center mb-6 ${mutedColor}`}>
                 We have sent you a verification email to <span className="font-bold">{email}</span>. Please verify it and log in.
               </p>

               <button 
                 onClick={async () => {
                   await auth.signOut();
                   setAuthStep('form');
                   setActiveTab('login');
                 }} 
                 className={`w-full py-4 mt-auto rounded-xl font-bold text-sm transition-all shadow-md border ${theme === 'dark' ? 'border-gray-600 text-white hover:bg-gray-700' : 'border-gray-200 text-gray-800 hover:bg-gray-50'}`}
               >
                 Login
               </button>
            </motion.div>
          ) : activeTab === 'login' ? (
            <motion.div key="login" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex-1 flex flex-col pt-0 sm:pt-2">
              <form onSubmit={handleLoginSubmit} className="flex-1 flex flex-col space-y-5">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${mutedColor}`}>Email Address</label>
                  <div className="relative">
                    <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none transition focus:ring-2 ${inputBg} ${inputFocus}`}
                      placeholder="you@email.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                     <label className={`block text-xs font-medium ${mutedColor}`}>Password</label>
                     <button type="button" className={`text-xs font-medium transition ${theme === 'dark' ? 'text-[#C59978] hover:text-white' : 'text-indigo-600 hover:text-indigo-800'}`}>Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-3.5 rounded-xl text-sm font-medium outline-none transition focus:ring-2 ${inputBg} ${inputFocus}`}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className={`w-full py-3 mt-1 rounded-xl font-bold text-sm sm:text-base transition-all shadow-md flex items-center justify-center group ${primaryColor} disabled:opacity-70`}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="relative flex items-center py-1">
                   <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                   <span className="flex-shrink-0 mx-4 text-xs font-semibold text-gray-500">OR</span>
                   <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                </div>

                <button 
                  type="button" 
                  onClick={handleGoogleSignIn}
                  disabled={isLoading} 
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'} disabled:opacity-70`}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="signup" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex-1 flex flex-col pt-0 sm:pt-2">
              <form onSubmit={handleSignupSubmit} className="flex-1 flex flex-col space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${mutedColor}`}>Full Name</label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input 
                        type="text" required value={name} onChange={(e) => setName(e.target.value)}
                        className={`w-full pl-9 pr-3 py-3 rounded-xl text-sm outline-none transition focus:ring-2 ${inputBg} ${inputFocus}`}
                        placeholder="John Doe"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${mutedColor}`}>Mobile <span className="text-gray-400">(Optional)</span></label>
                    <div className="relative">
                      <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input 
                        type="tel" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className={`w-full pl-9 pr-3 py-3 rounded-xl text-sm outline-none transition focus:ring-2 ${inputBg} ${inputFocus}`}
                        placeholder="10-digit"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${mutedColor}`}>Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input 
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-9 pr-3 py-3 rounded-xl text-sm outline-none transition focus:ring-2 ${inputBg} ${inputFocus}`}
                      placeholder="you@email.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${mutedColor}`}>Password</label>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input 
                        type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-9 pr-9 py-3 rounded-xl text-sm outline-none transition focus:ring-2 ${inputBg} ${inputFocus}`}
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                         {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${mutedColor}`}>Confirm</label>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input 
                        type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-9 pr-3 py-3 rounded-xl text-sm outline-none transition focus:ring-2 ${inputBg} ${inputFocus}`}
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className={`w-full py-3 mt-2 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center group ${primaryColor} disabled:opacity-70`}>
                   {isLoading ? 'Creating Account...' : 'Sign Up'}
                   <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="relative flex items-center py-1">
                   <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                   <span className="flex-shrink-0 mx-4 text-xs font-semibold text-gray-500">OR</span>
                   <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                </div>

                <button 
                  type="button" 
                  onClick={handleGoogleSignIn}
                  disabled={isLoading} 
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'} disabled:opacity-70`}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                <p className={`text-[10px] text-center mt-3 ${mutedColor}`}>
                   By signing up, you agree to our Terms of Service & Privacy Policy.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
