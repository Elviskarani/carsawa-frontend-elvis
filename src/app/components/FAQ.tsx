"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQItemProps extends FAQItem {
  isOpen: boolean;
  toggleOpen: () => void;
}

interface FAQProps {
  faqItems: FAQItem[];
}

const FAQItem = ({ question, answer, isOpen, toggleOpen }: FAQItemProps) => {
  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full py-3 px-6 flex justify-between items-center text-left focus:outline-none"
        onClick={toggleOpen}
      >
        <h3 className="font-bold text-gray-900">{question}</h3>
        <span className="ml-2">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-2">
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQ = ({ faqItems }: FAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-[#DEDCD9] p-6 rounded-lg">
      <h2 className="text-2xl font-black mb-6">FAQ</h2>
      <div className="bg-white rounded-lg overflow-hidden shadow">
        {faqItems.map((item, index) => (
          <FAQItem
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={openIndex === index}
            toggleOpen={() => toggleFAQ(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default FAQ;