import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, FolderX, Clock, ShieldOff, ArrowRight, Quote } from 'lucide-react';

const IMAGES = {
  logo: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/69788b3d0c8d07768ff7f251_integral-logo-v02.svg',
  platformMockup: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/697b8756cd4a1847984b29cd_ffc8cb20e94816f98905409f1e56e0cd_home-mockup-en.png',
  onboardingFlow: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/6978bf3b6fa7a4189466cf4e_start-mockup-integral-en.avif',
  bwaMockup: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/6978bf359d0708878e0fbefb_47d0c41e87ca470752296069416ca11c_bwa-mockup-integral-en.avif',
  folderStructure: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/6978bf3908e9cc5233a15465_69808ff13db7892cc28a323ec0181f38_statements-mockup-integral-en.avif',
  contactPersons: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/6978bf3c1d4881efa1a4c9f8_788011a75eab9cb4c5e176b039d5bbcf_proactive-mockup-integral-en.avif',
  bookkeepingSvg: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/697c7e2cb6a506bd32d13c6b_bookkeeping-mockup-en.svg',
  founders: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/697ca78305abd836e21be004_founders-2-1440.avif',
  teamPhoto: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/69788126cc01c56a06cf4ad6_integral-team-1080.avif',
  teamCheering: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/697cb92ce6a815acf416cdd1_integral-team-cheering-1440.avif',
  officeSmiling: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/697c88d5f3ac04bec6d59451_office-smiling-1440.avif',
  officeDiscussion: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/697c88d4cea250f59a534d5a_office-discussion-1440.avif',
  officeExterior: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/697ca09d6a8a761f1d08a0a1_office-exterior-1440.avif',
  metaImage: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/6895ec969712968b73bed3c1_5ff4c2c4e521047725847b0474b8fac8_Meta%20Image_1200x630.png',
  logoQonto: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/69789204366010a27172590b_integration-logo-qonto.avif',
  logoStripe: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/6978878e60faca4157cef528_integration-logo-stripe.avif',
  logoPaypal: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/69789204a197ef7f65dff5e1_integration-logo-paypal.avif',
  logoHubspot: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/6978920447ca8bbc65f951f2_integration-logo-hubspot.avif',
  logoFinom: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/69789204a95d77abf9589f38_integration-logo-finom.avif',
  logoSparkasse: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/697892042f37fd4fb8ccc352_integration-logo-sparkasse.avif',
  logoDeutscheBank: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/69789204dd883917b6d01a32_integration-logo-deutsche-bank.avif',
  logoIng: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/697892047b34eadf67cb641c_integration-logo-ing.avif',
  logoCommerzbank: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/697892049f4933933e47b530_integration-logo-commerzbank.avif',
  logoCleverlohn: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/69789204a928eb8d5036d3e7_integration-logo-cleverlohn.avif',
  headshotLukas: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/67a4c22feba17dd378ef8f29_327288099c1f4df2a418d9ba6424c78d_LukasZörner.avif',
  headshotAnil: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/6968ae49da209248603b775a_5ad58d4a3bb0d3a6caab44022bc4fdf0_Anil-headshot.avif',
  headshotDarleen: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/6968ae485d88403f5a663222_40a14e9514bb8681b727f6c62703bf1b_Darleen-headshot.avif',
  headshotDaniel: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/696f7dedec3df950d52ac643_daniel-headshot-2.avif',
  headshotFabian: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/6968ae4811aad016182e80f2_9395b06829acd82e1f2b39276694fb87_Fabian-headshot.avif',
  testimonialDoq: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/69937d05a1103a4e1bf57e10_doq-copilot-headshot.avif',
  testimonialDoqLogo: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/69937e25f80f359bf67c7326_doq-copilot-logo.avif',
};

const TOTAL_SLIDES = 8;

interface DemoSlidesProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'de' | 'en';
}

