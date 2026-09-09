import { Suspense } from 'react';
import fr from '@/i18n/fr';
import ReglagesPage from '@/components/ReglagesPage';

export default function InstrumentReglagesRoute() {
  return (
    <Suspense fallback={<div className="text-center py-12">{fr['common.loading']}</div>}>
      <ReglagesPage />
    </Suspense>
  );
}
