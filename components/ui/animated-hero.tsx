import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/moving-border";
import Link from "next/link";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["safe", "healthy", "protected", "informed", "confident"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="bg-gradient-to-r from-[#ffa94d] via-[#ffcc9c] to-[#f4a582] bg-clip-text text-transparent">Keep Your Skin</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-4">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-light bg-gradient-to-r from-[#f06595] via-[#e83e8c] to-[#d63384] bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-gray-700 max-w-2xl text-center mt-2">
              Helping young adults in Malaysia make informed cosmetic choices
              and avoid harmful products. Protect your skin, protect your health
              with our comprehensive product safety database.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link href="/product-search">
              <Button
                borderRadius="1.75rem"
                className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800"
              >
                Start To Check
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
