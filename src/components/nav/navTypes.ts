import type { ComponentType } from 'react';

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: number;
}

export const isPathActive = (pathname: string, item: NavItem): boolean =>
  item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
