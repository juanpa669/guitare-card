import { Suspense } from 'react';
import MeasuresPage from '@/components/MeasuresPage';

export default function InstrumentMeasuresRoute() {
  return (
    <Suspense fallback={<div className="text-center py-12">Chargement...</div>}>
      <MeasuresPage />
    </Suspense>
  );
}
