"use client";
import React, { useState } from "react";

const faqs = [
  {
    question: "What is the Gyan Tech Club?",
    answer:
      "The Gyan Tech Club is a student-led organization focused on technology, innovation, and learning through hands-on experiences and collaborative projects.",
  },
  {
    question: "Who can join the club?",
    answer:
      "Any student with an interest in technology, regardless of skill level or background, is welcome to join the Gyan Tech Club.",
  },
  {
    question: "How do I become a member?",
    answer:
      "You can become a member by signing up through our official website or attending one of our introductory meetings.",
  },
  {
    question: "What activities does the club organize?",
    answer:
      "We organize workshops, hackathons, guest lectures, coding competitions, and collaborative projects throughout the academic year.",
  },
  {
    question: "Is there a membership fee?",
    answer:
      "No, membership in the Gyan Tech Club is free for all students.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 mb-5 transition-all duration-300 hover:shadow-inner hover:bg-[var(--primary-light)]`}
      style={{
        boxShadow:
          "inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <button
        className="w-full flex justify-between items-center text-left focus:outline-none"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-lg text-gray-900">{question}</span>
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-full border-2 border-[var(--primary)] text-[var(--primary)] transition-transform duration-300 cursor-pointer ${
            isOpen ? "rotate-45" : "rotate-0"
          }`}
          aria-hidden="true"
        >
          <svg
            className="w-4 h-4 stroke-[var(--primary)]"
            fill="none"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </button>
      <div
        className={`overflow-hidden text-gray-700 transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-96  opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="pl-1 pr-2">
          {answer && answer.trim() !== "" ? answer : "Answer will appear here."}
        </p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div
      className="min-h-screen px-6 py-20 md:px-12 md:py-24 flex flex-col items-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
      }}
    >
      {/* Background subtle shapes */}
      <div
        className="absolute top-[-100px] left-[-100px] w-72 h-72 bg-[var(--primary-light)] rounded-full opacity-20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-[var(--primary)] rounded-full opacity-15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <h1
        className="relative z-10 text-4xl md:text-5xl font-extrabold mb-14 text-center bg-clip-text  font-sans drop-shadow-md rounded-xl px-6 py-4 shadow-md"
        style={{
          background: "linear-gradient(90deg, var(--primary), var(--primary-light))",
        
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          backgroundColor: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
        }}
      >
        Frequently Asked Questions
      </h1>
      <div className="relative z-10 w-full max-w-2xl">
        {faqs.map((faq, idx) => (
          <FAQItem
            key={faq.question}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === idx}
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          />
        ))}
      </div>
    </div>
  );
}