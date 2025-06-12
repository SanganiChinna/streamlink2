import AdminForm from '@/components/admin/AdminForm';

export default function AdminPage() {
  return (
    <div className="py-8">
      <h1 className="font-headline text-4xl font-bold text-center mb-12 text-foreground">
        StreamLink Admin Panel
      </h1>
      <AdminForm />
    </div>
  );
}
