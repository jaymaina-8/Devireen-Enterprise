import { fetchTestimonialsForAdmin } from '@/actions/testimonial.actions';
import { TestimonialClientView } from '@/components/dashboard/testimonials/TestimonialClientView';
import { Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Testimonials Management | Devireen Enterprise OS',
};

export default async function TestimonialsPage() {
  const result = await fetchTestimonialsForAdmin();
  const testimonials = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <Star className="h-6 w-6 fill-amber-400 text-amber-500" />{' '}
            Testimonials & Customer Reviews
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage B2B reviews, ratings, homepage features, and live customer
            feedback.
          </p>
        </div>
      </div>

      <TestimonialClientView initialTestimonials={testimonials} />
    </div>
  );
}
