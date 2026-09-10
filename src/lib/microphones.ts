import type { MicrophonePosition } from '@/types';

export function getMicrophonePositions(
  numMics: number,
  singlePos: MicrophonePosition = 'neck',
): MicrophonePosition[] {
  if (numMics <= 0) return [];
  if (numMics === 1) return [singlePos];
  if (numMics === 2) return ['neck', 'bridge'];
  return ['neck', 'middle', 'bridge'];
}
