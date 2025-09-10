import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { CourseCard } from "@/components/ui/course-card";

// Mock data - in a real app this would come from a database or context
const courses = [
  {
    id: 1,
    title: "Desenvolvimento Web Completo",
    description: "Aprenda HTML, CSS, JavaScript e React do zero ao avançado",
    category: "tech",
    duration: "40h",
    students: 1250,
    rating: 4.8,
    price: "R$ 199,90",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop&crop=center",
    instructor: "João Silva",
    level: "Iniciante"
  },
  {
    id: 2,
    title: "Marketing Digital Avançado",
    description: "Estratégias completas de marketing digital para empresas",
    category: "marketing",
    duration: "30h",
    students: 890,
    rating: 4.9,
    price: "R$ 299,90",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&crop=center",
    instructor: "Maria Santos",
    level: "Intermediário"
  },
  {
    id: 3,
    title: "UX/UI Design Fundamentals",
    description: "Princípios essenciais de design de experiência do usuário",
    category: "design",
    duration: "25h",
    students: 650,
    rating: 4.7,
    price: "R$ 179,90",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop&crop=center",
    instructor: "Pedro Costa",
    level: "Iniciante"
  },
  {
    id: 5,
    title: "Python para Data Science",
    description: "Análise de dados e machine learning com Python",
    category: "tech",
    duration: "50h",
    students: 980,
    rating: 4.9,
    price: "R$ 349,90",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&crop=center",
    instructor: "Carlos Oliveira",
    level: "Avançado"
  }
];

export default function Favoritos() {
  const [favorites, setFavorites] = useState<number[]>([1, 3, 5]); // Mock favorited courses

  const favoriteCourses = courses.filter(course => favorites.includes(course.id));

  const toggleFavorite = (courseId: number) => {
    setFavorites(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Meus Favoritos
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Cursos que você salvou para acessar mais tarde
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">
            {favoriteCourses.length} {favoriteCourses.length === 1 ? 'curso favoritado' : 'cursos favoritados'}
          </h2>
        </div>

        {/* Favorites Grid */}
        {favoriteCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {favoriteCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isFavorite={favorites.includes(course.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum curso favoritado</h3>
            <p className="text-muted-foreground mb-6">
              Explore nossos cursos e adicione seus favoritos clicando no ícone de coração.
            </p>
            <Button asChild>
              <a href="/explorar-cursos">
                <BookOpen className="h-4 w-4 mr-2" />
                Explorar Cursos
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}