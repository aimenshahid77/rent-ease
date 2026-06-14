import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { Home, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/* ─── Schemas ──────────────────────────────────────────── */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'At least 6 characters'),
});
const signupSchema = z.object({
  fullName: z.string().min(2, 'At least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'At least 6 characters'),
  role: z.enum(['tenant', 'landlord']),
});
type LoginData = z.infer<typeof loginSchema>;
type SignupData = z.infer<typeof signupSchema>;

/* ─── Floating label input ─────────────────────────────── */
/*
  Uses the site's actual CSS variables via Tailwind:
    text-primary  →  hsl(258 48% 52%)  purple
    border-primary
    text-foreground / text-muted-foreground
*/
const FloatInput = ({
  label, type = 'text', value, onChange, error, disabled,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; error?: string; disabled?: boolean;
}) => {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative pt-5 pb-1">
      <label
        className={`absolute left-0 pointer-events-none transition-all duration-200 font-medium ${
          lifted
            ? 'text-[11px] top-0 text-primary'
            : 'text-sm top-5 text-muted-foreground'
        }`}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        className={`w-full bg-transparent border-b outline-none pb-2 pt-1 text-sm transition-colors duration-200 text-foreground disabled:opacity-60 ${
          focused ? 'border-primary' : 'border-border'
        }`}
      />
      {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
    </div>
  );
};

/* ─── Illustration: house + people (Sign Up) ───────────── */
/* Site palette:
     primary-ish    #6B46C1  (hsl 258 48 52)
     secondary-ish  #7B2FD0  (hsl 265 62 52)
     light tint     #EDE9FE / #F5F3FF
     white          #FFFFFF
     dark text      #0F172A
*/
const SignupIllustration = () => (
  <svg viewBox="0 0 440 400" fill="none" xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-sm drop-shadow-xl">
    {/* Ground shadow */}
    <ellipse cx="220" cy="375" rx="160" ry="18" fill="#6B46C1" fillOpacity="0.12"/>

    {/* House body */}
    <rect x="100" y="195" width="240" height="160" rx="6" fill="white" stroke="#E2D9F3" strokeWidth="1.5"/>

    {/* Roof */}
    <polygon points="80,200 220,110 360,200" fill="#6B46C1"/>
    <polygon points="90,200 220,118 350,200" fill="#7C3AED"/>
    {/* Roof ridge highlight */}
    <line x1="220" y1="118" x2="220" y2="200" stroke="white" strokeWidth="1" strokeOpacity="0.3"/>

    {/* Door */}
    <rect x="183" y="270" width="54" height="85" rx="4" fill="#EDE9FE"/>
    <rect x="183" y="270" width="54" height="85" rx="4" stroke="#6B46C1" strokeWidth="1.5"/>
    <circle cx="230" cy="314" r="4" fill="#6B46C1"/>
    {/* Door arch top */}
    <path d="M183 274 Q210 255 237 274" fill="#DDD6FE" stroke="#6B46C1" strokeWidth="1"/>

    {/* Windows */}
    <rect x="118" y="225" width="65" height="50" rx="4" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="1.5"/>
    <line x1="150" y1="225" x2="150" y2="275" stroke="#C4B5FD" strokeWidth="1"/>
    <line x1="118" y1="250" x2="183" y2="250" stroke="#C4B5FD" strokeWidth="1"/>

    <rect x="257" y="225" width="65" height="50" rx="4" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="1.5"/>
    <line x1="289" y1="225" x2="289" y2="275" stroke="#C4B5FD" strokeWidth="1"/>
    <line x1="257" y1="250" x2="322" y2="250" stroke="#C4B5FD" strokeWidth="1"/>

    {/* Chimney */}
    <rect x="290" y="130" width="24" height="45" fill="#5B21B6"/>
    <rect x="286" y="127" width="32" height="10" rx="2" fill="#6B46C1"/>

    {/* Path to door */}
    <rect x="200" y="355" width="40" height="8" rx="4" fill="#DDD6FE"/>

    {/* Trees */}
    <rect x="55" y="300" width="8" height="55" rx="3" fill="#A78BFA"/>
    <circle cx="59" cy="290" r="22" fill="#7C3AED" fillOpacity="0.85"/>
    <circle cx="59" cy="282" r="16" fill="#8B5CF6"/>

    <rect x="376" y="308" width="8" height="47" rx="3" fill="#A78BFA"/>
    <circle cx="380" cy="298" r="20" fill="#7C3AED" fillOpacity="0.85"/>
    <circle cx="380" cy="291" r="14" fill="#8B5CF6"/>

    {/* Person — left, tenant */}
    {/* Body */}
    <rect x="40" y="248" width="22" height="32" rx="5" fill="#6B46C1"/>
    {/* Head */}
    <circle cx="51" cy="238" r="13" fill="#FBBF24"/>
    {/* Hair */}
    <path d="M38 234 Q51 222 64 234" fill="#1E1B4B"/>
    {/* Legs */}
    <rect x="40" y="278" width="9" height="22" rx="3" fill="#4C1D95"/>
    <rect x="53" y="278" width="9" height="22" rx="3" fill="#4C1D95"/>
    {/* Arms */}
    <line x1="40" y1="258" x2="26" y2="272" stroke="#6B46C1" strokeWidth="6" strokeLinecap="round"/>
    <line x1="62" y1="258" x2="74" y2="268" stroke="#6B46C1" strokeWidth="6" strokeLinecap="round"/>
    {/* Briefcase */}
    <rect x="74" y="266" width="14" height="11" rx="2" fill="#7C3AED"/>
    <line x1="81" y1="264" x2="81" y2="266" stroke="#6B46C1" strokeWidth="2"/>

    {/* Person — right, landlord */}
    <rect x="376" y="248" width="22" height="32" rx="5" fill="#7C3AED"/>
    <circle cx="387" cy="238" r="13" fill="#FCA5A5"/>
    <path d="M374 233 Q387 220 400 233" fill="#374151"/>
    <rect x="376" y="278" width="9" height="22" rx="3" fill="#5B21B6"/>
    <rect x="389" y="278" width="9" height="22" rx="3" fill="#5B21B6"/>
    <line x1="376" y1="258" x2="362" y2="268" stroke="#7C3AED" strokeWidth="6" strokeLinecap="round"/>
    <line x1="398" y1="258" x2="412" y2="272" stroke="#7C3AED" strokeWidth="6" strokeLinecap="round"/>
    {/* Key */}
    <circle cx="415" cy="268" r="6" fill="none" stroke="#C4B5FD" strokeWidth="2"/>
    <line x1="421" y1="272" x2="430" y2="279" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round"/>
    <line x1="427" y1="279" x2="427" y2="284" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="430" y1="279" x2="430" y2="283" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round"/>

    {/* Floating badge — "Verified" */}
    <rect x="90" y="90" width="108" height="36" rx="10" fill="white" stroke="#C4B5FD" strokeWidth="1.5"
      style={{ filter: 'drop-shadow(0 4px 8px rgba(107,70,193,0.15))' }}/>
    <circle cx="108" cy="108" r="8" fill="#6B46C1"/>
    <text x="104" y="112" fontSize="9" fill="white" fontWeight="700">✓</text>
    <text x="121" y="105" fontSize="8" fill="#6B46C1" fontWeight="700">Verified Listing</text>
    <text x="121" y="117" fontSize="7.5" fill="#8B5CF6">4.9 ★  ·  128 reviews</text>

    {/* Floating badge — price */}
    <rect x="248" y="88" width="100" height="36" rx="10" fill="white" stroke="#C4B5FD" strokeWidth="1.5"
      style={{ filter: 'drop-shadow(0 4px 8px rgba(107,70,193,0.15))' }}/>
    <rect x="256" y="96" width="14" height="20" rx="3" fill="#EDE9FE"/>
    <text x="258" y="110" fontSize="9" fill="#6B46C1" fontWeight="700">$</text>
    <text x="275" y="103" fontSize="7.5" fill="#374151" fontWeight="700">From $650/mo</text>
    <text x="275" y="115" fontSize="7" fill="#8B5CF6">Best deal nearby</text>

    {/* Stars scattered */}
    <text x="168" y="90" fontSize="13" fill="#C4B5FD" fillOpacity="0.7">★</text>
    <text x="390" y="160" fontSize="10" fill="#A78BFA" fillOpacity="0.5">★</text>
    <text x="40" y="190" fontSize="9" fill="#DDD6FE" fillOpacity="0.6">★</text>
  </svg>
);

/* ─── Illustration: dashboard (Login) ──────────────────── */
const LoginIllustration = () => (
  <svg viewBox="0 0 440 400" fill="none" xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-sm drop-shadow-xl">
    {/* Ground shadow */}
    <ellipse cx="220" cy="378" rx="155" ry="16" fill="#6B46C1" fillOpacity="0.10"/>

    {/* Monitor body */}
    <rect x="60" y="55" width="320" height="230" rx="14" fill="white" stroke="#E2D9F3" strokeWidth="2"/>
    {/* Screen inner bg */}
    <rect x="72" y="67" width="296" height="206" rx="8" fill="#F5F3FF"/>
    {/* Top bar */}
    <rect x="72" y="67" width="296" height="28" rx="8" fill="#EDE9FE"/>
    <circle cx="90" cy="81" r="5" fill="#6B46C1"/>
    <circle cx="106" cy="81" r="5" fill="#8B5CF6"/>
    <circle cx="122" cy="81" r="5" fill="#C4B5FD"/>
    {/* URL bar */}
    <rect x="140" y="73" width="180" height="16" rx="8" fill="white" stroke="#C4B5FD" strokeWidth="1"/>
    <text x="152" y="84" fontSize="7.5" fill="#8B5CF6">rentease.app/dashboard</text>

    {/* Stat cards row */}
    <rect x="84" y="108" width="82" height="58" rx="8" fill="white" stroke="#DDD6FE" strokeWidth="1.5"/>
    <rect x="179" y="108" width="82" height="58" rx="8" fill="white" stroke="#DDD6FE" strokeWidth="1.5"/>
    <rect x="274" y="108" width="82" height="58" rx="8" fill="white" stroke="#DDD6FE" strokeWidth="1.5"/>

    {/* Card 1 — listings */}
    <rect x="92" y="115" width="10" height="10" rx="2" fill="#6B46C1"/>
    <text x="106" y="124" fontSize="7.5" fill="#6B21A8" fontWeight="700">Listings</text>
    <text x="92" y="142" fontSize="18" fill="#1E1B4B" fontWeight="800">12</text>
    <text x="92" y="154" fontSize="7" fill="#7C3AED">+3 this week</text>

    {/* Card 2 — inquiries */}
    <rect x="187" y="115" width="10" height="10" rx="2" fill="#7C3AED"/>
    <text x="201" y="124" fontSize="7.5" fill="#6B21A8" fontWeight="700">Inquiries</text>
    <text x="187" y="142" fontSize="18" fill="#1E1B4B" fontWeight="800">47</text>
    <text x="187" y="154" fontSize="7" fill="#7C3AED">5 unread</text>

    {/* Card 3 — rating */}
    <rect x="282" y="115" width="10" height="10" rx="2" fill="#A78BFA"/>
    <text x="296" y="124" fontSize="7.5" fill="#6B21A8" fontWeight="700">Rating</text>
    <text x="282" y="142" fontSize="18" fill="#1E1B4B" fontWeight="800">4.9</text>
    <text x="282" y="154" fontSize="7" fill="#7C3AED">★★★★★</text>

    {/* Chart area */}
    <rect x="84" y="178" width="172" height="78" rx="8" fill="white" stroke="#DDD6FE" strokeWidth="1.5"/>
    <text x="92" y="191" fontSize="7.5" fill="#6B21A8" fontWeight="700">Monthly Views</text>
    {/* Bars */}
    {[
      { x: 92,  h: 28, o: '1.0' },
      { x: 108, h: 38, o: '0.8' },
      { x: 124, h: 22, o: '0.6' },
      { x: 140, h: 45, o: '1.0' },
      { x: 156, h: 35, o: '0.8' },
      { x: 172, h: 50, o: '1.0' },
      { x: 188, h: 42, o: '0.9' },
      { x: 204, h: 58, o: '1.0' },
      { x: 220, h: 48, o: '0.85' },
      { x: 236, h: 62, o: '1.0' },
    ].map((b, i) => (
      <rect key={i} x={b.x} y={248 - b.h} width="10" height={b.h} rx="3"
        fill="#6B46C1" fillOpacity={b.o} />
    ))}

    {/* Recent listings list */}
    <rect x="268" y="178" width="88" height="78" rx="8" fill="white" stroke="#DDD6FE" strokeWidth="1.5"/>
    <text x="276" y="191" fontSize="7.5" fill="#6B21A8" fontWeight="700">Recent</text>
    <rect x="276" y="196" width="72" height="9" rx="4" fill="#EDE9FE"/>
    <rect x="276" y="209" width="60" height="9" rx="4" fill="#F5F3FF"/>
    <rect x="276" y="222" width="66" height="9" rx="4" fill="#EDE9FE"/>
    <rect x="276" y="235" width="50" height="9" rx="4" fill="#F5F3FF"/>
    <rect x="276" y="248" width="58" height="9" rx="4" fill="#EDE9FE"/>

    {/* Monitor stand */}
    <rect x="198" y="285" width="44" height="22" rx="4" fill="#DDD6FE"/>
    <rect x="175" y="304" width="90" height="12" rx="6" fill="#C4B5FD"/>

    {/* Person at desk — left */}
    {/* Chair */}
    <rect x="44" y="328" width="52" height="8" rx="4" fill="#A78BFA"/>
    <rect x="56" y="336" width="8" height="24" rx="3" fill="#8B5CF6"/>
    <rect x="44" y="355" width="52" height="6" rx="3" fill="#A78BFA"/>
    {/* Body */}
    <rect x="52" y="290" width="22" height="30" rx="5" fill="#6B46C1"/>
    {/* Head */}
    <circle cx="63" cy="278" r="14" fill="#FBBF24"/>
    <path d="M49 273 Q63 261 77 273" fill="#1E1B4B"/>
    {/* Laptop */}
    <rect x="34" y="318" width="32" height="20" rx="3" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="1"/>
    <rect x="34" y="336" width="32" height="4" rx="2" fill="#DDD6FE"/>
    {/* Arms */}
    <line x1="52" y1="300" x2="36" y2="318" stroke="#6B46C1" strokeWidth="6" strokeLinecap="round"/>
    <line x1="74" y1="300" x2="78" y2="318" stroke="#6B46C1" strokeWidth="6" strokeLinecap="round"/>
    <rect x="52" y="316" width="9" height="22" rx="3" fill="#4C1D95"/>
    <rect x="63" y="316" width="9" height="22" rx="3" fill="#4C1D95"/>

    {/* Person — right */}
    <rect x="366" y="290" width="22" height="30" rx="5" fill="#7C3AED"/>
    <circle cx="377" cy="278" r="14" fill="#FCA5A5"/>
    <path d="M363 273 Q377 260 391 273" fill="#374151"/>
    <rect x="366" y="316" width="9" height="22" rx="3" fill="#5B21B6"/>
    <rect x="379" y="316" width="9" height="22" rx="3" fill="#5B21B6"/>
    <line x1="366" y1="300" x2="352" y2="316" stroke="#7C3AED" strokeWidth="6" strokeLinecap="round"/>
    <line x1="388" y1="300" x2="402" y2="314" stroke="#7C3AED" strokeWidth="6" strokeLinecap="round"/>
    {/* Phone in hand */}
    <rect x="400" y="308" width="12" height="20" rx="3" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="1"/>

    {/* Floating notification */}
    <rect x="310" y="34" width="110" height="38" rx="10" fill="white" stroke="#C4B5FD" strokeWidth="1.5"
      style={{ filter: 'drop-shadow(0 4px 10px rgba(107,70,193,0.18))' }}/>
    <circle cx="327" cy="53" r="8" fill="#6B46C1"/>
    <text x="323" y="57" fontSize="9" fill="white" fontWeight="700">!</text>
    <text x="340" y="48" fontSize="7.5" fill="#1E1B4B" fontWeight="700">New Inquiry</text>
    <text x="340" y="59" fontSize="7" fill="#8B5CF6">Tenant — Just now</text>

    {/* Floating success */}
    <rect x="22" y="40" width="100" height="36" rx="10" fill="white" stroke="#C4B5FD" strokeWidth="1.5"
      style={{ filter: 'drop-shadow(0 4px 10px rgba(107,70,193,0.15))' }}/>
    <circle cx="38" cy="58" r="8" fill="#10B981"/>
    <text x="34" y="62" fontSize="9" fill="white" fontWeight="700">✓</text>
    <text x="51" y="53" fontSize="7.5" fill="#1E1B4B" fontWeight="700">Approved!</text>
    <text x="51" y="65" fontSize="7" fill="#6B46C1">Listing is live</text>

    {/* Sparkles */}
    <text x="420" y="80" fontSize="14" fill="#C4B5FD" fillOpacity="0.6">✦</text>
    <text x="18" y="200" fontSize="10" fill="#A78BFA" fillOpacity="0.5">✦</text>
    <text x="430" y="240" fontSize="9" fill="#DDD6FE" fillOpacity="0.5">✦</text>
  </svg>
);

/* ─── Illustration panel ───────────────────────────────── */
const IllustrationPanel = ({ variant }: { variant: 'signup' | 'login' }) => (
  <div className="hidden lg:flex w-1/2 h-full flex-col items-center justify-center px-12 gap-10
    bg-gradient-to-br from-[#F4F9F9] via-[#EDE9FE]/40 to-[#F4F9F9]">
    {variant === 'signup' ? <SignupIllustration /> : <LoginIllustration />}
    <div className="text-center space-y-2 max-w-xs">
      <h3 className="text-xl font-bold text-foreground">
        {variant === 'signup' ? 'Find Your Perfect Home' : 'Manage Everything In One Place'}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {variant === 'signup'
          ? 'Browse verified listings, connect with landlords, and move in. Safe and Sound.'
          : 'Track listings, handle inquiries, and grow your rental portfolio from your dashboard.'}
      </p>
    </div>
  </div>
);

/* ─── Props & main component ───────────────────────────── */
interface AuthPageProps { initialView: 'login' | 'signup'; }

export default function AuthPage({ initialView }: AuthPageProps) {
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    signIn, isSignInPending,
    signUp, isSignUpPending,
    resetPassword, isResetPasswordPending,
    resendVerification, isResendVerificationPending,
  } = useAuth();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', role: 'tenant' },
  });

  const onLogin  = (d: LoginData)  => signIn(d);
  const onSignup = (d: SignupData) => signUp(d);

  const handlePasswordReset = () => {
    const email = loginForm.getValues('email')?.trim();
    if (!email || !z.string().email().safeParse(email).success) {
      toast.error('Enter your email first.'); return;
    }
    resetPassword({ email });
  };

  const handleResend = () => {
    const email = loginForm.getValues('email')?.trim();
    if (!email || !z.string().email().safeParse(email).success) {
      toast.error('Enter your email first.'); return;
    }
    if (resendCooldown > 0) return;
    resendVerification({ email }, {
      onSuccess: () => {
        setResendCooldown(60);
        const t = setInterval(() =>
          setResendCooldown(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000);
      },
    });
  };

  const isBusy = isSignInPending || isSignUpPending || isResetPasswordPending || isResendVerificationPending;

  const lEmail = loginForm.watch('email')    ?? '';
  const lPass  = loginForm.watch('password') ?? '';
  const sName  = signupForm.watch('fullName') ?? '';
  const sEmail = signupForm.watch('email')    ?? '';
  const sPass  = signupForm.watch('password') ?? '';
  const sRole  = signupForm.watch('role');

  useEffect(() => { setView(initialView); }, [initialView]);

  /* Shared button styles — use Tailwind CSS vars matching the site */
  const primaryBtn =
    'flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground ' +
    'text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-primary/25 transition-colors cursor-pointer disabled:opacity-60';
  const ghostBtn =
    'px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary ' +
    'hover:bg-primary/5 rounded-xl transition-colors cursor-pointer';

  /* Form panel — white card on the site's bg, matching every other page's white card style */
  const formPanel =
    'flex-1 h-full flex flex-col justify-center px-8 sm:px-12 xl:px-16 overflow-y-auto ' +
    'bg-white dark:bg-card';

  return (
    /* Full-viewport — no padding, matches `bg-background` of the site */
    <div className="fixed inset-0 overflow-hidden bg-background">

      {/* sliding track */}
      <div
        className="flex h-full w-[200%] transition-transform duration-500 ease-in-out"
        style={{ transform: view === 'login' ? 'translateX(-50%)' : 'translateX(0)' }}
      >

        {/* ══════ SIGN UP — illustration left, form right ══════ */}
        <div className="flex w-1/2 h-full shrink-0">

          <IllustrationPanel variant="signup" />

          {/* Sign-up form */}
          <div className={formPanel}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-10">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <Home className="h-4 w-4 text-primary" />
              </div>
              <span className="font-black text-foreground text-xl tracking-tight">
                Rent<span className="text-primary">Ease</span>
              </span>
            </Link>

            <h2 className="text-3xl font-bold text-foreground mb-1">Create Account</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Join RentEase, find your next home or list your property.
            </p>

            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-2 w-full max-w-md">
              <div className="grid grid-cols-2 gap-6">
                <Controller name="fullName" control={signupForm.control} render={({ field, fieldState }) => (
                  <FloatInput label="Full Name" value={sName} onChange={field.onChange}
                    error={fieldState.error?.message} disabled={isBusy} />
                )} />
                <Controller name="email" control={signupForm.control} render={({ field, fieldState }) => (
                  <FloatInput label="Email" type="email" value={sEmail} onChange={field.onChange}
                    error={fieldState.error?.message} disabled={isBusy} />
                )} />
              </div>

              <Controller name="password" control={signupForm.control} render={({ field, fieldState }) => (
                <FloatInput label="Password" type="password" value={sPass} onChange={field.onChange}
                  error={fieldState.error?.message} disabled={isBusy} />
              )} />

              {/* Role selector */}
              <div className="pt-5 pb-2">
                <p className="text-[11px] text-muted-foreground mb-3 uppercase tracking-wider font-semibold">
                  I want to
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(['tenant', 'landlord'] as const).map((r) => (
                    <button key={r} type="button" onClick={() => signupForm.setValue('role', r)}
                      disabled={isBusy}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer border-2 ${
                        sRole === r
                          ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                          : 'bg-transparent text-primary border-primary/30 hover:border-primary/60 hover:bg-primary/5'
                      }`}
                    >
                      {r === 'tenant' ? 'Find a Rental' : 'List Property'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-6">
                <button type="button" onClick={() => setView('login')} disabled={isBusy} className={ghostBtn}>
                  Login
                </button>
                <button type="submit" disabled={isBusy} className={primaryBtn}>
                  {isSignUpPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ══════ LOGIN — form left, illustration right ══════ */}
        <div className="flex w-1/2 h-full shrink-0">

          {/* Login form */}
          <div className={formPanel}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-10">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <Home className="h-4 w-4 text-primary" />
              </div>
              <span className="font-black text-foreground text-xl tracking-tight">
                Rent<span className="text-primary">Ease</span>
              </span>
            </Link>

            <h2 className="text-3xl font-bold text-foreground mb-1">Welcome Back</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Sign in to manage your listings and inquiries.
            </p>

            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-2 w-full max-w-md">
              <Controller name="email" control={loginForm.control} render={({ field, fieldState }) => (
                <FloatInput label="Email" type="email" value={lEmail} onChange={field.onChange}
                  error={fieldState.error?.message} disabled={isBusy} />
              )} />
              <Controller name="password" control={loginForm.control} render={({ field, fieldState }) => (
                <FloatInput label="Password" type="password" value={lPass} onChange={field.onChange}
                  error={fieldState.error?.message} disabled={isBusy} />
              )} />

              <div className="flex items-center justify-between pt-3 pb-2 flex-wrap gap-1">
                <button type="button" onClick={handlePasswordReset} disabled={isBusy}
                  className="text-xs text-primary hover:underline cursor-pointer disabled:opacity-50">
                  Forgot password?
                </button>
                <button type="button" onClick={handleResend} disabled={isBusy || resendCooldown > 0}
                  className="text-xs text-primary hover:underline cursor-pointer disabled:opacity-50">
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button type="button" onClick={() => setView('signup')} disabled={isBusy} className={ghostBtn}>
                  Sign Up
                </button>
                <button type="submit" disabled={isBusy} className={primaryBtn}>
                  {isSignInPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Login
                </button>
              </div>
            </form>

            {/* Verification hint */}
            <div className="mt-8 p-3 rounded-xl bg-primary/5 border border-primary/15 max-w-md">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-primary">Email not verified?</span>{' '}
                Click &quot;Resend verification&quot; above.
              </p>
            </div>
          </div>

          <IllustrationPanel variant="login" />
        </div>

      </div>
    </div>
  );
}
