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
         <main className='flex sidebar h-full'>
            <div className={`${toggleState ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 fixed h-screen z-50 top-0 bg-white w-full`}>
                <NavRes/>
            </div>
            <section className='hidden lg:block h-screen w-[18%]'>
                <NavBarDashboard/>
            </section>
            <section className='h-screen sidebar md:px-10 lg:px-[34px] bg-slate-100 py-10 w-full'>
                <ActiveComponent/> 
            </section> 
         </main>
    );
}

export default MentorDashBoard;