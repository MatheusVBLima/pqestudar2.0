-- Create course suggestions table
CREATE TABLE public.course_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected'))
);

-- Enable Row Level Security
ALTER TABLE public.course_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies for course suggestions
CREATE POLICY "Anyone can create course suggestions" 
ON public.course_suggestions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own suggestions" 
ON public.course_suggestions 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_course_suggestions_updated_at
BEFORE UPDATE ON public.course_suggestions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_course_suggestions_created_at ON public.course_suggestions(created_at DESC);
CREATE INDEX idx_course_suggestions_status ON public.course_suggestions(status);