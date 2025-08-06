import { Button } from "@/components/ui/button";

interface About3Props {
  title?: string;
  description?: string;
  mainImage?: {
    src: string;
    alt: string;
  };
  secondaryImage?: {
    src: string;
    alt: string;
  };
  breakout?: {
    src: string;
    alt: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
  companiesTitle?: string;
  companies?: Array<{
    src: string;
    alt: string;
  }>;
  achievementsTitle?: string;
  achievementsDescription?: string;
  achievements?: Array<{
    label: string;
    value: string;
  }>;
}

const defaultCompanies = [
  {
    src: "https://images.unsplash.com/photo-1556761175-5773822d4f2b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Arc",
  },
  {
    src: "https://images.unsplash.com/photo-1556761175-5773822d4f2b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Descript",
  },
  {
    src: "https://images.unsplash.com/photo-1556761175-5773822d4f2b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Mercury",
  },
  {
    src: "https://images.unsplash.com/photo-1556761175-5773822d4f2b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Ramp",
  },
  {
    src: "https://images.unsplash.com/photo-1556761175-5773822d4f2b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Retool",
  },
  {
    src: "https://images.unsplash.com/photo-1556761175-5773822d4f2b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Watershed",
  },
];

const defaultAchievements = [
  { label: "Young Users Protected", value: "1000+" },
  { label: "Products Verified", value: "5000+" },
  { label: "Safety Alerts Sent", value: "95%" },
  { label: "University Partners", value: "15+" },
];

export const About3 = ({
  title = "About Our Mission",
  description = "TM01 is a passionate team dedicated to empowering young adults and first-time cosmetic users to make informed, safe choices about beauty products through data-driven insights and AI-powered verification.",
  mainImage = {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Young adults learning about cosmetic safety",
  },
  secondaryImage = {
    src: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Cosmetic products verification",
  },
  breakout = {
    src: "/logo.svg",
    alt: "TM01 logo",
    title: "Supporting UN SDG 3 & 12 Goals",
    description:
      "Promoting good health and well-being while encouraging responsible consumption of cosmetic products through transparency and education.",
    buttonText: "Learn More",
    buttonUrl: "https://sdgs.un.org/goals",
  },
  companiesTitle = "Trusted by young consumers in urban Malaysia",
  companies = defaultCompanies,
  achievementsTitle = "Our Impact on Cosmetic Safety",
  achievementsDescription = "Empowering university students, fresh graduates, and early-career professionals aged 18-30 to make informed decisions about cosmetic products and avoid harmful ingredients like mercury, hydroquinone, and corticosteroids.",
  achievements = defaultAchievements,
}: About3Props = {}) => {
  return (
    <section className="py-16">
      <div className="container mx-auto">
        <div className="mb-14 grid gap-5 text-center md:grid-cols-2 md:text-left">
          <h1 className="text-5xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="grid gap-7 lg:grid-cols-3">
          <img
            src={mainImage.src}
            alt={mainImage.alt}
            className="size-full max-h-[620px] rounded-xl object-cover lg:col-span-2"
          />
          <div className="flex flex-col gap-7 md:flex-row lg:flex-col">
            <div className="flex flex-col justify-between gap-6 rounded-xl bg-muted p-7 md:w-1/2 lg:w-auto">
              <img
                src={breakout.src}
                alt={breakout.alt}
                className="mr-auto h-12"
              />
              <div>
                <p className="mb-2 text-lg font-semibold">{breakout.title}</p>
                <p className="text-muted-foreground">{breakout.description}</p>
              </div>
              <Button variant="outline" className="mr-auto" asChild>
                <a href={breakout.buttonUrl} target="_blank">
                  {breakout.buttonText}
                </a>
              </Button>
            </div>
            <img
              src={secondaryImage.src}
              alt={secondaryImage.alt}
              className="grow basis-0 rounded-xl object-cover md:w-1/2 lg:min-h-0 lg:w-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}; 