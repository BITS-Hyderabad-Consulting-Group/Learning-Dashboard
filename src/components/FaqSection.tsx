'use client';

import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import faqData from '@/data/faqs.json';

export const FaqSection = () => {
    return (
        <section className="my-24">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{faqData.title}</h2>
            </div>

            <div className="max-w-3xl mx-auto">
                <Accordion
                    type="single"
                    collapsible
                    defaultValue={faqData.items[0]?.id}
                    className="w-full"
                >
                    {faqData.items.map((item) => (
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
        </section>
    );
};
