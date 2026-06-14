import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from '../components/listings/SearchBar';
import { useListings } from '../hooks/useListings';
import { ListingCard } from '../components/listings/ListingCard';
import {
  DollarSign, Building2, Layers, Leaf, ShieldCheck, Eye,
  Share2, Play, MapPin, Phone, Printer, ExternalLink, Home
} from 'lucide-react';
import { AVATAR_IMAGE_FALLBACK, PROPERTY_IMAGE_FALLBACK, setImageFallback } from '../utils/imageFallbacks';

const faqItems = [
  {
    q: 'How do I find a rental property on RentEase?',
    a: 'After creating an account and completing your tenant onboarding, you can browse verified listings. Use filters like city, budget, property type, and number of bedrooms to narrow down your search.',
  },
  {
    q: 'Do I need to be verified before I can search for properties?',
    a: 'Yes. Tenants must complete their onboarding profile and receive admin approval before browsing listings. This helps us maintain a trusted community.',
  },
  {
    q: 'How do I list my property as a landlord?',
    a: 'After registering as a landlord and completing your onboarding, you can create a new listing from your Landlord Dashboard. Your listing will be reviewed by our admin team before going live.',
  },
  {
    q: 'Is my personal information and documents kept private?',
    a: 'Absolutely. Your documents are stored securely and are only accessible to our admin team for verification purposes.',
  },
  {
    q: 'How long does the approval process take?',
    a: 'Admin review typically takes 1-2 business days. You will be notified once your account has been approved.',
  },
  {
    q: 'What property types are available on RentEase?',
    a: 'RentEase supports rooms, apartments, houses, studios, and hostels — catering to different budgets and lifestyles.',
  },
];

const FAQAccordionItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
      >
        <span className="text-sm font-medium text-slate-800 dark:text-slate-100 pr-4">{q}</span>
        <span className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 bg-white dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

const InlineFAQ = () => (
  <>
    {faqItems.map((item) => (
      <FAQAccordionItem key={item.q} q={item.q} a={item.a} />
    ))}
  </>
);