const t = {
  de: {
    slide1: {
      headline: 'Buchhaltung, Lohn & Steuern\nfür die Wirtschaft von Morgen',
    },
    slide2: {
      title: 'Das Problem',
      subtitle: 'Warum Unternehmer frustriert sind',
      pain1: 'Unübersichtliche Ordnerstrukturen und Papierchaos',
      pain2: 'Monatelange Wartezeiten auf Rückmeldungen',
      pain3: 'Keine proaktive steuerliche Beratung',
    },
    slide3: {
      title: 'Die Integral Plattform',
      headline: 'Alles was dein Unternehmen braucht — in einer Plattform',
      features: [
        'Echtzeit-Übersicht über Finanzen & Steuern',
        'Automatisierte Belegerfassung',
        'Direkte Kommunikation mit deinem Team',
        'BWA, Auswertungen & Dokumente jederzeit verfügbar',
      ],
    },
    slide4: {
      title: 'So funktioniert\'s',
      subtitle: 'In 4 einfachen Schritten startklar',
      steps: [
        { num: '01', label: 'Angebot & Vertrag', desc: 'Individuelles Angebot in wenigen Minuten' },
        { num: '02', label: 'Bank & Tools verbinden', desc: 'Nahtlose Anbindung an bestehende Systeme' },
        { num: '03', label: 'Belege hochladen', desc: 'Per App, E-Mail oder Drag & Drop' },
        { num: '04', label: 'BWA & Auswertungen', desc: 'Monatliche Reports in Echtzeit' },
      ],
    },
    slide5: {
      title: 'Die Plattform im Detail',
      labels: ['BWA & Auswertungen', 'Belegmanagement', 'Proaktive Beratung', 'Buchhaltung'],
    },
    slide6: {
      title: 'Integrationen',
      headline: 'Nahtlos verbunden mit deinen Tools',
    },
    slide7: {
      title: 'Das Team',
      subtitle: 'Die Menschen hinter Integral',
    },
    slide8: {
      title: 'Nächste Schritte',
      headline: 'Lassen Sie uns starten',
      steps: ['Angebot erhalten', 'Onboarding in 48h', 'Erster Monatsabschluss'],
      testimonial: 'Integral kümmert sich um unsere steuerlichen Angelegenheiten — von Belegen bis zum Jahresabschluss — damit ich mich auf mein Produkt konzentrieren kann.',
      testimonialAuthor: 'Corson Panneton',
      testimonialRole: 'Co-Founder, Doq Copilot GmbH',
    },
  },
  en: {
    slide1: {
      headline: 'Accounting, Payroll & Tax\nfor the Growing Economy',
    },
    slide2: {
      title: 'The Problem',
      subtitle: 'Why entrepreneurs are frustrated',
      pain1: 'Messy folder structures and paper chaos',
      pain2: 'Months of waiting for responses',
      pain3: 'No proactive tax advice',
    },
    slide3: {
      title: 'The Integral Platform',
      headline: 'Everything your company needs — in one platform',
      features: [
        'Real-time overview of finances & taxes',
        'Automated receipt capture',
        'Direct communication with your team',
        'Reports & documents available anytime',
      ],
    },
    slide4: {
      title: 'How It Works',
      subtitle: 'Ready in 4 simple steps',
      steps: [
        { num: '01', label: 'Offer & Contract', desc: 'Custom offer in just a few minutes' },
        { num: '02', label: 'Connect Bank & Tools', desc: 'Seamless integration with existing systems' },
        { num: '03', label: 'Upload Receipts', desc: 'Via app, email, or drag & drop' },
        { num: '04', label: 'Reports & Analytics', desc: 'Monthly reports in real time' },
      ],
    },
    slide5: {
      title: 'Platform Deep Dive',
      labels: ['Reports & Analytics', 'Document Management', 'Proactive Advisory', 'Bookkeeping'],
    },
    slide6: {
      title: 'Integrations',
      headline: 'Seamlessly connected to your tools',
    },
    slide7: {
      title: 'The Team',
      subtitle: 'The people behind Integral',
    },
    slide8: {
      title: 'Next Steps',
      headline: "Let's get started",
      steps: ['Receive your offer', 'Onboarding in 48h', 'First monthly close'],
      testimonial: 'Integral takes care of our tax matters, from receipts to annual accounts, so that I can concentrate on my product.',
      testimonialAuthor: 'Corson Panneton',
      testimonialRole: 'Co-Founder, Doq Copilot GmbH',
    },
  },
};

const teamMembers = [
  { name: 'Lukas Zörner', role: 'CEO', img: IMAGES.headshotLukas },
  { name: 'Darleen Gräf', role: 'Managing Director', img: IMAGES.headshotDarleen },
  { name: 'Anil Sönmez', role: 'Managing Director', img: IMAGES.headshotAnil },
  { name: 'Daniel Korth', role: 'WP / Tax', img: IMAGES.headshotDaniel },
  { name: 'Fabian Raddatz', role: 'CFO', img: IMAGES.headshotFabian },
];

const integrationLogos = [
  { name: 'Qonto', src: IMAGES.logoQonto },
  { name: 'Stripe', src: IMAGES.logoStripe },
  { name: 'PayPal', src: IMAGES.logoPaypal },
  { name: 'HubSpot', src: IMAGES.logoHubspot },
  { name: 'Finom', src: IMAGES.logoFinom },
  { name: 'Sparkasse', src: IMAGES.logoSparkasse },
  { name: 'Deutsche Bank', src: IMAGES.logoDeutscheBank },
  { name: 'ING', src: IMAGES.logoIng },
  { name: 'Commerzbank', src: IMAGES.logoCommerzbank },
  { name: 'cleverlohn', src: IMAGES.logoCleverlohn },
];

