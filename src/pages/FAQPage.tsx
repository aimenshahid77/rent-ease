import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How do I find a rental property on RentEase?',
    answer:
      'After creating an account and completing your tenant onboarding, you can browse verified listings on the Browse Properties page. Use filters like city, budget, property type, and number of bedrooms to narrow down your search.',
  },
  {
    question: 'Do I need to be verified before I can search for properties?',
    answer:
      'Yes. For the safety of all users, tenants must complete their onboarding profile and receive admin approval before they can browse and inquire about listings. This helps us maintain a trusted community.',
  },
  {
    question: 'How long does the approval process take?',
    answer:
      'Admin review typically takes 1-2 business days after you submit your onboarding documents. You will be notified once your account has been approved.',
  },
  {
    question: 'How do I list my property as a landlord?',
    answer:
      'After registering as a landlord and completing your onboarding, you can create a new listing from your Landlord Dashboard. Your listing will be reviewed by our admin team before going live.',
  },
  {
    question: 'Can landlords manage inquiries from tenants?',
    answer:
      'Yes. Once approved, landlords can view all tenant inquiries from the Inquiries page on their dashboard and reply directly through the platform.',
  },
  {
    question: 'Is my personal information and uploaded documents kept private?',
    answer:
      'Absolutely. Your documents (CNIC, profile photo, certificates) are stored securely in our private cloud storage and are only accessible to our admin team for verification purposes.',
  },
  {
    question: 'What property types are available on RentEase?',
    answer:
      'RentEase supports a wide range of property types including rooms, apartments, houses, studios, and hostels — catering to different budgets and lifestyles.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'You can reach us at the contact details listed in the footer. We are available Monday to Friday, 9am-6pm. For urgent issues, send an email and we will respond within 24 hours.',
  },
];

const FAQItem = ({ question, answer }: FAQItem) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-sm"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
      >
        <span className="text-sm font-medium text-slate-800 dark:text-slate-100 pr-4">{question}</span>
        {open
          ? <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" />
          : <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
        }
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 bg-white dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          {/* Left column */}
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

          {/* Right column — accordion */}
          <div className="lg:col-span-2 space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
