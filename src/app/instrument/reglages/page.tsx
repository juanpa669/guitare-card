import { Suspense } from 'react';
import ReglagesPage from '@/components/ReglagesPage';

export default function InstrumentReglagesRoute() {
  return (
    <Suspense fallback={<div className="text-center py-12">Chargement...</div>}>
      <ReglagesPage />
    </Suspense>
  );
}
