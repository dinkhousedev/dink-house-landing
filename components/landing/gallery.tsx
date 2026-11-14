import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Modal, ModalContent } from "@heroui/modal";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";

import { Reveal, SectionHeading } from "./shared";

import { MEDIA_URLS } from "@/config/media-urls";

const IMAGES = MEDIA_URLS.courtImages;

export default function Gallery() {
  const [active, setActive] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);

  const step = useCallback((delta: number) => {
    setDirection(delta);
    setActive((i) =>
      i === null ? i : (i + delta + IMAGES.length) % IMAGES.length,
    );
  }, []);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [active, step]);

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
      id="gallery"
    >
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          accent="first look."
          description="Architectural renderings of the building and courts going up in Nolanville."
          eyebrow="Gallery"
          title="Take a"
        />
        <Reveal>
          <p className="text-sm text-default-500">
            {IMAGES.length} renderings · tap to enlarge
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {IMAGES.map((src, i) => (
          <Reveal key={src} delay={(i % 3) * 0.08}>
            <button
              aria-label={`Open rendering ${i + 1} of ${IMAGES.length}`}
              className="group relative block aspect-[589/640] w-full overflow-hidden rounded-2xl border border-white/10 bg-dink-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dink-lime"
              type="button"
              onClick={() => {
                setDirection(1);
                setActive(i);
              }}
            >
              <Image
                fill
                alt={`The Dink House rendering ${i + 1}`}
                className="object-cover transition duration-700 group-hover:scale-110"
                sizes="(max-width: 1024px) 50vw, 33vw"
                src={src}
              />
              <span className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/40" />
              <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-dink-lime text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <Expand size={16} />
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      <Modal
        backdrop="blur"
        classNames={{
          base: "bg-black border border-white/10",
          closeButton:
            "z-20 bg-black/60 text-white hover:bg-dink-lime hover:text-black",
        }}
        isOpen={active !== null}
        placement="center"
        size="3xl"
        onClose={() => setActive(null)}
      >
        <ModalContent>
          {active !== null && (
            <div className="relative aspect-[589/640] max-h-[85vh] w-full overflow-hidden">
              <AnimatePresence
                custom={direction}
                initial={false}
                mode="popLayout"
              >
                <motion.div
                  key={active}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute inset-0"
                  custom={direction}
                  exit={{ opacity: 0, x: -direction * 60 }}
                  initial={{ opacity: 0, x: direction * 60 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    fill
                    alt={`The Dink House rendering ${active + 1}`}
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 768px"
                    src={IMAGES[active]}
                  />
                </motion.div>
              </AnimatePresence>
              <button
                aria-label="Previous rendering"
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-dink-lime hover:text-black"
                type="button"
                onClick={() => step(-1)}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                aria-label="Next rendering"
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-dink-lime hover:text-black"
                type="button"
                onClick={() => step(1)}
              >
                <ChevronRight size={22} />
              </button>
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                {IMAGES.map((src, i) => (
                  <span
                    key={src}
                    className={`h-1.5 rounded-full transition-all ${
                      i === active ? "w-6 bg-dink-lime" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}
