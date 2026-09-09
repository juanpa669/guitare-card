import { Suspense } from 'react';
import fr from '@/i18n/fr';
import MeasuresPage from '@/components/MeasuresPage';

export default function InstrumentMeasuresRoute() {
  return (
    <Suspense fallback={<div className="text-center py-12">{fr['common.loading']}</div>}>
      <MeasuresPage />
    </Suspense>
  );
}
