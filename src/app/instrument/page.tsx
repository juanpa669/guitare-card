import { Suspense } from 'react';
import InstrumentDetailPage from '@/components/InstrumentDetailPage';

export default function InstrumentRoute() {
  return (
    <Suspense fallback={<div className="text-center py-12">Chargement...</div>}>
      <InstrumentDetailPage />
    </Suspense>
  );
}
