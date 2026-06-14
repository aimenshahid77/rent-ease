import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLandlordInquiries, useReplyToInquiry } from '../../hooks/useListings';
import { Link } from 'react-router-dom';
import {
  ExternalLink, Clock, CheckCircle2,
  ChevronDown, ChevronUp, Send, Loader2, Inbox
} from 'lucide-react';
import { AVATAR_IMAGE_FALLBACK, setImageFallback } from '../../utils/imageFallbacks';

const replySchema = z.object({
  reply: z.string().min(5, 'Reply must be at least 5 characters'),
});
type ReplyFormData = z.infer<typeof replySchema>;

function InquiryCard({ inquiry }: { inquiry: any }) {
  const [expanded, setExpanded] = useState(false);
  const { mutate: replyTo, isPending } = useReplyToInquiry();

  const { control, handleSubmit, reset } = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: { reply: '' },
  });

  const onReply = (data: ReplyFormData) => {
    replyTo(
      { inquiryId: inquiry.id, reply: data.reply },
      { onSuccess: () => { reset(); setExpanded(false); } }
    );
  };

  return (
    <div className={`p-5 bg-slate-900/40 border rounded-2xl space-y-4 transition-colors ${
      !inquiry.is_read ? 'border-primary/30 shadow-lg shadow-primary/5' : 'border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {!inquiry.is_read && (
              <span className="text-[10px] font-black uppercase tracking-widest bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded-full">New</span>
            )}
            <Link
              to={`/listings/${inquiry.listing_id}`}
              className="text-sm font-bold text-primary hover:underline flex items-center gap-1 truncate"
            >
              {inquiry.listing?.title || 'Property'}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </Link>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <img
              src={inquiry.tenant?.avatar_url || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${inquiry.tenant?.full_name}`}
              alt={inquiry.tenant?.full_name}
              className="w-4 h-4 rounded-full"
              onError={(e) => setImageFallback(e, AVATAR_IMAGE_FALLBACK)}
            />
            <span className="font-medium text-slate-400">{inquiry.tenant?.full_name || 'Tenant'}</span>
            <span>·</span>
            <Clock className="h-3 w-3" />
            <span>{new Date(inquiry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {inquiry.landlord_reply ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3" /> Replied
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-full">
              <Clock className="h-3 w-3" /> Pending
            </span>
          )}
        </div>
      </div>

      {/* Tenant Message */}
      <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
        <p className="text-xs uppercase font-bold text-slate-500 mb-1.5">Tenant's Message</p>
        <p className="text-sm text-slate-300 leading-relaxed italic">"{inquiry.message}"</p>
      </div>

      {/* Existing Reply */}
      {inquiry.landlord_reply && (
        <div className="p-3.5 bg-primary/5 border border-primary/15 rounded-xl">
          <p className="text-xs uppercase font-bold text-primary mb-1.5">Your Reply</p>
          <p className="text-sm text-slate-200 leading-relaxed">{inquiry.landlord_reply}</p>
          <p className="text-[10px] text-slate-500 mt-1.5">
            Sent {new Date(inquiry.replied_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      )}

      {/* Reply Section Toggle */}
      {!inquiry.landlord_reply && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {expanded ? 'Cancel Reply' : 'Write a Reply'}
          </button>

          {expanded && (
            <form onSubmit={handleSubmit(onReply)} className="space-y-3">
              <Controller
                name="reply"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Type your reply to the tenant..."
                      disabled={isPending}
                      className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${
                        fieldState.invalid ? 'border-destructive' : 'border-slate-800'
                      }`}
                    />
                    {fieldState.invalid && (
                      <p className="text-xs text-destructive mt-1">{fieldState.error?.message}</p>
                    )}
                  </div>
                )}
              />
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
              >
                {isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="h-4 w-4" /> Send Reply</>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default function LandlordInquiriesPage() {
  const { user } = useAuthStore();
  const { data: inquiries, isLoading } = useLandlordInquiries(user?.id || '');



  const unreplied = (inquiries || []).filter(i => !i.landlord_reply).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Tenant Inquiries</h1>
          <p className="text-slate-400 text-sm mt-1">
            {unreplied > 0 ? (
              <span className="text-yellow-400 font-semibold">{unreplied} inquiry{unreplied !== 1 ? 'ies' : ''} awaiting your reply</span>
            ) : (
              'All inquiries have been responded to.'
            )}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <p className="text-lg font-extrabold text-white">{inquiries?.length || 0}</p>
            <p className="text-[10px] uppercase font-bold text-slate-500">Total</p>
          </div>
          <div className="px-4 py-2 bg-yellow-400/5 border border-yellow-400/20 rounded-xl text-center">
            <p className="text-lg font-extrabold text-yellow-400">{unreplied}</p>
            <p className="text-[10px] uppercase font-bold text-slate-500">Pending</p>
          </div>
          <div className="px-4 py-2 bg-emerald-400/5 border border-emerald-400/20 rounded-xl text-center">
            <p className="text-lg font-extrabold text-emerald-400">{(inquiries?.length || 0) - unreplied}</p>
            <p className="text-[10px] uppercase font-bold text-slate-500">Replied</p>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-40 bg-slate-900/30 rounded-2xl border border-slate-800" />
          ))}
        </div>
      ) : !inquiries || inquiries.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Inbox className="h-14 w-14 text-slate-700 mx-auto" />
          <h2 className="text-xl font-bold text-slate-300">No inquiries yet</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            When tenants contact you about your listings, their messages will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Show unreplied first */}
          {[...inquiries]
            .sort((a, b) => (a.landlord_reply ? 1 : 0) - (b.landlord_reply ? 1 : 0))
            .map((inquiry) => (
              <InquiryCard key={inquiry.id} inquiry={inquiry} />
            ))}
        </div>
      )}
    </div>
  );
}
