import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Package, Printer, Star, UploadCloud, ChevronRight, Phone, BadgeCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { AuthForm } from '../components/AuthForm';

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  React.useEffect(() => {
    if (token) {
        navigate(user?.role === 'admin' ? "/admin" : "/dashboard");
    }
  }, [token, navigate, user?.role]);

  const heroSlides = [
    {
      id: 1,
      image: "/assets/hero/slide1.jpg",
      title: "Professional Thesis Printing",
      subtitle: "Premium Printing & Binding Services"
    },
    {
      id: 2,
      image: "/assets/hero/slide2.jpg",
      title: "Hard Binding Solutions",
      subtitle: "Elegant Academic Presentation"
    },
    {
      id: 3,
      image: "/assets/hero/slide3.jpg",
      title: "Customized Formatting",
      subtitle: "Standard A4 / A5 Thesis with customized gold foil formatting."
    },
    {
      id: 4,
      image: "/assets/hero/slide4.jpg",
      title: "Fast Turnaround Time",
      subtitle: "Express Delivery to Your University"
    },
    {
      id: 5,
      image: "/assets/hero/slide5.jpg",
      title: "Bulk Printing Available",
      subtitle: "Special Discounts for Master's and PhD Batches"
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section matching capture.png */}
      <section className="bg-[#7B1113] min-h-[calc(100vh-64px)] py-6 md:py-8 flex flex-col justify-center overflow-x-hidden">
        <div className="max-w-[1280px] mx-auto px-4 w-full">
          
          {/* Header replicating the Shrine Board header */}
          <div className="flex flex-col md:flex-row items-center justify-center md:space-x-4 mb-6 md:mb-8 text-white select-none">
             <div className="w-16 h-16 md:w-20 md:h-20 bg-[#9B1E1E] border-2 border-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.2)] mb-4 md:mb-0 relative shrink-0 overflow-hidden">
               <div className="absolute inset-1.5 border border-white/50 rounded-full border-dashed" />
               <Printer className="w-8 h-8 md:w-10 md:h-10 text-white" />
             </div>
             <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-4xl font-sans font-black tracking-tight text-white drop-shadow-md">Professional Thesis Printing and Binding Services</h1>
                <h2 className="text-lg md:text-2xl font-bold text-white mt-1 md:mt-2 drop-shadow-md">Online Services</h2>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 md:gap-6 items-stretch">
            {/* Left Side -> Slider */}
            <div className="w-full h-[320px] md:h-[400px] lg:h-[420px] xl:h-[480px] rounded-md overflow-hidden shadow-2xl relative bg-black border border-[#a11111]">
              <Swiper
                modules={[Autoplay, EffectFade, Navigation, Pagination]}
                effect="fade"
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={true}
                className="w-full h-full"
              >
                {heroSlides.map((slide) => (
                  <SwiperSlide key={slide.id} className="relative w-full h-full">
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#7B1113]/90 via-transparent to-transparent z-10" />
                    <img 
                      src={slide.image} 
                      alt={slide.title} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                      onError={(e) => {
                         (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1600';
                      }}
                    />
                    
                    <div className="absolute bottom-8 left-8 z-20 text-white max-w-lg">
                      <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] sm:text-xs font-bold tracking-wider mb-2">NEW SERVICE</div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif mb-1 md:mb-2 leading-tight">{slide.title}</h3>
                      <p className="text-xs sm:text-sm text-white/90 font-medium">{slide.subtitle}</p>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Right Side -> Login Panel matching capture.png */}
            <div className="w-full h-[520px] md:h-[500px] lg:h-[480px] xl:h-[520px] bg-transparent rounded-md flex flex-col relative scale-95">
               <AuthForm theme="dark" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Print your Thesis in 3 simple Steps</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We've streamlined the entire process. No complicated forms, just direct professional printing.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 border-t border-dashed border-gray-300"></div>
            
            <div className="relative flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 z-10 border border-gray-100">
                  <UploadCloud className="w-10 h-10 text-indigo-600" />
               </div>
               <h3 className="text-xl font-bold mb-3">1. Upload File</h3>
               <p className="text-gray-600">Upload your PDF thesis. We automatically calculate pages, colored pages and verify format.</p>
            </div>
            
            <div className="relative flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 z-10 border border-gray-100">
                  <Printer className="w-10 h-10 text-indigo-600" />
               </div>
               <h3 className="text-xl font-bold mb-3">2. Customize & Pay</h3>
               <p className="text-gray-600">Select paper weight, binding options (Hard/Soft/Spiral), and make a secure payment.</p>
            </div>
            
            <div className="relative flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 z-10 border border-gray-100">
                  <Package className="w-10 h-10 text-indigo-600" />
               </div>
               <h3 className="text-xl font-bold mb-3">3. Track & Receive</h3>
               <p className="text-gray-600">Track your order live. We print, bind, and ship directly to your door securely packed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Premium Binding Options</h2>
              <p className="text-gray-600 max-w-2xl text-lg">Choose the perfect finish for your document. From classic hardbound to flexible spiral, we offer university-compliant styles.</p>
            </div>
            <Link to="/upload" className="flex-shrink-0 text-indigo-600 font-medium hover:text-indigo-800 inline-flex items-center group">
              Start your order <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <BindingCard 
               title="Hard binding with Golden Embossing"
               desc="Classic leather-style hard cover with premium gold foil lettering on front and spine. University standard."
               price="From Rs. 750/-"
               img="/assets/hero/slide3.jpg"
            />
            <BindingCard 
               title="Ph.D. Thesis Binding"
               desc="Professional flat spine finish with clear front cover. Ideal for copy submissions and reports."
               price="From Rs. 500/-"
               img="/assets/hero/slide1.jpg"
            />
            <BindingCard 
               title="Dissertation Printing and Binding"
               desc="Durable plastic spiral with clear acetate covers. Perfect for working copies and casual reading."
               price="From Rs. 350/-"
               img="/assets/hero/slide9.jpg"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-50 py-20 relative px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden bg-[#7B1113] shadow-2xl px-6 py-16 md:py-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607513746994-5c91fcff2853?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
          <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-6 leading-tight tracking-tight">Ready to print your thesis?</h2>
            <p className="text-lg md:text-xl text-red-50 mb-10 max-w-2xl mx-auto font-medium">Join thousands of students who trusted us with their final masterpiece.</p>
            <Link to="/upload" className="inline-flex justify-center items-center px-10 py-4 bg-white text-[#7B1113] font-bold text-lg hover:bg-gray-50 transition-all shadow-xl rounded-2xl group">
              Upload & Get Started
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50 border-t border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-4 bg-indigo-50 border border-indigo-100 rounded-full">
               <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-2" />
               <span className="text-sm font-bold tracking-wide text-indigo-900">Rated 4.9/5 by Students</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Trusted by Students Across India</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Thousands of students trust us for premium thesis printing & binding services. See what they have to say.</p>
            
            <div className="flex items-center justify-center gap-6 mt-8">
               <div className="flex -space-x-4">
                  {[...Array(5)].map((_, i) => (
                    <img key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" src={`https://api.dicebear.com/7.x/initials/svg?seed=User${i}&backgroundColor=e2e8f0`}/>
                  ))}
               </div>
               <div className="text-left">
                  <div className="font-bold text-gray-900">5000+</div>
                  <div className="text-xs text-gray-500 font-medium">Happy Students</div>
               </div>
               <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
               <div className="hidden sm:flex items-center text-left">
                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                   <Package className="w-5 h-5 text-green-600" />
                 </div>
                 <div>
                    <div className="font-bold text-gray-900">Fast Delivery</div>
                    <div className="text-xs text-gray-500 font-medium">& Premium Binding</div>
                 </div>
               </div>
            </div>
          </div>

          <div className="relative">
            {/* Soft gradient masks for the edges to make slider look premium */}
            <div className="absolute top-0 bottom-0 left-0 w-8 md:w-24 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
            <div className="absolute top-0 bottom-0 right-0 w-8 md:w-24 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>

            <Swiper
              modules={[Autoplay]}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={true}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              className="!pb-12"
            >
              {TESTIMONIALS.map((testimonial, idx) => (
                <SwiperSlide key={idx} className="h-auto">
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-bl-3xl"></div>
                    <div className="flex items-center mb-4 relative z-10">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 font-medium leading-relaxed mb-6 flex-grow relative z-10 text-sm md:text-base">"{testimonial.text}"</p>
                    <div className="flex items-center relative z-10 mt-auto pt-4 border-t border-gray-50">
                      <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full mr-3 border border-gray-200" />
                      <div>
                        <div className="font-bold text-gray-900 text-sm flex items-center">
                          {testimonial.name} 
                          <BadgeCheck className="w-4 h-4 text-emerald-500 ml-1" />
                        </div>
                        <div className="text-xs text-gray-500 font-medium flex items-center">
                          {testimonial.city}, India
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
    </div>
  );
}

function BindingCard({title, desc, price, img}: {title: string, desc: string, price: string, img: string}) {
  return (
    <div className="group rounded-3xl overflow-hidden bg-[#f8fafc] border border-gray-100 transition duration-300 hover:shadow-2xl hover:shadow-gray-200/50">
      <div className="aspect-[4/3] overflow-hidden relative">
         <img src={img} alt={title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
      </div>
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold font-serif text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6 line-clamp-2 text-sm">{desc}</p>
        <div className="flex items-center justify-between">
          <span className="font-sans font-bold text-[#7B1113] text-lg">{price}</span>
          <Link to="/upload" className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#7B1113] text-white hover:bg-[#5d0d0e] hover:shadow-lg hover:shadow-red-900/20 transition-all duration-300 font-medium text-sm shadow-md">
            <span>Order Now</span>
            <ArrowRight className="w-4 h-4"/>
          </Link>
        </div>
      </div>
    </div>
  )
}

const TESTIMONIALS = [
  {
    name: "Rahul Verma",
    city: "Delhi",
    text: "Received my thesis print on time with excellent hard binding quality. The gold embossing was exactly as per Delhi University guidelines.",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Rahul+Verma&backgroundColor=7B1113&textColor=ffffff"
  },
  {
    name: "Sneha Patil",
    city: "Pune",
    text: "Very professional printing service for MBA project reports. The color printing for my charts and graphs was vibrant and crisp.",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Sneha+Patil&backgroundColor=C59978&textColor=ffffff"
  },
  {
    name: "Aman Gupta",
    city: "Noida",
    text: "Paper quality and formatting were outstanding. Professional packaging ensured zero damage during delivery to my place in Noida.",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Aman+Gupta&backgroundColor=1f2937&textColor=ffffff"
  },
  {
    name: "Priya Desai",
    city: "Mumbai",
    text: "Fast delivery and premium binding! I was panicking about my deadline, but their urgent printing service saved my submission.",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Priya+Desai&backgroundColor=7B1113&textColor=ffffff"
  },
  {
    name: "Vikram Singh",
    city: "Jaipur",
    text: "Affordable pricing for such high-quality dissertation printing. The soft thermal binding looks incredibly professional for my review copy.",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Vikram+Singh&backgroundColor=C59978&textColor=ffffff"
  },
  {
    name: "Kavita Reddy",
    city: "Bengaluru",
    text: "Highly trustworthy platform! The entire process from uploading PDF to tracking the delivery was smooth. The print quality is top-notch.",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Kavita+Reddy&backgroundColor=1f2937&textColor=ffffff"
  },
  {
    name: "Ravi Sharma",
    city: "Ghaziabad",
    text: "I needed multiple copies of my project report. The bulk pricing was great, and the spiral binding was durable and neatly done.",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Ravi+Sharma&backgroundColor=7B1113&textColor=ffffff"
  },
  {
    name: "Anjali Mishra",
    city: "Lucknow",
    text: "The customer support was helpful when I had a formatting doubt. The final hardbound thesis looks like a premium published book.",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Anjali+Mishra&backgroundColor=C59978&textColor=ffffff"
  }
];
