import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  clicks: number;
  href: string;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Kit de Produtividade Digital",
    description: "Ferramentas e templates para organizar sua rotina de estudos e trabalho com eficiência máxima.",
    category: "Produtividade",
    imageUrl: "/placeholder.svg",
    clicks: 142,
    href: "#",
  },
  {
    id: "2",
    title: "Guia de Concursos 2026",
    description: "E-book completo com estratégias, cronogramas e dicas para aprovação em concursos públicos.",
    category: "Concursos",
    imageUrl: "/placeholder.svg",
    clicks: 87,
    href: "#",
  },
  {
    id: "3",
    title: "Pacote de Automações IA",
    description: "Prompts prontos e fluxos de automação para acelerar tarefas repetitivas com inteligência artificial.",
    category: "Inteligência Artificial",
    imageUrl: "/placeholder.svg",
    clicks: 203,
    href: "#",
  },
  {
    id: "4",
    title: "Mapa de Carreira Tech",
    description: "Roadmap visual interativo para quem quer migrar ou evoluir na área de tecnologia.",
    category: "Carreira",
    imageUrl: "/placeholder.svg",
    clicks: 64,
    href: "#",
  },
];

function ProductCard({ product, onClickSaibaMais }: { product: Product & { clicks: number }; onClickSaibaMais: () => void }) {
  return (
    <Card className="flex flex-col h-full overflow-hidden relative">
      {/* Click counter pill */}
      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur-sm border px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          <Eye className="h-3 w-3" />
          {product.clicks}
        </span>
      </div>

      {/* Image */}
      <div className="w-full aspect-[16/10] overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="text-lg font-semibold leading-tight">{product.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Footer: badge + CTA */}
        <div className="flex flex-col gap-3 mt-auto pt-2">
          <Badge variant="secondary" className="w-fit text-xs">
            {product.category}
          </Badge>
          <Button className="w-full" onClick={onClickSaibaMais}>
            Saiba Mais
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function Produtos() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  const handleClick = (id: string, href: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, clicks: p.clicks + 1 } : p))
    );
    if (href && href !== "#") {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <Helmet>
        <title>Produtos | PqEstudar</title>
        <meta name="description" content="Conheça os produtos selecionados pelo PqEstudar para acelerar seus estudos e carreira." />
      </Helmet>

      <PageHero
        title="Nossos Produtos"
        description="Recursos selecionados para impulsionar seus estudos, carreira e produtividade."
      />

      <main className="container mx-auto px-6 pt-12 md:pt-16 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClickSaibaMais={() => handleClick(product.id, product.href)}
            />
          ))}
        </div>
      </main>
    </>
  );
}
