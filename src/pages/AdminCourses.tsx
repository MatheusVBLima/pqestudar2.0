import { Navbar } from '@/components/layout/navbar';
import { CourseManagement } from '@/components/admin/CourseManagement';

export default function AdminCourses() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <CourseManagement />
      </div>
    </div>
  );
}