import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
interface NavItem {
    label: string;
    path: string;
    icon: React.ElementType;
    isButton?: boolean;
    onClick?: () => void;
}

export const Header: React.FC<{
    navItems: NavItem[];
    currentPath: string;
    onNavigate: (path: string) => void;
}> = ({ navItems, currentPath, onNavigate }) => {
    const handleClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        path: string,
        onClick?: () => void
    ) => {
        e.preventDefault();
        if (onClick) {
            onClick();
        } else {
            onNavigate(path);
        }
    };

    return (
        <header className="w-full bg-[#B4DEDD] h-[80px]">
            <div className="mx-auto flex max-w-7xl h-full items-center justify-between px-6 lg:px-8">
                <div className="flex items-center">
                    <Image
                        src="/LogoTeal.png"
                        alt="BHCG Logo"
                        width={602}
                        height={512}
                        className="h-18 w-auto object-contain"
                    />
                </div>

                <nav>
                    <ul className="flex items-center gap-2">
                        {navItems.map((item) => {
                            const isActive = currentPath === item.path;
                            const Icon = item.icon;

                            return (
                                <li key={item.path}>
                                    <a
                                        href={item.path}
                                        onClick={(e) => handleClick(e, item.path, item.onClick)}
                                        className={clsx(
                                            'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200',
                                            {
                                                'bg-white text-[#027F7B] shadow-sm hover:bg-gray-100':
                                                    item.isButton,

                                                'bg-[#027F7B] text-white hover:bg-[#026262]':
                                                    !item.isButton && isActive,

                                                'text-[#027F7B] hover:bg-[#007975]/10':
                                                    !item.isButton && !isActive,
                                            }
                                        )}
                                    >
                                        <Icon
                                            className={clsx('h-5 w-5', {
                                                'text-google-blue': item.isButton,
                                            })}
                                        />
                                        <span>{item.label}</span>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </header>
    );
};
