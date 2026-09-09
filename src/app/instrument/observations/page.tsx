import { Suspense } from 'react';
import ObservationsPage from '@/components/ObservationsPage';

export default function InstrumentObservationsRoute() {
  return (
    <Suspense fallback={<div className="text-center py-12">Chargement...</div>}>
      <ObservationsPage />
    </Suspense>
  );
}
