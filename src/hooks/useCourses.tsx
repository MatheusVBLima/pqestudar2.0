import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  students: number;
  rating: number;
  price: string;
  image_url?: string;
  institution: string;
  level: string;
  is_active: boolean;
  is_hidden: boolean;
  badge?: 'trending' | 'popular' | 'community' | null;
  upvotes: number;
  downvotes: number;
  vote_score: number;
  views: number;
  created_at: string;
  updated_at: string;
  affiliate_link?: string;
  // Calculated fields from view
  likes: number;
  dislikes: number;
}

export interface CreateCourseData {
  title: string;
  description?: string;
  category: string;
  duration: string;
  price?: string;
  image_url?: string;
  institution?: string;
  level?: string;
  badge?: 'trending' | 'popular' | 'community' | null;
  affiliate_link?: string;
}

export interface UpdateCourseData extends CreateCourseData {
  id: string;
  is_active?: boolean;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Use secure public view that doesn't expose created_by/updated_by
      const { data, error } = await supabase
        .from('active_courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data as Course[] || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData: CreateCourseData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.functions.invoke('admin-courses', {
        body: {
          action: 'create',
          data: {
            title: courseData.title,
            description: courseData.description || '',
            category: courseData.category,
            duration: courseData.duration,
            price: courseData.price || 'Consultar',
            image_url: courseData.image_url,
            institution: courseData.institution || 'Plataforma Parceira',
            level: courseData.level || 'Iniciante',
            badge: courseData.badge,
            affiliate_link: courseData.affiliate_link
          }
        }
      });

      if (error) throw error;
      
      // Refetch to get updated data from public view
      await fetchCourses();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateCourse = async (courseData: UpdateCourseData | { id: string; is_active: boolean }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { id, ...updateFields } = courseData;
      const { data, error } = await supabase.functions.invoke('admin-courses', {
        body: {
          action: 'update',
          data: { id, ...updateFields }
        }
      });

      if (error) throw error;
      
      // Refetch to get updated data from public view
      await fetchCourses();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { error } = await supabase.functions.invoke('admin-courses', {
        body: {
          action: 'delete',
          data: { id: courseId }
        }
      });

      if (error) throw error;
      
      // Refetch to get updated data from public view
      await fetchCourses();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const hideCourse = async (courseId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { error } = await supabase.functions.invoke('admin-courses', {
        body: {
          action: 'hide',
          data: { id: courseId }
        }
      });

      if (error) throw error;
      
      // Refetch to get updated data from public view
      await fetchCourses();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    hideCourse,
    refetch: fetchCourses
  };
};