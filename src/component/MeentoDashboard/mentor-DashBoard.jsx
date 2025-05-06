import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBarDashboard from './NavBarDashboard';
import { GlobalContext } from '../GlobalStore/GlobalState';
import NavRes from './NavRes';
import { useAuth } from '../../lib/AuthContext';

function MentorDashBoard() {
    const context = useContext(GlobalContext);
    const navigate = useNavigate();
    const { user, loading } = useAuth();
 
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <div className='w-full h-screen text-white flex justify-center items-center font-bold text-3xl'>Loading...</div>;
    }

    if (!context) {
        return <div className='w-full h-screen text-white flex justify-center items-center font-bold text-3xl'>Loading...</div>;
    }
  
    const { ActiveComponent, toggleState } = context;

    return (
        <main className="flex h-full bg-white">
     
        <div className={`lg:hidden fixed inset-0 z-50  bg-white transform transition-transform duration-300 ${toggleState ? 'translate-x-0' : 'translate-x-full'}`}>
          <NavRes />
        </div>

        <aside className="hidden lg:block h-screen w-[18%] bg-white">
          <NavBarDashboard />
        </aside>
      

        <section className="flex-1 h-fit bg-slate-100 py-10 px-4 md:px-10 lg:px-[34px]">
          <ActiveComponent />
        </section>
      </main>
      
    );
}

export default MentorDashBoard;