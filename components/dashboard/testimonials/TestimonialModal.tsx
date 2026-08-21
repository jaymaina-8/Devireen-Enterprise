'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { X, Star, Upload, User, Sparkles } from 'lucide-react';
import {
  createTestimonialAction,
  updateTestimonialAction,
} from '@/actions/testimonial.actions';
import { useToastStore } from '@/lib/store/toast-store';

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonial?: any;
  onSuccess?: () => void;
}

export function TestimonialModal({
  isOpen,
  onClose,
  testimonial,
  onSuccess,
}: TestimonialModalProps) {
  const [customerName, setCustomerName] = useState(
    testimonial?.customer_name || ''
  );
  const [company, setCompany] = useState(testimonial?.company || '');
  const [position, setPosition] = useState(testimonial?.position || '');
  const [photoUrl, setPhotoUrl] = useState(testimonial?.photo_url || '');
  const [rating, setRating] = useState(testimonial?.rating || 5);
  const [review, setReview] = useState(testimonial?.review || '');
  const [isFeatured, setIsFeatured] = useState(
    testimonial?.is_featured ?? false
  );
  const [isPublished, setIsPublished] = useState(
    testimonial?.is_published ?? true
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    if (testimonial) {
      setCustomerName(testimonial.customer_name || '');
      setCompany(testimonial.company || '');
      setPosition(testimonial.position || '');
      setPhotoUrl(testimonial.photo_url || '');
      setRating(testimonial.rating || 5);
      setReview(testimonial.review || '');
      setIsFeatured(testimonial.is_featured ?? false);
      setIsPublished(testimonial.is_published ?? true);
    } else {
      setCustomerName('');
      setCompany('');
      setPosition('');
      setPhotoUrl('');
      setRating(5);
      setReview('');
      setIsFeatured(false);
      setIsPublished(true);
    }
  }, [testimonial, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        customer_name: customerName,
        company,
        position,
        photo_url: photoUrl,
        rating,
        review,
        is_featured: isFeatured,
        is_published: isPublished,
      };

      const res = testimonial
        ? await updateTestimonialAction(testimonial.id, data)
        : await createTestimonialAction(data);

      if (res.success) {
        addToast({
          title: testimonial ? 'Testimonial Updated' : 'Testimonial Added',
          description: `Saved review from ${customerName}`,
          variant: 'success',
        });
        onClose();
        if (onSuccess) onSuccess();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-in fade-in fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="animate-in fade-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
            {testimonial ? 'Edit Testimonial' : 'Add Testimonial'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto p-6 text-xs"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="cust_name"
                className="font-semibold text-slate-700"
              >
                Customer Name *
              </Label>
              <Input
                id="cust_name"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. John Kamau"
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company" className="font-semibold text-slate-700">
                Company / Organization
              </Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Apex Hardware Ltd"
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="position"
                className="font-semibold text-slate-700"
              >
                Role / Position
              </Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Procurement Director"
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="photo" className="font-semibold text-slate-700">
                Photo URL
              </Label>
              <Input
                id="photo"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Star Rating Picker */}
          <div className="space-y-1.5 pt-2">
            <Label className="block font-semibold text-slate-700">
              Star Rating *
            </Label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-slate-700">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-1.5">
            <Label htmlFor="review" className="font-semibold text-slate-700">
              Customer Review / Testimonial *
            </Label>
            <Textarea
              id="review"
              required
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did the customer say about Devireen products and service?"
              className="rounded-xl border-slate-200 text-xs"
            />
          </div>

          {/* Options Toggles */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50 p-3">
              <div>
                <span className="block font-semibold text-slate-900">
                  Published
                </span>
                <span className="text-[10px] text-slate-500">
                  Show on website
                </span>
              </div>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50 p-3">
              <div>
                <span className="block font-semibold text-slate-900">
                  Featured
                </span>
                <span className="text-[10px] text-slate-500">
                  Homepage Highlight
                </span>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 text-xs text-white shadow-sm hover:bg-blue-700"
            >
              {isSubmitting
                ? 'Saving...'
                : testimonial
                  ? 'Save Testimonial'
                  : 'Create Testimonial'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