function DemoSlides({ isOpen, onClose, language }: DemoSlidesProps) {
  const [current, setCurrent] = useState(0);
  const lang = t[language];

  const goNext = useCallback(() => {
    setCurrent((prev) => Math.min(prev + 1, TOTAL_SLIDES - 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrent((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setCurrent(0);
      return;
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, goNext, goPrev, onClose]);

  if (!isOpen) return null;

  const slideClasses = 'absolute inset-0 flex items-center justify-center transition-opacity duration-500';

  return (
    <div className="fixed inset-0 z-[200] bg-navy">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[210] p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      {/* Slide counter */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[210] font-label tracking-widest text-xs uppercase text-white/60">
        {current + 1} / {TOTAL_SLIDES}
      </div>

      {/* Navigation arrows */}
      {current > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-[210] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={28} />
        </button>
      )}
      {current < TOTAL_SLIDES - 1 && (
        <button
          onClick={goNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-[210] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Slide content area */}
      <div className="relative w-full h-full overflow-hidden">
        {/* ============== SLIDE 1: TITLE ============== */}
        <div className={`${slideClasses} ${current === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${IMAGES.officeExterior})` }}
          >
            <div className="absolute inset-0 bg-[#051132]/85" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-4xl">
            <img src={IMAGES.logo} alt="Integral" className="h-16 mb-12 brightness-0 invert" />
            <h1 className="font-headline text-5xl lg:text-6xl text-white leading-tight whitespace-pre-line">
              {lang.slide1.headline}
            </h1>
            <div className="mt-8 h-1 w-24 rounded-full bg-[#CD7A30]" />
          </div>
        </div>

        {/* ============== SLIDE 2: PAIN POINTS ============== */}
        <div className={`${slideClasses} ${current === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#051132] via-[#0a1e4a] to-[#051132]" />
          <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-4xl">
            <p className="font-label tracking-widest text-[11px] uppercase text-[#CD7A30] font-bold mb-3">
              {lang.slide2.title}
            </p>
            <h2 className="font-headline text-4xl lg:text-5xl text-white mb-16">
              {lang.slide2.subtitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {[
                { icon: <FolderX size={36} />, text: lang.slide2.pain1 },
                { icon: <Clock size={36} />, text: lang.slide2.pain2 },
                { icon: <ShieldOff size={36} />, text: lang.slide2.pain3 },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <div className="text-[#CD7A30]">{item.icon}</div>
                  <p className="font-label text-white/90 text-lg leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============== SLIDE 3: PLATFORM ============== */}
        <div className={`${slideClasses} ${current === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#051132] to-[#0d2254]" />
          <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-5xl w-full">
            <p className="font-label tracking-widest text-[11px] uppercase text-[#CD7A30] font-bold mb-3">
              {lang.slide3.title}
            </p>
            <h2 className="font-headline text-3xl lg:text-4xl text-white mb-10">
              {lang.slide3.headline}
            </h2>
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/40 mb-10">
              <img
                src={IMAGES.platformMockup}
                alt="Integral Platform"
                className="w-full h-auto"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {lang.slide3.features.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-left text-sm text-white/80 font-label"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#CD7A30] shrink-0" />
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============== SLIDE 4: HOW IT WORKS ============== */}
        <div className={`${slideClasses} ${current === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#051132] via-[#0a1e4a] to-[#051132]" />
          <div className="relative z-10 flex flex-col items-center px-8 max-w-6xl w-full">
            <p className="font-label tracking-widest text-[11px] uppercase text-[#CD7A30] font-bold mb-3">
              {lang.slide4.title}
            </p>
            <h2 className="font-headline text-3xl lg:text-4xl text-white mb-12 text-center">
              {lang.slide4.subtitle}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-center">
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
                <img
                  src={IMAGES.onboardingFlow}
                  alt="Onboarding"
                  className="w-full h-auto"
                />
              </div>
              <div className="flex flex-col gap-6">
                {lang.slide4.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-5">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#CD7A30]/20 text-[#CD7A30] font-headline text-lg font-bold shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <h3 className="font-headline text-xl text-white font-bold">{step.label}</h3>
                      <p className="font-label text-white/60 text-sm mt-1">{step.desc}</p>
                    </div>
                    {i < 3 && (
                      <ArrowRight size={16} className="text-white/20 mt-3 hidden lg:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ============== SLIDE 5: PLATFORM DEEP DIVE ============== */}
        <div className={`${slideClasses} ${current === 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#051132] to-[#0d2254]" />
          <div className="relative z-10 flex flex-col items-center px-8 max-w-6xl w-full">
            <p className="font-label tracking-widest text-[11px] uppercase text-[#CD7A30] font-bold mb-8">
              {lang.slide5.title}
            </p>
            <div className="grid grid-cols-2 gap-6 w-full">
              {[
                { src: IMAGES.bwaMockup, label: lang.slide5.labels[0] },
                { src: IMAGES.folderStructure, label: lang.slide5.labels[1] },
                { src: IMAGES.contactPersons, label: lang.slide5.labels[2] },
                { src: IMAGES.bookkeepingSvg, label: lang.slide5.labels[3] },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="rounded-xl overflow-hidden shadow-xl shadow-black/30 bg-white/5 border border-white/10">
                    <img
                      src={item.src}
                      alt={item.label}
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="font-label text-white/70 text-sm mt-3 font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============== SLIDE 6: INTEGRATIONS ============== */}
        <div className={`${slideClasses} ${current === 5 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#051132] via-[#0a1e4a] to-[#051132]" />
          <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-4xl">
            <p className="font-label tracking-widest text-[11px] uppercase text-[#CD7A30] font-bold mb-3">
              {lang.slide6.title}
            </p>
            <h2 className="font-headline text-3xl lg:text-4xl text-white mb-16">
              {lang.slide6.headline}
            </h2>
            <div className="grid grid-cols-5 gap-6 w-full">
              {integrationLogos.map((logo, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/[0.07] border border-white/10 hover:bg-white/[0.12] transition-colors"
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className="w-16 h-16 object-contain rounded-lg"
                  />
                  <p className="font-label text-white/50 text-[11px] mt-3 tracking-wide">{logo.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============== SLIDE 7: TEAM ============== */}
        <div className={`${slideClasses} ${current === 6 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#051132] to-[#0d2254]" />
          <div className="relative z-10 flex flex-col items-center px-8 max-w-5xl w-full">
            <p className="font-label tracking-widest text-[11px] uppercase text-[#CD7A30] font-bold mb-3">
              {lang.slide7.title}
            </p>
            <h2 className="font-headline text-3xl lg:text-4xl text-white mb-10 text-center">
              {lang.slide7.subtitle}
            </h2>
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/40 mb-12 max-h-[40vh]">
              <img
                src={IMAGES.teamCheering}
                alt="Integral Team"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-center gap-8 w-full">
              {teamMembers.map((member, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#CD7A30]/40 shadow-lg mb-3">
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-label text-white text-sm font-semibold">{member.name}</p>
                  <p className="font-label text-white/50 text-xs">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============== SLIDE 8: NEXT STEPS ============== */}
        <div className={`${slideClasses} ${current === 7 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#051132] via-[#0a1e4a] to-[#051132]" />
          <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-4xl">
            <p className="font-label tracking-widest text-[11px] uppercase text-[#CD7A30] font-bold mb-3">
              {lang.slide8.title}
            </p>
            <h2 className="font-headline text-4xl lg:text-5xl text-white mb-14">
              {lang.slide8.headline}
            </h2>

            {/* 3 steps */}
            <div className="flex items-center justify-center gap-4 mb-14 w-full">
              {lang.slide8.steps.map((step, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-3 px-6 py-5 rounded-2xl bg-white/5 border border-white/10 flex-1">
                    <span className="text-[#CD7A30] font-headline text-2xl font-bold">{i + 1}</span>
                    <span className="font-label text-white text-sm font-medium">{step}</span>
                  </div>
                  {i < 2 && <ArrowRight size={20} className="text-white/30 shrink-0" />}
                </React.Fragment>
              ))}
            </div>

            {/* Testimonial */}
            <div className="flex items-start gap-5 p-6 rounded-2xl bg-white/[0.04] border border-white/10 text-left max-w-2xl w-full mb-12">
              <img
                src={IMAGES.testimonialDoq}
                alt={lang.slide8.testimonialAuthor}
                className="w-14 h-14 rounded-full object-cover shrink-0 border border-white/20"
              />
              <div>
                <Quote size={18} className="text-[#CD7A30] mb-2" />
                <p className="font-label text-white/80 text-sm leading-relaxed italic mb-3">
                  {lang.slide8.testimonial}
                </p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-label text-white text-sm font-semibold">{lang.slide8.testimonialAuthor}</p>
                    <p className="font-label text-white/50 text-xs">{lang.slide8.testimonialRole}</p>
                  </div>
                  <img src={IMAGES.testimonialDoqLogo} alt="Doq Copilot" className="h-6 ml-auto opacity-60" />
                </div>
              </div>
            </div>

            {/* Logo */}
            <img src={IMAGES.logo} alt="Integral" className="h-10 brightness-0 invert opacity-40" />
          </div>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-[210] h-1 bg-white/10">
        <div
          className="h-full bg-[#CD7A30] transition-all duration-500 ease-out"
          style={{ width: `${((current + 1) / TOTAL_SLIDES) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default DemoSlides;
