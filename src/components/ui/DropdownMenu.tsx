import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MoreHorizontal, ChevronRight } from 'lucide-react';

interface DropdownMenuProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

const DropdownMenu = ({ children, trigger, align = 'right', className }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
            align === 'right' ? 'right-0' : 'left-0',
            'top-full mt-1',
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick, disabled, className, icon }: DropdownMenuItemProps) => (
  <div
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
      disabled && 'pointer-events-none opacity-50',
      className
    )}
    onClick={disabled ? undefined : onClick}
  >
    {icon && <span className="mr-2 h-4 w-4">{icon}</span>}
    {children}
  </div>
);

const DropdownMenuSeparator = ({ className }: DropdownMenuSeparatorProps) => (
  <div className={cn('my-1 h-px bg-muted', className)} />
);

const DropdownMenuTrigger = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      'flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground',
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
