'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TabNavigationProps {
  className?: string;
}

export const TabNavigation = ({ className }: TabNavigationProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: 'swap', label: 'Swap', path: '/swap' },
    { id: 'transfer', label: 'Transfer', path: '/transfer' },
  ];

  const handleTabClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className={cn('flex items-center justify-center mb-6', className)}>
      <div className="flex bg-muted/50 rounded-2xl p-1 border border-border">
        {tabs.map(tab => {
          const isActive = pathname === tab.path || (pathname === '/' && tab.id === 'swap');

          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => handleTabClick(tab.path)}
              className={cn(
                'relative px-6 py-2 rounded-xl font-medium transition-all duration-200',
                isActive
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              )}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
