import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const headerRef = useRef<HTMLElement>(null);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isMobileMenuOpen]);

    // Close mobile menu on window resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        // Close mobile menu when navigating
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header ref={headerRef} className="w-full bg-[#B4DEDD] h-[80px] relative">
            <div className="mx-auto flex max-w-7xl h-full items-center justify-between px-6 lg:px-8">
                <motion.div
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Image
                        src="/LogoTeal.png"
                        alt="BHCG Logo"
                        width={602}
                        height={512}
                        className="h-18 w-auto object-contain"
                    />
                </motion.div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:block">
                    <motion.ul
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {navItems.map((item, index) => {
                            const isActive = currentPath === item.path;
                            const Icon = item.icon;

                            return (
                                <motion.li
                                    key={item.path}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
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
                                </motion.li>
                            );
                        })}
                    </motion.ul>
                </nav>

                {/* Mobile Menu Button */}
                <motion.button
                    className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md text-[#027F7B] hover:bg-[#007975]/10 transition-colors duration-200"
                    onClick={toggleMobileMenu}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </motion.div>
                </motion.button>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="lg:hidden absolute top-full left-0 right-0 bg-[#B4DEDD] border-t border-[#027F7B]/20 shadow-lg z-50"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.nav
                            className="max-w-7xl mx-auto px-6 py-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                        >
                            <ul className="space-y-2">
                                {navItems.map((item, index) => {
                                    const isActive = currentPath === item.path;
                                    const Icon = item.icon;

                                    return (
                                        <motion.li
                                            key={item.path}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{
                                                duration: 0.3,
                                                delay: index * 0.1,
                                                type: 'spring',
                                                stiffness: 100,
                                            }}
                                        >
                                            <a
                                                href={item.path}
                                                onClick={(e) =>
                                                    handleClick(e, item.path, item.onClick)
                                                }
                                                className={clsx(
                                                    'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200 w-full',
                                                    {
                                                        'bg-white text-[#027F7B] shadow-sm':
                                                            item.isButton,

                                                        'bg-[#027F7B] text-white':
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
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
