"use client";
import * as Accordion from "@radix-ui/react-accordion";
import Plus from "../assets/Plus.svg";
import { useSelector } from "react-redux";

const Faq = () => {
  const { skillnaavData } = useSelector((state) => state.root);

  if (!skillnaavData || !skillnaavData.faq || skillnaavData.faq.length === 0) {
    return null;
  }

  const { faqheading, faqsubheading } = skillnaavData.faq[0];
  const { faqcard } = skillnaavData;

  return (
    <div
      id="faqs"
      className="flex flex-col w-full py-48px lg:py-[60px] lg:flex-row lg:gap-x-6"
    >
      <div className="lg:w-1/3 lg:py-[32px] lg:pr-[56px]">
        <h3 className="font-medium text-[#EB2891] text-[14px] lg:text-base">
          {faqheading}
        </h3>
        <h1 className="font-medium text-2xl py-4 text-[#172026] text-[24px] lg:text-[42px] lg:leading-[58px]">
          {faqsubheading}
        </h1>
      </div>
      <div className="lg:w-2/3">
        <Accordion.Root
          type="single"
          defaultValue="item-1"
          collapsible
          className="flex flex-col gap-y-4"
        >
          {faqcard.map((item, index) => (
            <div key={index}>
              <Accordion.Item
                value={`item-${index + 1}`}
                className="bg-[#E3F1FF] p-[16px] rounded-[8px]"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="flex w-full items-center justify-between">
                    <p className="text-left text-[#172026] text-[16px] font-medium leading-[24px] lg:text-[18px]">
                      {item.faq}
                    </p>
                    <span className="text-left text-[#172026] text-[16px] font-medium leading-[24px]">
                      <img
                        src={Plus}
                        alt="See More"
                        className="sm:w-3 sm:h-2 lg:w-6 lg:h-6"
                      />
                    </span>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content>
                  <p className="pt-2 text-[#36485C]">{item.answer}</p>
                </Accordion.Content>
              </Accordion.Item>
            </div>
          ))}
        </Accordion.Root>
      </div>
    </div>
  );
};

export default Faq;
