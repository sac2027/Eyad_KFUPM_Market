import { toast } from 'sonner'
import { useStore } from '../store/useStore'

/** Reset the demo and offer an undo, so a stray click never wipes someone's test data. */
export function resetWithUndo(t: (en: string, ar: string) => string) {
  const { users, listings, requests, deals, favorites, seededAt, finals } = useStore.getState()
  useStore.getState().reset()
  toast.success(t('Demo data reset', 'تمت إعادة البيانات التجريبية'), {
    description: t('Listings, requests and deals are back to the starting set.', 'رجعت الإعلانات والطلبات والصفقات للوضع الأساسي.'),
    action: { label: t('Undo', 'تراجع'), onClick: () => useStore.setState({ users, listings, requests, deals, favorites, seededAt, finals }) },
    duration: 8000,
  })
}
