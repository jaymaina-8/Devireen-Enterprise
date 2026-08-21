'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import {
  Image as ImageIcon,
  Trash2,
  Star,
  UploadCloud,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { useToastStore } from '@/lib/store/toast-store';
import {
  addProductImageRecord,
  deleteProductImageRecord,
  setPrimaryProductImageRecord,
} from '@/actions/product.actions';
import { uploadMediaAction, deleteMediaAction } from '@/actions/media.actions';
import { v4 as uuidv4 } from 'uuid';
import { useDropzone } from 'react-dropzone';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function ProductImageManager({
  productId,
  initialImages = [],
  onPendingFilesChange,
}: {
  productId?: string;
  initialImages?: any[];
  onPendingFilesChange?: (files: File[]) => void;
}) {
  const [images, setImages] = useState<any[]>(initialImages);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{
    id: string;
    url: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToastStore();
  const supabase = createClient();

  const handleUploadFiles = async (files: File[]) => {
    if (!files.length) return;

    if (!productId) {
      const newPending = [...pendingFiles, ...files];
      setPendingFiles(newPending);
      if (onPendingFilesChange) onPendingFilesChange(newPending);
      return;
    }

    setIsUploading(true);
    let uploadedCount = 0;

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}/${uuidv4()}.${fileExt}`;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'products');
        formData.append('path', fileName);

        const uploadResult = await uploadMediaAction(formData);

        if (!uploadResult.success)
          throw new Error(uploadResult.error || 'Failed to upload image');

        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);

        const url = publicUrlData.publicUrl;

        const isPrimary = images.length === 0 && uploadedCount === 0;

        const result = await addProductImageRecord({
          product_id: productId,
          url,
          is_primary: isPrimary,
          sort_order: images.length + uploadedCount,
        });

        if (result.success) {
          setImages((prev) => [...prev, result.data]);
          uploadedCount++;
        } else {
          throw new Error(result.error);
        }
      }

      addToast({
        title: 'Success',
        description: `${uploadedCount} image(s) uploaded`,
        variant: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Upload Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      handleUploadFiles(acceptedFiles);
    },
    [productId, images.length, pendingFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    disabled: isUploading,
  });

  const confirmDelete = (imageId: string, url: string) => {
    setImageToDelete({ id: imageId, url });
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!imageToDelete || !productId) return;

    setIsDeleting(true);
    try {
      const { id: imageId, url } = imageToDelete;

      // Delete from DB
      await deleteProductImageRecord(imageId, productId);

      // Try to extract path from URL and delete from storage
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/products/');
        if (pathParts.length > 1) {
          const filePath = pathParts[1];
          await deleteMediaAction('products', filePath);
        }
      } catch (e) {
        // Ignore storage delete errors if URL is external or not standard
      }

      // Update UI
      setImages(images.filter((img) => img.id !== imageId));
      addToast({
        title: 'Success',
        description: 'Image deleted',
        variant: 'success',
      });
      setDeleteConfirmOpen(false);
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setImageToDelete(null);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!productId) return;
    try {
      const result = await setPrimaryProductImageRecord(imageId, productId);
      if (result.success) {
        setImages(
          images.map((img) => ({
            ...img,
            is_primary: img.id === imageId,
          }))
        );
        addToast({
          title: 'Success',
          description: 'Primary image updated',
          variant: 'success',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? 'border-red-500 bg-red-50/50'
            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-red-500" />
            <p className="text-sm font-medium text-gray-900">
              Uploading images...
            </p>
          </div>
        ) : (
          <>
            <UploadCloud className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <p className="mb-1 text-sm font-medium text-gray-900">
              {isDragActive
                ? 'Drop the images here...'
                : 'Click or drag images to upload'}
            </p>
            <p className="text-xs text-gray-500">Supports JPG, PNG, WEBP</p>
          </>
        )}
      </div>

      {(images.length > 0 || pendingFiles.length > 0) && (
        <div>
          <h3 className="mb-4 text-sm font-medium text-gray-900">
            Uploaded Images ({images.length + pendingFiles.length})
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img) => (
              <div
                key={img.id}
                className={`group relative aspect-square overflow-hidden rounded-xl border-2 bg-gray-100 ${img.is_primary ? 'border-red-500 shadow-sm' : 'border-transparent hover:border-gray-300'}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt_text || 'Product image'}
                  fill
                  className="object-cover"
                />

                <div className="absolute inset-0 flex flex-col justify-between bg-black/40 p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <div className="flex justify-between">
                    {!img.is_primary && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPrimary(img.id);
                        }}
                        className="rounded bg-white/95 p-1.5 text-gray-700 shadow-sm transition-colors hover:text-red-600 active:scale-95"
                        title="Set as Primary"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    {img.is_primary && (
                      <div className="flex items-center rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow-sm">
                        <Star className="mr-1 h-3 w-3 fill-current" /> Primary
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(img.id, img.url);
                      }}
                      className="ml-auto rounded bg-white/95 p-1.5 text-red-600 shadow-sm transition-colors hover:bg-red-50 active:scale-95"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {pendingFiles.map((file, idx) => (
              <div
                key={`pending-${idx}`}
                className={`group relative aspect-square overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-100`}
              >
                <Image
                  src={URL.createObjectURL(file)}
                  alt="Pending upload"
                  fill
                  className="object-cover opacity-70"
                />

                <div className="absolute inset-0 flex flex-col justify-between bg-black/40 p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newPending = pendingFiles.filter(
                          (_, i) => i !== idx
                        );
                        setPendingFiles(newPending);
                        if (onPendingFilesChange)
                          onPendingFilesChange(newPending);
                      }}
                      className="rounded bg-white/95 p-1.5 text-red-600 shadow-sm transition-colors hover:bg-red-50 active:scale-95"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="rounded bg-white/90 p-1 text-center text-xs font-medium text-gray-700 backdrop-blur-sm">
                    Pending Upload
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Image"
        description="Are you sure you want to delete this image? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        isProcessing={isDeleting}
      />
    </div>
  );
}
