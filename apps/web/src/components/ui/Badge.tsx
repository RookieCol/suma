interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'emerald' | 'amber' | 'orange' | 'red';
  className?: string;
}

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-card-2 text-ink-3 border-line',
  emerald: 'bg-success-subtle text-success-text border-success-subtle',
  amber:   'bg-warn-subtle text-warn-text border-warn-subtle',
  orange:  'bg-tang-subtle text-tang-text border-tang-subtle',
  red:     'bg-danger-subtle text-danger-text border-danger-subtle',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
