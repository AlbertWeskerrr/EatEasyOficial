import { DietaryRestriction, RESTRICTION_CATEGORIES, RestrictionCategory } from '@/types/restrictions';
import { cn } from '@/lib/utils';

interface RestrictionBadgeProps {
  restriction: DietaryRestriction;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showName?: boolean;
  className?: string;
}

export function RestrictionBadge({
  restriction,
  size = 'sm',
  showIcon = true,
  showName = true,
  className,
}: RestrictionBadgeProps) {
  const category = RESTRICTION_CATEGORIES[restriction.category as RestrictionCategory];

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium border',
        category.bgClass,
        category.textClass,
        category.borderClass,
        sizeClasses[size],
        className
      )}
      title={restriction.description || restriction.name}
    >
      {showIcon && <span>{restriction.icon}</span>}
      {showName && <span>{restriction.name}</span>}
    </span>
  );
}

interface RestrictionBadgeGroupProps {
  restrictions: DietaryRestriction[];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RestrictionBadgeGroup({
  restrictions,
  maxVisible = 3,
  size = 'sm',
  className,
}: RestrictionBadgeGroupProps) {
  const visible = restrictions.slice(0, maxVisible);
  const remaining = restrictions.length - maxVisible;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {visible.map((r) => (
        <RestrictionBadge key={r.id} restriction={r} size={size} />
      ))}
      {remaining > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-full bg-muted text-muted-foreground font-medium',
            size === 'sm' ? 'text-xs px-1.5 py-0.5' : size === 'md' ? 'text-sm px-2 py-1' : 'text-base px-3 py-1.5'
          )}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
