import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserCheck, Mail, Lock, User, Loader2 } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['tenant', 'landlord']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const { signUp, isSignUpPending } = useAuth();

  const { control, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'tenant',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    signUp(data);
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl glass-card shadow-2xl">
      <div className="flex flex-col items-center mb-8">
        <div className="p-3 bg-primary/10 rounded-xl mb-3 text-primary">
          <UserCheck className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
        <p className="text-sm text-muted-foreground mt-1">Join RentEase discover and manage rentals</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Full Name</label>
          <Controller
            name="fullName"
            control={control}
            render={({ field, fieldState }) => (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
                <input
                  {...field}
                  type="text"
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                    fieldState.invalid ? 'border-destructive' : 'border-slate-800'
                  }`}
                  disabled={isSignUpPending}
                />
                {fieldState.invalid && (
                  <p className="text-xs text-destructive mt-1 font-medium">{fieldState.error?.message}</p>
                )}
              </div>
            )}
          />
        </div>

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
                  disabled={isSignUpPending}
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
                  disabled={isSignUpPending}
                />
                {fieldState.invalid && (
                  <p className="text-xs text-destructive mt-1 font-medium">{fieldState.error?.message}</p>
                )}
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">I want to...</label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => field.onChange('tenant')}
                  className={`py-2 px-4 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                    field.value === 'tenant'
                      ? 'border-primary bg-primary text-primary-foreground shadow-md'
                      : 'border-primary/40 bg-white text-primary hover:bg-primary/5'
                  }`}
                  disabled={isSignUpPending}
                >
                  Discover Rentals (Tenant)
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange('landlord')}
                  className={`py-2 px-4 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                    field.value === 'landlord'
                      ? 'border-primary bg-primary text-primary-foreground shadow-md'
                      : 'border-primary/40 bg-white text-primary hover:bg-primary/5'
                  }`}
                  disabled={isSignUpPending}
                >
                  List Properties (Landlord)
                </button>
              </div>
            )}
          />
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-3 px-4 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
          disabled={isSignUpPending}
        >
          {isSignUpPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link to="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
};
