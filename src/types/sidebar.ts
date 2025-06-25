import { ReactElement } from 'react';
import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  title: string;
  label?: string;
  icon?: string | LucideIcon;
  path?: string;
  requiredLevel: number;
  category: string;
  children?: MenuItem[];
}