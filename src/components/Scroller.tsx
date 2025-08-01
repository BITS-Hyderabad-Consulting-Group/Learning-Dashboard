import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import allCompanies from '@/data/alumni-firms.json';

type Company = {
    id: string;
    name: string;
    logoSrc: string;
};

// This is a self-contained component for a single scrolling row.
const ScrollerRow = ({
    companies,
    duration = 60,
    direction = 'left',
}: {
    companies: Company[];
    duration?: number;
    direction?: 'left' | 'right';
}) => {
    // Define the animation variants
    const marqueeVariants: Variants = {
        animate: {
            x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
            transition: {
                x: {
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: duration,
                    ease: 'linear',
                },
            },
        },
    };

    return (
        <motion.div className="flex w-max space-x-16" variants={marqueeVariants} animate="animate">
            {[...companies, ...companies].map((company, index) => (
                <div
                    key={`${company.id}-${index}`}
                    className="flex-shrink-0 w-40 h-20 flex items-center relative justify-center"
                    aria-hidden={index >= companies.length}
                >
                    <Image
                        src={company.logoSrc}
                        alt={company.name}
                        fill
                        className="p-4 object-contain transition-all grayscale hover:grayscale-0"
                    />
                </div>
            ))}
        </motion.div>
    );
};

export const Scroller = () => {
    // Split the companies into two lists for the two rows
    const halfwayIndex = Math.ceil(allCompanies.length / 2);
    const topRowCompanies = allCompanies.slice(0, halfwayIndex);
    const bottomRowCompanies = allCompanies.slice(halfwayIndex);

    return (
        <div className="w-full flex flex-col gap-8">
            <p className="text-xl text-gray-600 text-center mb-4">
                Inspired by <span className="font-semibold">BHCG Alumni</span> employed at Top
                Companies!
            </p>
            <div
                className="w-full overflow-hidden"
                style={{
                    maskImage:
                        'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                }}
            >
                <ScrollerRow companies={topRowCompanies} duration={150} direction="left" />
            </div>

            <div
                className="w-full overflow-hidden"
                style={{
                    maskImage:
                        'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                }}
            >
                <ScrollerRow companies={bottomRowCompanies} duration={150} direction="right" />
            </div>
        </div>
    );
};
