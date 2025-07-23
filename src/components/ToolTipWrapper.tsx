'use client';

import * as Tooltip from '@radix-ui/react-tooltip';
import { ReactNode } from 'react';
import clsx from 'clsx';

interface TooltipWrapperProps {
    label: string;
    children: ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    delayDuration?: number;
    className?: string;
}

export const TooltipWrapper = ({
    label,
    children,
    side = 'top',
    sideOffset = 6,
    delayDuration = 200,
    className = '',
}: TooltipWrapperProps) => {
    return (
        <Tooltip.Provider delayDuration={delayDuration}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content
                        side={side}
                        sideOffset={sideOffset}
                        className={clsx(
                            'z-50 rounded px-2 py-1 text-xs text-white bg-gray-800 shadow-md animate-fade-in',
                            className
                        )}
                    >
                        {label}
                        <Tooltip.Arrow className="fill-gray-800" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
};
