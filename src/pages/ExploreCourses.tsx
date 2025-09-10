import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, BookOpen, Clock, Users, Star, TrendingUp, Eye, MoreHorizontal, Bell, BellOff } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { CourseCard } from "@/components/ui/course-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categories = [
  { id: "all", name: "Todos os Cursos", icon: BookOpen, count: 124 },
  { id: "tech", name: "Tecnologia", icon: BookOpen, count: 45 },
  { id: "business", name: "Negócios", icon: Users, count: 32 },
  { id: "design", name: "Design", icon: Star, count: 28 },
  { id: "marketing", name: "Marketing", icon: Users, count: 19 },
];

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
    id: 4,
    title: "Gestão de Projetos Ágeis",
    description: "Metodologias ágeis aplicadas na gestão de projetos",
    category: "business",
    duration: "20h",
    students: 420,
    rating: 4.6,
    price: "R$ 149,90",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop&crop=center",
    instructor: "Ana Lima",
    level: "Intermediário"
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
  },
  {
    id: 6,
    title: "Estratégias de E-commerce",
    description: "Como criar e otimizar sua loja virtual",
    category: "business",
    duration: "35h",
    students: 730,
    rating: 4.8,
    price: "R$ 249,90",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop&crop=center",
    instructor: "Lucia Ferreira",
    level: "Intermediário"
  }
];

export default function ExploreCourses() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("trending"); // trending, popular, duration, rating, price
  const [favorites, setFavorites] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<{[key: string]: boolean}>({
    all: false,
    tech: false,
    business: false,
    design: false,
    marketing: false
  });

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case "duration":
        return parseInt(a.duration) - parseInt(b.duration);
      case "trending":
        return b.rating - a.rating; // Higher rating = more trending
      case "popular":
        return b.students - a.students; // More students = more popular
      case "rating":
        return b.rating - a.rating;
      case "price":
        return parseFloat(a.price.replace("R$ ", "").replace(",", ".")) - 
               parseFloat(b.price.replace("R$ ", "").replace(",", "."));
      default:
        return 0;
    }
  });

  const toggleFavorite = (courseId: number) => {
    setFavorites(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const toggleNotification = (categoryId: string) => {
    setNotifications(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Explore Nossos Cursos
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Descubra milhares de cursos online para acelerar sua carreira
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 h-14 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-1/4">
            <div className="bg-card rounded-lg p-6 shadow-card-custom">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Categorias</h3>
              </div>
              
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                        selectedCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNotification(category.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          {notifications[category.id] ? (
                            <Bell className="h-3 w-3 text-primary" />
                          ) : (
                            <BellOff className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                {filteredCourses.length} cursos encontrados
              </h2>
              <div className="flex gap-2">
                <Button 
                  variant={sortBy === "duration" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSortBy("duration")}
                  className="flex items-center gap-1"
                >
                  <Clock className="h-4 w-4" />
                  Duração
                </Button>
                <Button 
                  variant={sortBy === "trending" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSortBy("trending")}
                  className="flex items-center gap-1"
                >
                  <TrendingUp className="h-4 w-4" />
                  Em Alta
                </Button>
                <Button 
                  variant={sortBy === "popular" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSortBy("popular")}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  Mais Acessado
                </Button>
                
                {/* More filters dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-lg z-50">
                    <DropdownMenuItem 
                      onClick={() => setSortBy("rating")}
                      className={sortBy === "rating" ? "bg-accent" : ""}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Melhor Avaliação
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy("price")}
                      className={sortBy === "price" ? "bg-accent" : ""}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Menor Preço
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Cursos Gratuitos
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="h-4 w-4 mr-2" />
                      Mais Populares
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isFavorite={favorites.includes(course.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>

            {/* Load More */}
            {filteredCourses.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Carregar Mais Cursos
                </Button>
              </div>
            )}

            {/* No Results */}
            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum curso encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar seus filtros ou termos de busca.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}