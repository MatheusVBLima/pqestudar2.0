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
  badge?: 'trending' | 'popular' | 'community' | null;
  upvotes: number;
  downvotes: number;
  vote_score: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  affiliate_link?: string;
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
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('courses')
        .insert([{
          title: courseData.title,
          description: courseData.description || '',
          category: courseData.category,
          duration: courseData.duration,
          price: courseData.price || 'Consultar',
          image_url: courseData.image_url,
          institution: courseData.institution || 'Plataforma Parceira',
          level: courseData.level || 'Iniciante',
          badge: courseData.badge,
          affiliate_link: courseData.affiliate_link,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setCourses(prev => [data as Course, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateCourse = async (courseData: UpdateCourseData | { id: string; is_active: boolean }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { id, ...updateFields } = courseData;
      const { data, error } = await supabase
        .from('courses')
        .update({
          ...updateFields,
          updated_by: user.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setCourses(prev => prev.map(course => 
        course.id === courseData.id ? data as Course : course
      ));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_active: false })
        .eq('id', courseId);

      if (error) throw error;
      
      setCourses(prev => prev.filter(course => course.id !== courseId));
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
    refetch: fetchCourses
  };
};