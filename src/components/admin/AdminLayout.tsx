import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Home, Building, Calendar, Users, LogOut, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin/login');
      return;
    }

    // Check if user is an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      await supabase.auth.signOut();
      navigate('/admin/login');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-lg min-h-screen">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-8">
              <Home className="w-6 h-6 text-rose-600" />
              <span className="text-lg font-semibold dark:text-white">Admin Panel</span>
            </div>
            
            <nav className="space-y-2">
              <Link
                to="/admin/properties"
                className="flex items-center space-x-2 p-2 hover:bg-rose-50 dark:hover:bg-rose-900/50 rounded-lg text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
              >
                <Building className="w-5 h-5" />
                <span>Imóveis</span>
              </Link>
              
              <Link
                to="/admin/appointments"
                className="flex items-center space-x-2 p-2 hover:bg-rose-50 dark:hover:bg-rose-900/50 rounded-lg text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
              >
                <Calendar className="w-5 h-5" />
                <span>Agendamentos</span>
              </Link>
              
              <Link
                to="/admin/contacts"
                className="flex items-center space-x-2 p-2 hover:bg-rose-50 dark:hover:bg-rose-900/50 rounded-lg text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
              >
                <Users className="w-5 h-5" />
                <span>Contatos</span>
              </Link>
              
              <Link
                to="/admin/about-me"
                className="flex items-center space-x-2 p-2 hover:bg-rose-50 dark:hover:bg-rose-900/50 rounded-lg text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
              >
                <User className="w-5 h-5" />
                <span>Sobre Mim</span>
              </Link>
            </nav>
          </div>
          
          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 p-2 w-full hover:bg-rose-50 dark:hover:bg-rose-900/50 rounded-lg text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}