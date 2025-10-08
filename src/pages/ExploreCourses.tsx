import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, BookOpen, Clock, Users, Star, TrendingUp, Eye, MoreHorizontal, Bell, BellOff, Settings, Gift, Presentation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { CourseCard } from "@/components/ui/course-card";
import { useCourses } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { NewsletterForm } from "@/components/ui/newsletter-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const categories = [
  { id: "all", name: "Todos os Cursos", icon: BookOpen, count: 124 },
  { id: "tech", name: "Tecnologia", icon: BookOpen, count: 45 },
  { id: "business", name: "Negócios", icon: Users, count: 32 },
  { id: "design", name: "Design", icon: Star, count: 28 },
  { id: "marketing", name: "Marketing", icon: Users, count: 19 },
];


export default function ExploreCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const { courses, loading } = useCourses();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("trending"); // trending, popular, duration, rating, price
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<{[key: string]: boolean}>({
    all: false,
    tech: false,
    business: false,
    design: false,
    marketing: false
  });
  const [showBonus, setShowBonus] = useState(false);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);

  // Mostrar bônus após 18 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBonus(true);
    }, 18000);

    return () => clearTimeout(timer);
  }, []);

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

  const toggleFavorite = (courseId: string) => {
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
            <div className="flex items-center justify-between max-w-6xl mx-auto mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Explore Nossos Cursos
                </h1>
                <p className="text-xl text-white/90 mb-8 max-w-2xl">
                  Descubra milhares de cursos online para acelerar sua carreira
                </p>
              </div>
              {isAdmin && (
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/admin/cursos')}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Administrar Cursos
                </Button>
              )}
            </div>
            
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
            {loading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={{
                      ...course,
                      image: course.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop&crop=center'
                    }}
                    isFavorite={favorites.includes(course.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}

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

      {/* Bônus Flutuante - Aparece após 18 segundos */}
      {showBonus && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 max-w-md shadow-2xl animate-pulse">
            <button
              onClick={() => setShowBonus(false)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Gift className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <Badge className="bg-primary text-primary-foreground text-xs font-semibold mb-2">
                  🎁 BÔNUS GRATUITO
                </Badge>
                <h3 className="font-bold text-lg mb-2">Workshop Gravado "Destravando o Notion"</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Um treinamento prático de 90 minutos que te ensinará a usar o Notion para construir seu "segundo cérebro"!
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">Valor: R$ 297</span>
                  <Button 
                    size="sm" 
                    className="bg-gradient-primary"
                    onClick={() => setShowNewsletterModal(true)}
                  >
                    Resgatar Agora
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Newsletter */}
      <Dialog open={showNewsletterModal} onOpenChange={setShowNewsletterModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              🎁 Resgatar Bônus Gratuito
            </DialogTitle>
            <DialogDescription className="text-center">
              Preencha seus dados para receber acesso ao Workshop Gravado "Destravando o Notion"
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <NewsletterForm 
              variant="default"
              onSuccess={() => {
                setShowNewsletterModal(false);
                setShowBonus(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}