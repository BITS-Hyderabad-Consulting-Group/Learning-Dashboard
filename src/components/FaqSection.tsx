'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import APIData from '@/app/APIdata.json';

export const FaqSection = () => {
    const faqData = APIData.faqPage;

    const [activeCategory, setActiveCategory] = useState(faqData.categories[0]?.id || '');
    const sectionRefs = useRef(new Map());

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveCategory(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-50% 0px -50% 0px',
                threshold: 0,
            }
        );

        sectionRefs.current.forEach((ref) => {
            if (ref) {
                observer.observe(ref);
            }
        });

        return () => {
            sectionRefs.current.forEach((ref) => {
                if (ref) {
                    observer.unobserve(ref);
                }
            });
        };
    }, []);

    return (
        <section className="w-full py-12 md:py-24 bg-white text-gray-900">
            <div className="container mx-auto px-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        {faqData.title}
                    </h2>
                    <p className="mt-2 text-md text-gray-500">Last updated {faqData.lastUpdated}</p>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    <div className="md:col-span-2 space-y-10">
                        {faqData.categories.map((category) => (
                            <div
                                key={category.id}
                                id={category.id}
                                ref={(el) => {
                                    sectionRefs.current.set(category.id, el);
                                }}
                            >
                                <h2 className="text-2xl font-bold mb-4">{category.title}</h2>
                                <Accordion type="single" collapsible className="w-full">
                                    {category.items.map((item) => (
                                        <AccordionItem key={item.id} value={item.id}>
                                            <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                                                {item.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-base text-gray-700 leading-relaxed">
                                                {item.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        ))}
                    </div>

                    <aside className="hidden md:block">
                        <div className="sticky top-24">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Categories</h3>
                            <ul className="space-y-3 border-l-2 border-gray-200 pl-4">
                                {faqData.categories.map((category) => (
                                    <li key={category.id}>
                                        <a
                                            href={`#${category.id}`}
                                            className={`-ml-[18px] block border-l-2 pl-4 font-semibold transition-colors ${
                                                activeCategory === category.id
                                                    ? 'border-teal-600 text-teal-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                                            }`}
                                        >
                                            {category.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
};
