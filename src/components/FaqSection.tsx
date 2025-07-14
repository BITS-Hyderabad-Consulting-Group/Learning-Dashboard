import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import APIData from "@/app/APIdata.json";

export const FaqSection = () => {
  const faqData = APIData.faqPage;

  return (
    <section className="w-full py-12 md:py-24 bg-white text-gray-900">
      {/* Main Title Area */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold ">{faqData.title}</h1>
        <p className="mt-2 text-md text-gray-500">
          Last updated {faqData.lastUpdated}
        </p>
      </div>

      {/* Main Content: Two-Column Layout */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left Column: Accordions */}
        <div className="md:col-span-2 space-y-10">
          {faqData.categories.map((category) => (
            <div key={category.id} id={category.id}>
              <h2 className="text-xl font-bold mb-4">{category.title}</h2>
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

        {/* Right Column: Sticky Sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-24">
            <ul className="space-y-3">
              {faqData.categories.map((category, index) => (
                <li key={category.id}>
                  <a
                    href={`#${category.id}`}
                    className={`font-semibold text-gray-600 hover:text-[#007975] transition-colors ${
                      index === 0 ? "text-[#007975]" : "" // Highlight the first item like the example
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
    </section>
  );
};
