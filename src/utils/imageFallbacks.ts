import type { SyntheticEvent } from 'react';

export const PROPERTY_IMAGE_FALLBACK = '/property-placeholder.svg';
export const AVATAR_IMAGE_FALLBACK = '/avatar-placeholder.svg';

export function setImageFallback(
  event: SyntheticEvent<HTMLImageElement>,
  fallbackSrc: string
) {
  if (event.currentTarget.src.endsWith(fallbackSrc)) return;
  event.currentTarget.src = fallbackSrc;
}
