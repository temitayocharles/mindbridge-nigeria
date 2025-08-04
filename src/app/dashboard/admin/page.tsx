// import { NextRequest } from 'next/server'; // TODO: Enable when needed
import { redirect } from 'next/navigation';

export default function AdminDashboard() {
    // Redirect to login for now - this will be replaced with proper auth
    redirect('/login?reason=admin_required&status=403');
}
