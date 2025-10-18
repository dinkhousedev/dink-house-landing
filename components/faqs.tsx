"use client";

import React, { useState } from "react";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";

import faqs from "./faqs-data";
import WaitlistModal from "./WaitlistModal";

export default function FAQsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
      id="faqs"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-12">
        <h2 className="px-2 text-3xl leading-7">
          <span className="inline-block lg:hidden">FAQs</span>
          <span className="hidden bg-gradient-to-br from-black to-dink-lime dark:from-white dark:to-dink-lime bg-clip-text pt-4 text-5xl font-semibold tracking-tight text-transparent lg:inline-block">
            Frequently
            <br />
            asked
            <br />
            questions
          </span>
        </h2>
        <Accordion
          fullWidth
          keepContentMounted
          className="gap-3"
          itemClasses={{
            base: "px-0 sm:px-6",
            title: "font-medium",
            trigger: "py-6 flex-row-reverse",
            content: "pt-0 pb-6 text-base text-default-500",
          }}
          items={faqs}
          selectionMode="multiple"
        >
          {faqs.map((item, i) => (
            <AccordionItem
              key={i}
              indicator={<Icon icon="lucide:plus" width={24} />}
              title={item.title}
            >
              {item.content}
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Closing CTA Card */}
      <Card className="mt-12 max-w-4xl mx-auto bg-dink-lime">
        <CardBody className="text-center py-8 px-6">
          <Icon
            className="mx-auto mb-4 text-black"
            icon="solar:bell-bold"
            width={48}
          />
          <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">
            Ready to Be Part of The Dink House Community?
          </h3>
          <p className="text-black/80 text-base mb-6 max-w-2xl mx-auto">
            Join our notification list and be among the first to experience Bell
            County&rsquo;s premier pickleball facility
          </p>
          <Button
            className="h-12 bg-black px-8 text-base font-bold uppercase text-dink-lime transition-all hover:scale-105"
            radius="full"
            size="lg"
            onPress={() => setIsModalOpen(true)}
          >
            Get Notified
          </Button>
        </CardBody>
      </Card>

      <WaitlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
