import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogIn, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';

const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const {
    signIn,
    isSignInPending,
    resetPassword,
    isResetPasswordPending,
    resendVerification,
    isResendVerificationPending,
  } = useAuth();
  const [resendCooldown, setResendCooldown] = useState(0);

  const { control, handleSubmit, getValues } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    signIn(data);
  };

  const handlePasswordReset = () => {
    const email = getValues('email')?.trim();
    const result = loginSchema.shape.email.safeParse(email);

    if (!result.success) {
      toast.error('Enter your email address first, then request the reset link.');
      return;
    }

    resetPassword({ email });
  };

  const handleResendVerification = () => {
    const email = getValues('email')?.trim();
    const result = loginSchema.shape.email.safeParse(email);

    if (!result.success) {
      toast.error('Enter your email address first, then resend the verification link.');
      return;
    }

    if (resendCooldown > 0) return;

    resendVerification(
      { email },
      {
        onSuccess: () => {
          setResendCooldown(60);
          const interval = setInterval(() => {
            setResendCooldown((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        },
      }
    );
  };

  const isBusy = isSignInPending || isResetPasswordPending || isResendVerificationPending;

  return (
    <div className="w-full max-w-md p-8 rounded-2xl glass-card shadow-2xl">
      <div className="flex flex-col items-center mb-8">
        <div className="p-3 bg-primary/10 rounded-xl mb-3 text-primary">
          <LogIn className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to manage your RentEase listings</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Email Address</label>
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  {...field}
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                    fieldState.invalid ? 'border-destructive' : 'border-slate-800'
                  }`}
                  disabled={isBusy}
                />
                {fieldState.invalid && (
                  <p className="text-xs text-destructive mt-1 font-medium">{fieldState.error?.message}</p>
                )}
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Password</label>
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  {...field}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                    fieldState.invalid ? 'border-destructive' : 'border-slate-800'
                  }`}
                  disabled={isBusy}
                />
                {fieldState.invalid && (
                  <p className="text-xs text-destructive mt-1 font-medium">{fieldState.error?.message}</p>
                )}
              </div>
            )}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={isBusy}
            className="text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50 cursor-pointer"
          >
            Forgot password?
          </button>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={isBusy || resendCooldown > 0}
            className="text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50 cursor-pointer"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification'}
          </button>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isSignInPending} disabled={isBusy}>
          {isResetPasswordPending ? 'Sending Reset...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
        <p className="text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-primary">Email not verified?</span> Click &quot;Resend verification&quot; above.
          If you see a rate limit error, wait about an hour or ask an admin to confirm your email in Supabase.
        </p>
      </div>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Don&apos;t have an account? </span>
        <Link to="/register" className="text-primary hover:underline font-medium">
          Create account
        </Link>
      </div>
    </div>
  );
};
