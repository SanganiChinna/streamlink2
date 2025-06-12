
"use client"; // Required because we are using AuthContext and AdminAuthenticator

import AdminForm from '@/components/admin/AdminForm';
import AdminAuthenticator from '@/components/admin/AdminAuthenticator';
import VideoManagementSection from '@/components/admin/VideoManagementSection';
import { AuthProvider } from '@/contexts/AuthContext'; // Import the provider

export default function AdminPageContainer() {
  return (
    // Wrap the entire admin page logic with AuthProvider
    <AuthProvider>
      <AdminPageContent />
    </AuthProvider>
  );
}

function AdminPageContent() {
  return (
    <AdminAuthenticator>
      {/* This content is only visible after successful authentication */}
      <div className="py-8">
        <h1 className="font-headline text-4xl font-bold text-center mb-12 text-foreground">
          StreamLink Admin Panel
        </h1>
        <AdminForm />
        <VideoManagementSection />
      </div>
    </AdminAuthenticator>
  );
}
