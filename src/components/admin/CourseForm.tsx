import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Course } from '@/hooks/useCourses';

const courseSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  affiliate_link: z.string().url('Deve ser uma URL válida').min(1, 'Link de afiliado é obrigatório'),
  image_url: z.string().url('Deve ser uma URL válida de imagem').min(1, 'URL da imagem é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  duration: z.string().min(1, 'Duração estimada é obrigatória'),
  ideal_for: z.string().min(1, 'Campo "Ideal para" é obrigatório'),
  has_certificate: z.string().min(1, 'Selecione se oferece certificado'),
  badges: z.array(z.string()).optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  course?: Course | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export const CourseForm = ({ course, onOpenChange, onSubmit }: CourseFormProps) => {
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      affiliate_link: '',
      image_url: '',
      category: '',
      duration: '',
      ideal_for: '',
      has_certificate: '',
      badges: [],
    },
  });

  useEffect(() => {
    if (course) {
      // Extrair link de afiliado do campo description se existir
      const affiliateLink = course.description?.includes('Link de afiliado:') 
        ? course.description.replace('Link de afiliado: ', '').trim()
        : '';
      
      form.reset({
        title: course.title,
        affiliate_link: affiliateLink,
        image_url: course.image_url || '',
        category: course.category,
        duration: course.duration,
        ideal_for: course.level || '',
        has_certificate: 'Não',
        badges: course.badge ? [course.badge] : [],
      });
    } else {
      form.reset({
        title: '',
        affiliate_link: '',
        image_url: '',
        category: '',
        duration: '',
        ideal_for: '',
        has_certificate: '',
        badges: [],
      });
    }
  }, [course]);

  const handleSubmit = (data: CourseFormData) => {
    try {
      // Mapear dados do formulário para campos existentes na tabela
      const transformedData = {
        title: data.title,
        description: `Link de afiliado: ${data.affiliate_link}`, // Armazena link no campo description
        affiliate_link: data.affiliate_link, // Adicionar campo affiliate_link separado
        image_url: data.image_url,
        category: data.category,
        duration: data.duration,
        badge: (data.badges && data.badges.length > 0 ? data.badges[0] : null) as 'trending' | 'popular' | 'community' | null,
        // Valores padrão para campos obrigatórios
        price: 'Consultar',
        institution: 'Plataforma Parceira',
        level: data.ideal_for,
      };
      onSubmit(transformedData);
      form.reset();
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {course ? 'Editar Curso' : 'Adicionar Novo Curso'}
        </DialogTitle>
        <DialogDescription>
          Preencha as informações do novo curso.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do Curso</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Curso Completo de Análise de Dados com Python" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="affiliate_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link de Afiliado (URL)</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://plataforma.com/curso/...?aff=pqestudar" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL da Imagem da Capa</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://servidor.com/imagem-do-curso.jpg" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="tech">Tecnologia</SelectItem>
                    <SelectItem value="business">Negócios</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração Estimada</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 40 horas" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ideal_for"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ideal para</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Iniciantes em Programação ou Educadores e Gestores" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="has_certificate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Oferece certificado?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="badges"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Selos (Opcional)</FormLabel>
                </div>
                {['trending', 'popular', 'community'].map((badge) => (
                  <FormField
                    key={badge}
                    control={form.control}
                    name="badges"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={badge}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(badge)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), badge])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== badge
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {badge === 'trending' && '🔥 Em Alta'}
                            {badge === 'popular' && '⭐ Mais Acessado'}
                            {badge === 'community' && '✨ Novidade'}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Curso
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};