import { Suspense } from 'react';
import fr from '@/i18n/fr';
import ObservationsPage from '@/components/ObservationsPage';

export default function InstrumentObservationsRoute() {
  return (
    <Suspense fallback={<div className="text-center py-12">{fr['common.loading']}</div>}>
      <ObservationsPage />
    </Suspense>
  );
}
