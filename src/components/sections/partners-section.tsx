import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";

const partners = [
  {
    name: "TechEdu",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop&crop=center",
    url: "https://techedu.com",
    initials: "TE"
  },
  {
    name: "LearnHub",
    logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=64&h=64&fit=crop&crop=center", 
    url: "https://learnhub.com",
    initials: "LH"
  },
  {
    name: "SkillForge",
    logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=64&fit=crop&crop=center",
    url: "https://skillforge.com", 
    initials: "SF"
  },
  {
    name: "EduTech",
    logo: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=64&h=64&fit=crop&crop=center",
    url: "https://edutech.com",
    initials: "ET"
  },
  {
    name: "CodeAcademy",
    logo: "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=64&h=64&fit=crop&crop=center",
    url: "https://codeacademy.com",
    initials: "CA"
  },
  {
    name: "DataCamp",
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=64&h=64&fit=crop&crop=center",
    url: "https://datacamp.com",
    initials: "DC"
  },
  {
    name: "WebDev",
    logo: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=64&h=64&fit=crop&crop=center",
    url: "https://webdev.com",
    initials: "WD"
  },
  {
    name: "CloudU",
    logo: "https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=64&h=64&fit=crop&crop=center",
    url: "https://cloudu.com",
    initials: "CU"
  }
];

export function PartnersSection() {
  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  return (
    <section className="py-12 bg-background border-t border-border/50 w-full overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Parceiros de Confiança
          </h2>
          <p className="text-muted-foreground">
            Conectados com as melhores plataformas educacionais
          </p>
        </div>
        
        <div className="relative overflow-hidden w-full">
          {/* Gradient overlays para smooth fade */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="flex animate-scroll-right group-hover:pause-animation w-max"
               style={{ width: 'max-content' }}>
            {/* Repetir os parceiros múltiplas vezes para movimento contínuo */}
            {[...partners, ...partners, ...partners, ...partners].map((partner, index) => (
              <div 
                key={`${partner.name}-${index}`} 
                className="flex-shrink-0 px-2 sm:px-4 group"
                onMouseEnter={(e) => {
                  const scrollElement = e.currentTarget.closest('.animate-scroll-right') as HTMLElement;
                  if (scrollElement) scrollElement.style.animationPlayState = 'paused';
                }}
                onMouseLeave={(e) => {
                  const scrollElement = e.currentTarget.closest('.animate-scroll-right') as HTMLElement;
                  if (scrollElement) scrollElement.style.animationPlayState = 'running';
                }}
              >
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center space-y-2 min-w-[80px] sm:min-w-[100px] group hover-scale"
                >
                  <Avatar className="h-12 w-12 sm:h-16 sm:w-16 ring-2 ring-border/50 group-hover:ring-primary/50 transition-all duration-300 shadow-lg">
                    <AvatarImage 
                      src={partner.logo} 
                      alt={`${partner.name} logo`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      {partner.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                    {partner.name}
                  </span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}