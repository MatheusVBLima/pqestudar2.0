import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star, Heart, ThumbsUp, ThumbsDown } from "lucide-react";
import { TrendingBadge } from "./trending-badge";
import { useVoting } from "@/hooks/useVoting";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  students: number;
  rating: number;
  price: string;
  image: string;
  institution: string;
  level: string;
  badge?: 'trending' | 'popular' | 'community' | null;
}

interface CourseCardProps {
  course: Course;
  isFavorite: boolean;
  onToggleFavorite: (courseId: string) => void;
}

export function CourseCard({ course, isFavorite, onToggleFavorite }: CourseCardProps) {
  const navigate = useNavigate();
  const { userVote, upvotes, downvotes, vote, loading } = useVoting(course.id);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover-scale">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <TrendingBadge badge={course.badge} />
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(course.id);
            }}
            className="h-8 w-8 p-0 bg-background/90 hover:bg-background"
          >
            <Heart 
              className={`h-4 w-4 ${
                isFavorite 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-muted-foreground'
              }`} 
            />
          </Button>
          <Badge className="bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
            {course.level}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
          {course.title}
        </CardTitle>
        <CardDescription className="text-sm">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {course.duration}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {course.students}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {course.rating}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              vote('up');
            }}
            disabled={loading}
            className={`flex items-center gap-1 h-8 px-2 ${
              userVote === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''
            }`}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{upvotes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              vote('down');
            }}
            disabled={loading}
            className={`flex items-center gap-1 h-8 px-2 ${
              userVote === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : ''
            }`}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{downvotes}</span>
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            {course.price === "0" || course.price === "R$ 0" || course.price === "R$ 0,00" ? (
              <Badge className="bg-green-600 text-white hover:bg-green-700 text-lg px-3 py-1">
                GRATUITO
              </Badge>
            ) : (
              <p className="text-2xl font-bold text-primary">{course.price}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">por {course.institution}</p>
          </div>
          <Button 
            className="hover-scale"
            onClick={() => navigate(`/curso/${course.id}`)}
          >
            Inscrever-se
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}