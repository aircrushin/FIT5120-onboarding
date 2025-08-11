import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
    <div className="h-screen w-full">
      <div className="mx-auto h-full -mt-12 md:-mt-24 lg:-mt-32">
        <div className="flex gap-4 flex-col h-full items-center justify-center">
          <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
            <span className="bg-gradient-to-r from-[#ffa94d] via-[#ffcc9c] to-[#f4a582] bg-clip-text text-transparent">
              Keep Your Skin
            </span>
            <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-4">
              &nbsp;
              {titles.map((title, index) => (
                <motion.span
                  key={index}
                  className="absolute font-medium bg-gradient-to-r from-rose-400 via-pink-600 to-purple-700 bg-clip-text text-transparent p-2"
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
            Helping young adults in Malaysia make informed cosmetic choices and
            avoid harmful products. Protect your skin, protect your health with
            our comprehensive product safety database.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/product-search">
              <Button
                borderRadius="1.75rem"
                className="bg-white dark:bg-slate-900 text-black text-sm font-semibold dark:text-white border-neutral-200 dark:border-slate-800"
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
