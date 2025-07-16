import { __IS_PRO__ } from '../config/version';

export function withProFeature(Component: React.FC, Fallback: React.FC) {
  return __IS_PRO__ ? Component : Fallback;
}
