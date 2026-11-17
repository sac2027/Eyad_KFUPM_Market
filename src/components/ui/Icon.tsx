import {
  Armchair,
  Battery,
  Bike,
  Book,
  Calculator,
  Camera,
  CircuitBoard,
  Coffee,
  Cpu,
  Gamepad2,
  GraduationCap,
  Keyboard,
  Lamp,
  Microwave,
  Monitor,
  Package,
  Printer,
  Refrigerator,
  Ruler,
  Shirt,
  Tent,
  Trophy,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export const ICONS: Record<string, LucideIcon> = {
  Armchair,
  Battery,
  Bike,
  Book,
  Calculator,
  Camera,
  CircuitBoard,
  Coffee,
  Cpu,
  Gamepad2,
  GraduationCap,
  Keyboard,
  Lamp,
  Microwave,
  Monitor,
  Package,
  Printer,
  Refrigerator,
  Ruler,
  Shirt,
  Tent,
  Trophy,
  Wrench,
  Zap,
}

export const ICON_NAMES = Object.keys(ICONS)

export function NamedIcon({ name, ...props }: { name: string } & React.ComponentProps<LucideIcon>) {
  const C = ICONS[name] ?? Package
  return <C aria-hidden="true" {...props} />
}
