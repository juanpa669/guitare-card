import { Suspense } from 'react';
import EditInstrumentPage from '@/components/EditInstrumentPage';

export default function InstrumentEditRoute() {
  return (
    <Suspense fallback={<div className="text-center py-12">Chargement...</div>}>
      <EditInstrumentPage />
    </Suspense>
  );
}
