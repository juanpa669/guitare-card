import { Suspense } from 'react';
import fr from '@/i18n/fr';
import EditInstrumentPage from '@/components/EditInstrumentPage';

export default function InstrumentEditRoute() {
  return (
    <Suspense fallback={<div className="text-center py-12">{fr['common.loading']}</div>}>
      <EditInstrumentPage />
    </Suspense>
  );
}
