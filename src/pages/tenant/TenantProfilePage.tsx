import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Phone, Camera } from 'lucide-react';
import { AVATAR_IMAGE_FALLBACK, setImageFallback } from '../../utils/imageFallbacks';
import { Button } from '../../components/ui/Button';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  bio: z.string().max(300, 'Bio max 300 chars').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const inputClass =
  'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all';

export default function TenantProfilePage() {
  const { user } = useAuthStore();
  const { updateProfile, isUpdateProfilePending } = useAuth();

  const { control, handleSubmit } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    if (!user) return;
    updateProfile({ userId: user.id, updates: data });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="pb-2">
        <h1 className="text-3xl font-extrabold text-slate-900">My Profile</h1>
        <p className="text-slate-600 text-sm mt-1">Update your personal information and contact details.</p>
      </div>

      <div className="flex items-center gap-5 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="relative">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user?.full_name}`}
            alt={user?.full_name || 'Profile'}
            className="w-20 h-20 rounded-2xl border-2 border-primary/20 object-cover"
            onError={(e) => setImageFallback(e, AVATAR_IMAGE_FALLBACK)}
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
            <Camera className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
        </div>
        <div>
          <p className="font-bold text-slate-900 text-lg">{user?.full_name || 'Tenant'}</p>
          <p className="text-slate-500 text-sm capitalize mt-0.5">
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold capitalize">{user?.role}</span>
          </p>
          <p className="text-slate-400 text-xs mt-1">Member since {user ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : ''}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Full Name</label>
          <Controller name="full_name" control={control} render={({ field, fieldState }) => (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input {...field} placeholder="Your full name" className={`${inputClass} pl-9 ${fieldState.invalid ? 'border-red-400' : ''}`} />
              {fieldState.invalid && <p className="text-xs text-red-500 mt-1">{fieldState.error?.message}</p>}
            </div>
          )} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Phone Number</label>
          <Controller name="phone" control={control} render={({ field }) => (
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input {...field} type="tel" placeholder="+92 300 0000000" className={`${inputClass} pl-9`} />
            </div>
          )} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Bio <span className="text-slate-400">(optional)</span></label>
          <Controller name="bio" control={control} render={({ field, fieldState }) => (
            <div>
              <textarea {...field} rows={4} placeholder="Tell landlords a bit about yourself..." className={`${inputClass} resize-none ${fieldState.invalid ? 'border-red-400' : ''}`} />
              <div className="flex justify-between mt-1">
                {fieldState.invalid && <p className="text-xs text-red-500">{fieldState.error?.message}</p>}
                <p className="text-xs text-slate-400 ml-auto">{field.value?.length || 0}/300</p>
              </div>
            </div>
          )} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500">Email Address <span className="text-xs">(cannot be changed)</span></label>
          <div className="relative opacity-70">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="email" value="managed by Supabase Auth" readOnly className={`${inputClass} pl-9 cursor-not-allowed bg-slate-50`} />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isUpdateProfilePending} loading={isUpdateProfilePending}>
            {isUpdateProfilePending ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