export default function LandingPage() {
  const [, setSearchFilters] = useState<any>({});
  const { data: featuredListings, isLoading } = useListings({});
  const featured = (featuredListings || []).slice(0, 6);

  return (
    <div className="min-h-screen bg-[#F4F9F9] dark:bg-slate-950 font-['Poppins']">
      {/* ─── Hero Section ─── */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
            Find Real Property <br /> at Cheapest Price
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Browse thousands of verified properties. Connect directly with landlords. Find the perfect place to call home. This is our initiative to reduce your troubles.
          </p>

          <div className="max-w-4xl mx-auto mb-16">
            <SearchBar
              onSearch={(filters) => {
                setSearchFilters(filters);
                window.location.href = `/listings?city=${filters.city || ''}&type=${filters.propertyType || ''}`;
              }}
            />
          </div>

          <div className="flex justify-center mt-10">
            <img
              src="/hero-illustration.png"
              alt="House illustration with people"
              className="w-full max-w-4xl object-contain drop-shadow-sm"
              onError={(e) => setImageFallback(e, PROPERTY_IMAGE_FALLBACK)}
            />
          </div>
        </div>
      </section>

      {/* ─── Features Section: Minimum Living Cost ─── */}
      <section id="how-it-works" className="py-24 bg-[#F4F9F9] dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            <span className="border-b-4 border-secondary pb-1">Minimum</span> Living Cost Takes Care Of Everything
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-16 items-center">
            <div className="rounded-[40px] overflow-hidden rounded-tl-none shadow-2xl relative h-[500px]">
              <img
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
                alt="House with pool"
                className="w-full h-full object-cover"
                onError={(e) => setImageFallback(e, PROPERTY_IMAGE_FALLBACK)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-12">
              {[
                { icon: DollarSign, title: 'Pay As Little\nAs Possible!' },
                { icon: Building2, title: 'Enjoy Wisdom\nOf Community!' },
                { icon: Layers, title: "Let's Somebody Else\nTake Care Of Landlord!" },
                { icon: Leaf, title: 'Enjoy Peaceful\nEnvironment!' },
                { icon: ShieldCheck, title: 'Stay Safe!\nSave Money!' },
                { icon: Eye, title: 'Pay For What\nYou Use !' },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-start">
                  <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-7 w-7 text-secondary" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg leading-tight whitespace-pre-line">
                    {feature.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── List Of Properties Section ─── */}
      <section className="py-24 bg-[#F4F9F9] dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              <span className="border-b-4 border-secondary pb-1">List Of</span> Properties
            </h2>
            <Link
              to="/listings"
              className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded text-sm transition-colors shadow-md"
            >
              View All Property
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Flexibility Section ─── */}
      <section id="about" className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Collage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="relative rounded-3xl overflow-hidden h-64 shadow-xl">
                  <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80" alt="Flexible Leases" className="w-full h-full object-cover" onError={(e) => setImageFallback(e, PROPERTY_IMAGE_FALLBACK)} />
                  <div className="absolute inset-0 bg-black/20 flex items-start justify-center pt-6">
                    <span className="text-white font-bold text-lg">Flexible Leases</span>
                  </div>
                </div>
                <div className="relative rounded-3xl overflow-hidden h-64 shadow-xl">
                  <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80" alt="Monthly House Cleaning" className="w-full h-full object-cover" onError={(e) => setImageFallback(e, PROPERTY_IMAGE_FALLBACK)} />
                  <div className="absolute inset-0 bg-black/30 flex items-start justify-center pt-6 text-center px-4">
                    <span className="text-white font-bold text-lg">Monthly House Cleaning</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden h-64 shadow-xl">
                  <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80" alt="7-Day Happiness Guaranteed" className="w-full h-full object-cover" onError={(e) => setImageFallback(e, PROPERTY_IMAGE_FALLBACK)} />
                  <div className="absolute inset-0 bg-cyan-600/40 flex items-start justify-center pt-6 text-center px-4">
                    <span className="text-white font-bold text-lg">7-Day Happiness Guaranteed</span>
                  </div>
                </div>
                <div className="relative rounded-3xl overflow-hidden h-72 shadow-xl">
                  <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=400&q=80" alt="Choose Your Own Roommate" className="w-full h-full object-cover" onError={(e) => setImageFallback(e, PROPERTY_IMAGE_FALLBACK)} />
                  <div className="absolute inset-0 bg-black/40 flex items-start justify-center pt-6 text-center px-4">
                    <span className="text-white font-bold text-lg">Choose Your Own Roommate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="pl-0 lg:pl-10">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                Flexibility and options <br /> to suit your lifestyle.
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed max-w-lg">
                You need it? We got it. We make finding your next home easy, comfortable, and simple. From our happiness guarantee to our selective roommate finder option. We provide you the flexibility that you most desire.
              </p>
              <Link
                to="/listings"
                className="inline-block px-8 py-3.5 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl transition-colors shadow-lg"
              >
                Search Rooms
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Add Property CTA ─── */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">
            Your Property With Us And Be Confident That Your Room Will Be Filled Out!
          </h3>
          <div className="bg-[#F8FAFC] dark:bg-slate-800 p-10 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50">
            <h4 className="text-2xl font-bold text-secondary mb-4">Are you a Landlord?</h4>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              Join RentEase to list your properties, manage inquiries efficiently, and find reliable tenants through our verified platform.
            </p>
            <Link
              to="/register"
              className="inline-block px-10 py-4 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl transition-colors shadow-lg shadow-secondary/30"
            >
              Start Listing For Free
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Testimonial & Video ─── */}
      <section className="py-24 bg-[#F4F9F9] dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row shadow-2xl rounded-tr-3xl rounded-br-3xl overflow-hidden bg-[#FFF3EE] dark:bg-slate-800">
            {/* Testimonial */}
            <div className="flex-1 p-16 flex flex-col justify-center">
              <div className="text-secondary text-6xl font-serif leading-none mb-2">"</div>
              <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-8 italic">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam interdum nisl et nunc facilisis, a commodo eros mollis. Nunc vel pellentesque est. Curabitur at odio sit amet libero vulputate efficitur ac nec justo.
              </p>
              <div className="flex items-center gap-4">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Harry" alt="Harry Wilson" className="w-12 h-12 rounded-full border-2 border-secondary" onError={(e) => setImageFallback(e, AVATAR_IMAGE_FALLBACK)} />
                <div>
                  <h4 className="font-bold text-secondary">Harry Wilson</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Property Owner</p>
                </div>
              </div>
            </div>
            
            {/* Video Placeholder */}
            <div className="flex-1 relative">
              <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80" alt="Cafe" className="w-full h-full object-cover" onError={(e) => setImageFallback(e, PROPERTY_IMAGE_FALLBACK)} />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <button className="w-16 h-16 bg-secondary hover:scale-105 transition-transform rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer">
                  <Play className="h-6 w-6 ml-1" fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section id="faq" className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
            <div className="lg:col-span-1 lg:sticky lg:top-28">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-secondary border border-secondary/30 bg-secondary/10 rounded-full px-3 py-1 mb-6">
                FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
                Got questions?{' '}
                <span className="text-secondary">We have answers.</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                Everything you need to know about renting or listing properties on RentEase.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-secondary/30 text-sm"
              >
                Get started →
              </Link>
            </div>
            <div className="lg:col-span-2 space-y-3">
              <InlineFAQ />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-white dark:bg-slate-900 pt-16 pb-8 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-200 dark:border-slate-700">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Home className="h-4 w-4 text-secondary" />
                </div>
                <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight">
                  Rent<span className="text-secondary">Ease</span>
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                A trusted platform connecting landlords and tenants across Pakistan.
              </p>
             
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-4">Product</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Home', to: '/' },
                  { label: 'Browse Properties', to: '/listings' },
                  { label: 'How It Works', to: '/#how-it-works' },
                  { label: 'FAQ', to: '/#faq' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-sm text-slate-500 dark:text-slate-400 hover:text-secondary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-4">Services</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Tenant Onboarding', to: '/register' },
                  { label: 'Landlord Listings', to: '/register' },
                  { label: 'Property Verification', to: '/#about' },
                  { label: 'Inquiry Management', to: '/register' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-sm text-slate-500 dark:text-slate-400 hover:text-secondary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-4">Legal</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Privacy Policy', to: '/#privacy' },
                  { label: 'Terms of Service', to: '/#terms' },
                  { label: 'Help Center', to: '/#help' },
                  { label: 'Disclaimer', to: '/#disclaimer' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-sm text-slate-500 dark:text-slate-400 hover:text-secondary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 text-xs text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>Where you feel safe and grounded. Find the best place for you 
                to make your own.
              </span>
            </div>
            <p>© 2026 RentEase. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                <span>(123) 456-7890</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Printer className="h-3.5 w-3.5" />
                <span>(123) 456-7890</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
