'use client';

import type { MicrophonePosition } from '@/types';
import { useI18n } from '@/i18n';

const POSITIONS: MicrophonePosition[] = ['neck', 'middle', 'bridge'];

export default function MicPositionSelect({
  value,
  onChange,
}: {
  value: MicrophonePosition;
  onChange: (value: MicrophonePosition) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="form-group">
      <label>{t('measForm.micPosition')}</label>
      <select value={value} onChange={e => onChange(e.target.value as MicrophonePosition)}>
        {POSITIONS.map(pos => (
          <option key={pos} value={pos}>{t(`pos.${pos}`)}</option>
        ))}
      </select>
    </div>
  );
}
