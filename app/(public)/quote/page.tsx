import { redirect } from 'next/navigation';

/**
 * The old /quote page is now replaced by the /cart checkout flow.
 * Permanently redirect any visitors who navigate here.
 */
export default function QuotePage() {
  redirect('/cart');
}
