import {
  AlertTriangle,
  TrendingDown,
  CreditCard,
  Target,
  DollarSign,
  Tag,
  Building2,
  Rocket,
  UserCheck,
  Lightbulb,
  Wallet,
  Percent,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  AlertTriangle,
  TrendingDown,
  CreditCard,
  Target,
  DollarSign,
  Tag,
  Building2,
  Rocket,
  UserCheck,
  Lightbulb,
  Wallet,
  Percent,
  TrendingUp,
  HelpCircle,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] || HelpCircle;
}
