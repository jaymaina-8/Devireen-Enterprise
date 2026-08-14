import { ZodError } from 'zod';
import { logger } from '@/lib/logger';
import { AppError } from '@/lib/errors/AppError';

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string[]>;
  count?: number | null; // Added for paginated responses (like products)
};

/**
 * A higher-order function to wrap Server Actions.
 * 
 * - Explicitly catches `ZodError` and formats as validation errors.
 * - Checks for `AppError` and returns safe error messages.
 * - Catches generic exceptions, logs them securely on the server with stack trace,
 *   and returns a generic error string to prevent information disclosure.
 */
export async function withErrorHandling<T>(
  actionName: string,
  actionFn: () => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const result = await actionFn();
    
    // Check if result is already formatted as { success, data } (for legacy compatibility)
    // Some actions might be partially migrated and still return success object
    if (result && typeof result === 'object' && 'success' in result) {
       return result as any;
    }

    return { success: true, data: result };
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    if (error instanceof ZodError || (error && error.name === 'ZodError')) {
      // It's safe to return Zod field errors to the client
      const validationErrors: Record<string, string[]> = {};
      const errorsList = (error as any).errors || (error as any).issues || [];
      errorsList.forEach((err: any) => {
        const path = err.path ? err.path.join('.') : 'unknown';
        if (!validationErrors[path]) {
          validationErrors[path] = [];
        }
        validationErrors[path].push(err.message);
      });
      return { success: false, error: 'Validation failed', validationErrors };
    }

    if (error instanceof AppError) {
      // We log custom errors as warnings or errors based on type
      if (error.statusCode >= 500) {
        logger.error(`Action ${actionName} failed with AppError:`, error);
      } else {
        logger.warn(`Action ${actionName} failed with AppError:`, error);
      }
      return { success: false, error: error.message };
    }

    // Unhandled/Unknown Errors
    // Log the full error to the server securely
    logger.error(`Unhandled error in action [${actionName}]:`, error);

    // Return a generic error message to the client to avoid info disclosure
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Utility to wrap action directly without needing arguments explicitly passed
 */
type UnwrappedReturn<T> = T extends { success: boolean; data: infer D } ? D : (T extends { success: boolean; data?: infer D } ? D : T);

export function createSafeAction<Args extends any[], Return>(
  name: string,
  fn: (...args: Args) => Promise<Return>
) {
  return async (...args: Args): Promise<ActionResponse<UnwrappedReturn<Return>>> => {
    try {
      const result = await fn(...args);
      // For actions that return {success, data} shape natively
      if (result && typeof result === 'object' && 'success' in result) {
         return result as any;
      }
      return { success: true, data: result as any };
    } catch (error: any) {
      if (error && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
        throw error;
      }

      if (error instanceof ZodError || (error && error.name === 'ZodError')) {
        const validationErrors: Record<string, string[]> = {};
        const errorsList = (error as any).errors || (error as any).issues || [];
        errorsList.forEach((err: any) => {
          const path = err.path ? err.path.join('.') : 'unknown';
          if (!validationErrors[path]) {
            validationErrors[path] = [];
          }
          validationErrors[path].push(err.message);
        });
        return { success: false, error: 'Validation failed', validationErrors };
      }
      
      if (error instanceof AppError) {
        if (error.statusCode >= 500) {
          logger.error(`Action ${name} failed with AppError:`, error);
        } else {
          logger.warn(`Action ${name} failed with AppError:`, error);
        }
        return { success: false, error: error.message };
      }
      
      logger.error(`Unhandled error in action [${name}]:`, error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };
}
