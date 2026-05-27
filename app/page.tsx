'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Crown,
  Brain,
  Users,
  Sparkles,
  PhoneCall,
  MapPin,
  Mail,
  Calendar,
  Phone,
  Menu,
  X,
  ChevronUp,
} from 'lucide-react';
import PaymentModal, { calcCardPrice } from './components/PaymentModal';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [hidePhone, setHidePhone] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState({
    name: "",
    cashPrice: "",
    cardLink: "",
  });
  const footerRef = useRef<HTMLDivElement>(null);

  const handleOpenPayment = (name: string, cashPrice: string, cardLink: string) => {
    setSelectedCourse({ name, cashPrice, cardLink });
    setPaymentModalOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      if (footerRef.current) {
        const footerTop = footerRef.current.getBoundingClientRect().top;
        setHidePhone(footerTop <= window.innerHeight);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const centerHoursData = [
    { day: 'Monday', time: '9 AM–7 PM' },
    { day: 'Tuesday', time: '9 AM–7 PM' },
    { day: 'Wednesday', time: '9 AM–7 PM' },
    { day: 'Thursday', time: '9 AM–7 PM' },
    { day: 'Friday', time: '9 AM–5 PM' },
    { day: 'Saturday', time: 'Closed' },
    { day: 'Sunday', time: '9 AM–3 PM' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2">
              <img
                src="/exceed-logo.png"
                alt="Exceed Learning Center Logo"
                className="h-10 sm:h-14 w-auto"
              />
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#about" className="text-gray-800 hover:text-[#ca3433] transition-colors font-bold uppercase text-sm tracking-wider">About</a>
              <a href="#pricing" className="text-gray-800 hover:text-[#ca3433] transition-colors font-bold uppercase text-sm tracking-wider">Pricing</a>
              <a href="#footer" className="text-gray-800 hover:text-[#ca3433] transition-colors font-bold uppercase text-sm tracking-wider">Contact</a>
              <a href="/admin" className="text-gray-800 hover:text-[#ca3433] transition-colors font-bold uppercase text-sm tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#ca3433]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Admin
              </a>
            </div>

            {/* Right Section: Call */}
            <div className={`hidden lg:flex items-center gap-8 transition-opacity duration-300 ${hidePhone ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex items-center gap-3 border-l border-gray-200 pl-8">
                <div className="bg-[#ca3433]/10 p-2 rounded-full">
                  <Phone className="w-5 h-5 text-[#ca3433]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">CALL OUR OFFICE:</p>
                  <p className="text-xl font-black text-gray-900 leading-none">+1 (516) 226-3114</p>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-gray-800 p-2 border border-gray-200 rounded-lg"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#ca3433]" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-100 bg-white">
              <div className="flex flex-col gap-4">
                <a href="#about" className="text-gray-800 hover:text-[#ca3433] transition-colors font-bold uppercase text-sm py-2" onClick={() => setIsMenuOpen(false)}>About</a>
                <a href="#pricing" className="text-gray-800 hover:text-[#ca3433] transition-colors font-bold uppercase text-sm py-2" onClick={() => setIsMenuOpen(false)}>Pricing</a>
                <a href="#footer" className="text-gray-800 hover:text-[#ca3433] transition-colors font-bold uppercase text-sm py-2" onClick={() => setIsMenuOpen(false)}>Contact</a>
                 <a href="/admin" className="text-gray-800 hover:text-[#ca3433] transition-colors font-bold uppercase text-sm py-2 flex items-center gap-1.5" onClick={() => setIsMenuOpen(false)}>
                  <svg className="w-4 h-4 text-[#ca3433]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Admin
                </a>
                <a href="tel:+15162263114" className="text-[#ca3433] font-bold text-sm py-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> +1 (516) 226-3114
                </a>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative mt-16 sm:mt-20">
        <div className="w-full h-[20rem] sm:h-[28rem] md:h-[36rem] overflow-hidden">
          <img
            src="/kids-chess.jpg"
            alt="Kids playing chess"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4 sm:px-6">
              <div className="flex justify-center mb-4 sm:mb-5">
                <div className="bg-[#ca3433] rounded-full p-3 sm:p-4 shadow-xl">
                  <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2} />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
                Chess Kids Class
              </h1>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-white/90 max-w-xl mx-auto font-light">
                Where young minds master the art of strategy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section id="about" className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed">
            Curious about making strategic moves and boosting brainpower? Join our chess program
            where kids learn to{' '}
            <span className="font-semibold text-[#ca3433]">think critically</span> and develop{' '}
            <span className="font-semibold text-[#ca3433]">problem-solving skills</span>, all
            while having fun and making friends!
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-10 sm:mb-14">
            Why Chess?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="bg-[#ca3433] rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-5 sm:mb-6">
                <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Think Critically</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Develop strategic thinking and decision-making skills that last a lifetime
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="bg-[#ca3433] rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-5 sm:mb-6">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Have Fun</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Learn chess through engaging games and activities designed for kids
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 sm:col-span-2 md:col-span-1 sm:max-w-sm sm:mx-auto md:max-w-none">
              <div className="bg-[#ca3433] rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-5 sm:mb-6">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Make Friends</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Connect with fellow chess enthusiasts in a friendly, supportive environment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-3 sm:mb-4">
            Pricing
          </h2>
          <p className="text-center text-gray-500 mb-10 sm:mb-14 text-base sm:text-lg">
            Simple, transparent pricing for every learner
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Group Classes */}
            <div className="rounded-2xl border border-gray-200 p-6 sm:p-8 md:p-10 flex flex-col hover:border-[#ca3433]/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="bg-[#ca3433]/10 rounded-xl w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#ca3433]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Group Classes</h3>
              </div>

              <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">75 minutes per session</p>

              <div className="space-y-3 sm:space-y-4 flex-1">
                <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">$60</span>
                    <span className="text-gray-500 text-sm sm:text-base">/ class</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">75 min class</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">$220</span>
                    <span className="text-gray-500 text-sm sm:text-base">/ month</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">1 class per week</p>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 space-y-3">
                <button
                  onClick={() => handleOpenPayment("Group Classes - Single Class", "$60", "https://securelink-prod.valorpaytech.com:4430/?redirect=1&uid=48e36e8c-5610-11f1-a8e1-12a0879a85b1")}
                  className="block w-full bg-[#ca3433] hover:bg-[#b02d2c] text-white font-semibold text-sm sm:text-base px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl text-center transition-colors duration-200"
                >
                  Pay $60 — Single Class
                </button>
                <button
                  onClick={() => handleOpenPayment("Group Classes - Monthly", "$220", "https://securelink-prod.valorpaytech.com:4430/?redirect=1&uid=7069e1d0-5610-11f1-a8e1-12a0879a85b1")}
                  className="block w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm sm:text-base px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl text-center transition-colors duration-200"
                >
                  Pay $220 — Monthly
                </button>
              </div>
            </div>

            {/* Private Lessons */}
            <div className="rounded-2xl border border-gray-200 p-6 sm:p-8 md:p-10 flex flex-col hover:border-[#ca3433]/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="bg-[#ca3433]/10 rounded-xl w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-[#ca3433]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Private Lessons</h3>
              </div>

              <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">60 minutes per session</p>

              <div className="flex-1">
                <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">$60</span>
                    <span className="text-gray-500 text-sm sm:text-base">/ lesson</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">60 min session</p>
                </div>
              </div>

              <div className="mt-6 sm:mt-8">
                <button
                  onClick={() => handleOpenPayment("Private Lessons - Private Lesson", "$60", "https://securelink-prod.valorpaytech.com:4430/?redirect=1&uid=a37083c0-5610-11f1-a8e1-12a0879a85b1")}
                  className="block w-full bg-[#ca3433] hover:bg-[#b02d2c] text-white font-semibold text-sm sm:text-base px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl text-center transition-colors duration-200"
                >
                  Pay $60 — Private Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div id="footer" ref={footerRef} className="bg-[#0e1f3e] text-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {/* Phone Number */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#ca3433] flex items-center justify-center border-4 border-white/10 shrink-0 shadow-lg">
                <PhoneCall className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white mb-1">PHONE NUMBER:</p>
                <a href="tel:+15162263114" className="text-base sm:text-lg font-bold hover:text-[#ca3433] transition-colors tracking-tight">+1 (516) 226-3114</a>
              </div>
            </div>

            {/* Our Location */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#ca3433] flex items-center justify-center border-4 border-white/10 shrink-0 shadow-lg">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white mb-1">OUR LOCATION:</p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=1360+Willis+Ave,+Albertson,+NY+11507"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base sm:text-lg font-bold hover:text-[#ca3433] transition-colors tracking-tight"
                >
                  1360 Willis Ave., Albertson NY 11507
                </a>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#ca3433] flex items-center justify-center border-4 border-white/10 shrink-0 shadow-lg">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white mb-1">EMAIL ADDRESS:</p>
                <a
                  href="mailto:kidsprograms@exceedlearningcenterny.com?subject=Chess Kids Class Inquiry"
                  className="text-sm sm:text-lg font-bold hover:text-[#ca3433] transition-colors underline decoration-1 underline-offset-4 tracking-tight break-all sm:break-normal"
                >
                  kidsprograms@exceedlearningcenterny.com
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
            <div className="flex flex-col items-center gap-4 mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#ca3433] flex items-center justify-center border-4 border-white/10 shrink-0 shadow-lg">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-center">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white mb-3">CENTER HOURS:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-1 text-sm text-white/80">
                  {centerHoursData.map((item, idx) => (
                    <li key={idx} className="flex justify-between gap-4">
                      <span>{item.day}</span>
                      <span className={item.time === 'Closed' ? 'text-white/40' : ''}>{item.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="text-center text-white/50 text-xs sm:text-sm">
              <p>© {new Date().getFullYear()} Chess Kids Class. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 p-2.5 sm:p-3 rounded-full bg-[#ca3433] text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-[#a02828] ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        courseName={selectedCourse.name}
        cashPrice={selectedCourse.cashPrice}
        cardPrice={calcCardPrice(selectedCourse.cashPrice)}
        cardLink={selectedCourse.cardLink}
      />
    </div>
  );
}
