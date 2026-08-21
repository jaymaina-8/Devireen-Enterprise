'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Star,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Quote,
  User,
  Sparkles,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { TestimonialModal } from './TestimonialModal';
import {
  deleteTestimonialAction,
  togglePublishTestimonialAction,
  toggleFeaturedTestimonialAction,
} from '@/actions/testimonial.actions';
import { useToastStore } from '@/lib/store/toast-store';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { format } from 'date-fns';

export function TestimonialClientView({
  initialTestimonials,
}: {
  initialTestimonials: any[];
}) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToastStore();

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      const matchSearch =
        t.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.company?.toLowerCase().includes(search.toLowerCase()) ||
        t.review?.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (filterStatus === 'published' && !t.is_published) return false;
      if (filterStatus === 'draft' && t.is_published) return false;
      if (filterStatus === 'featured' && !t.is_featured) return false;

      return true;
    });
  }, [testimonials, search, filterStatus]);

  const handleTogglePublish = async (t: any) => {
    try {
      const res = await togglePublishTestimonialAction(t.id, !t.is_published);
      if (res.success) {
        setTestimonials((prev) =>
          prev.map((item) =>
            item.id === t.id ? { ...item, is_published: !t.is_published } : item
          )
        );
        addToast({
          title: !t.is_published ? 'Published' : 'Unpublished',
          description: `Testimonial is now ${!t.is_published ? 'visible' : 'hidden'}`,
          variant: 'success',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleFeatured = async (t: any) => {
    try {
      const res = await toggleFeaturedTestimonialAction(t.id, !t.is_featured);
      if (res.success) {
        setTestimonials((prev) =>
          prev.map((item) =>
            item.id === t.id ? { ...item, is_featured: !t.is_featured } : item
          )
        );
        addToast({
          title: 'Featured Updated',
          description: `Testimonial featured state updated`,
          variant: 'success',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsProcessing(true);
    try {
      const res = await deleteTestimonialAction(itemToDelete.id);
      if (res.success) {
        setTestimonials((prev) =>
          prev.filter((item) => item.id !== itemToDelete.id)
        );
        addToast({
          title: 'Deleted',
          description: 'Testimonial removed',
          variant: 'success',
        });
        setDeleteConfirmOpen(false);
      }
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls Bar */}
      <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs sm:flex-row sm:items-center">
        <div className="flex max-w-xl flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search testimonials by customer, company, or text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border-slate-200 pl-10 text-xs"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-xl border-slate-200 bg-slate-50 px-3 text-xs font-medium"
          >
            <option value="all">All Reviews ({testimonials.length})</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts / Hidden</option>
            <option value="featured">Featured Only</option>
          </select>
        </div>

        <Button
          onClick={() => {
            setEditingItem(null);
            setModalOpen(true);
          }}
          className="rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      {/* Main Grid + Live Preview Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Testimonials List Cards (2 cols) */}
        <div className="space-y-4 lg:col-span-2">
          {filteredTestimonials.length > 0 ? (
            filteredTestimonials.map((t) => (
              <div
                key={t.id}
                className="group relative space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 font-bold text-slate-600">
                      {t.photo_url ? (
                        <img
                          src={t.photo_url}
                          alt={t.customer_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        t.customer_name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        {t.customer_name}
                        {t.company && (
                          <span className="flex items-center gap-1 text-xs font-normal text-slate-500">
                            <Building2 className="h-3 w-3" /> {t.company}
                          </span>
                        )}
                      </h3>
                      {t.position && (
                        <p className="text-[11px] text-slate-400">
                          {t.position}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleFeatured(t)}
                      className={`rounded-lg border p-1.5 transition-colors ${
                        t.is_featured
                          ? 'border-amber-200 bg-amber-50 text-amber-600'
                          : 'border-slate-200 text-slate-400 hover:text-amber-500'
                      }`}
                      title="Toggle Featured"
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${t.is_featured ? 'fill-amber-400' : ''}`}
                      />
                    </button>
                    <button
                      onClick={() => handleTogglePublish(t)}
                      className={`rounded-lg border p-1.5 transition-colors ${
                        t.is_published
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                          : 'border-slate-200 bg-slate-100 text-slate-500'
                      }`}
                      title="Toggle Publish"
                    >
                      {t.is_published ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= t.rating
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="relative border-l-2 border-slate-200 pl-4 text-xs leading-relaxed text-slate-700 italic">
                  &ldquo;{t.review}&rdquo;
                </p>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 font-mono text-[11px] text-slate-400">
                  <span>
                    Created {format(new Date(t.created_at), 'MMM d, yyyy')}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingItem(t);
                        setModalOpen(true);
                      }}
                      className="h-7 rounded-lg px-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setItemToDelete(t);
                        setDeleteConfirmOpen(true);
                      }}
                      className="h-7 rounded-lg px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              <Quote className="mx-auto h-12 w-12 text-slate-300" />
              <p className="font-semibold text-slate-700">
                No testimonials match your filter criteria.
              </p>
              <p className="text-xs text-slate-400">
                Click &quot;Add Testimonial&quot; to publish your first customer
                review.
              </p>
            </div>
          )}
        </div>

        {/* Live Storefront Preview Widget */}
        <div className="space-y-4">
          <div className="sticky top-20 space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Sparkles className="h-4 w-4 text-blue-600" /> Storefront Live
                Preview
              </h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                Active Component
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Here is how featured testimonials will be displayed on the public
              landing page to build trust with buyers.
            </p>

            {filteredTestimonials.find((t) => t.is_featured) ? (
              <div className="space-y-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-md">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-slate-200 italic">
                  &ldquo;
                  {filteredTestimonials.find((t) => t.is_featured)?.review}
                  &rdquo;
                </p>
                <div className="flex items-center gap-2.5 border-t border-slate-700/80 pt-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    {filteredTestimonials
                      .find((t) => t.is_featured)
                      ?.customer_name.slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-white">
                      {
                        filteredTestimonials.find((t) => t.is_featured)
                          ?.customer_name
                      }
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {filteredTestimonials.find((t) => t.is_featured)
                        ?.company || 'Verified Client'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
                Star any review as &quot;Featured&quot; to preview it here.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <TestimonialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        testimonial={editingItem}
        onSuccess={() => {
          // Re-fetch or update list
          window.location.reload();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Testimonial"
        description={`Are you sure you want to delete the testimonial from "${itemToDelete?.customer_name}"?`}
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        isProcessing={isProcessing}
      />
    </div>
  );
}
