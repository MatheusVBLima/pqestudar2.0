import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  badge?: "trending" | "popular" | "community" | null;
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
  badge?: "trending" | "popular" | "community" | null;
  affiliate_link?: string;
}

export interface UpdateCourseData extends CreateCourseData {
  id: string;
  is_active?: boolean;
}

const ADMIN_COURSES_KEY = ["admin_courses"] as const;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Erro inesperado";

async function fetchCourses() {
  const { data, error } = await supabase
    .from("active_courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as Course[]) || []) as Course[];
}

async function requireSessionToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Usuário não autenticado");
  return session.access_token;
}

export const useCourses = () => {
  const queryClient = useQueryClient();
  const coursesQuery = useQuery({
    queryKey: ADMIN_COURSES_KEY,
    queryFn: fetchCourses,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const invalidateCourses = () => queryClient.invalidateQueries({ queryKey: ADMIN_COURSES_KEY });

  const createMutation = useMutation({
    mutationFn: async (courseData: CreateCourseData) => {
      await requireSessionToken();

      const { data, error } = await supabase.functions.invoke("admin-courses", {
        body: {
          action: "create",
          data: {
            title: courseData.title,
            description: courseData.description || "",
            category: courseData.category,
            duration: courseData.duration,
            price: courseData.price || "Consultar",
            image_url: courseData.image_url,
            institution: courseData.institution || "Plataforma Parceira",
            level: courseData.level || "Iniciante",
            badge: courseData.badge,
            affiliate_link: courseData.affiliate_link,
          },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: invalidateCourses,
  });

  const updateMutation = useMutation({
    mutationFn: async (courseData: UpdateCourseData | { id: string; is_active: boolean }) => {
      await requireSessionToken();
      const { id, ...updateFields } = courseData;

      const { data, error } = await supabase.functions.invoke("admin-courses", {
        body: {
          action: "update",
          data: { id, ...updateFields },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: invalidateCourses,
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await requireSessionToken();

      const { error } = await supabase.functions.invoke("admin-courses", {
        body: {
          action: "delete",
          data: { id: courseId },
        },
      });

      if (error) throw error;
    },
    onSuccess: invalidateCourses,
  });

  const hideMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await requireSessionToken();

      const { error } = await supabase.functions.invoke("admin-courses", {
        body: {
          action: "hide",
          data: { id: courseId },
        },
      });

      if (error) throw error;
    },
    onSuccess: invalidateCourses,
  });

  const createCourse = async (courseData: CreateCourseData) => {
    try {
      const data = await createMutation.mutateAsync(courseData);
      return { data, error: null };
    } catch (error: unknown) {
      return { data: null, error: getErrorMessage(error) };
    }
  };

  const updateCourse = async (courseData: UpdateCourseData | { id: string; is_active: boolean }) => {
    try {
      const data = await updateMutation.mutateAsync(courseData);
      return { data, error: null };
    } catch (error: unknown) {
      return { data: null, error: getErrorMessage(error) };
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      await deleteMutation.mutateAsync(courseId);
      return { error: null };
    } catch (error: unknown) {
      return { error: getErrorMessage(error) };
    }
  };

  const hideCourse = async (courseId: string) => {
    try {
      await hideMutation.mutateAsync(courseId);
      return { error: null };
    } catch (error: unknown) {
      return { error: getErrorMessage(error) };
    }
  };

  return {
    courses: coursesQuery.data ?? [],
    loading: coursesQuery.isLoading,
    error: coursesQuery.error ? getErrorMessage(coursesQuery.error) : null,
    createCourse,
    updateCourse,
    deleteCourse,
    hideCourse,
    refetch: coursesQuery.refetch,
  };
};
