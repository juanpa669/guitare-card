import { Suspense } from 'react';
import fr from '@/i18n/fr';
import InstrumentDetailPage from '@/components/InstrumentDetailPage';

export default function InstrumentRoute() {
  return (
    <Suspense fallback={<div className="text-center py-12">{fr['common.loading']}</div>}>
      <InstrumentDetailPage />
    </Suspense>
  );
}
