import React, { useContext } from 'react';
import NavBarDashboard from '../MeentoDashboard/NavBarDashboard';
import { GlobalContext } from '../GlobalStore/GlobalState';
import NavRes from '../MeentoDashboard/NavRes';
import MenteeOverview from '../MeentoDashboard/MenteePages/Overview';

function Mentee() {
    const context = useContext(GlobalContext);
 
    if (!context) {
      return <div className='w-full h-screen text-white flex justify-center items-center font-bold text-3xl'>Loading...</div>;
    }
  
    const { ActiveComponent, toggleState } = context;

    // If no ActiveComponent is set, default to MenteeOverview
    const ComponentToRender = ActiveComponent || MenteeOverview;

    return (
         <main className='flex sidebar h-full'>
            <div className={`${toggleState ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 fixed h-screen z-50 top-0 bg-white w-full`}>
                <NavRes/>
            </div>
            <section className='hidden lg:block h-screen w-[18%]'>
                <NavBarDashboard/>
            </section>
            <section className='h-fit sidebar md:px-10 lg:px-[34px] bg-slate-100 py-10 w-full'>
                <ComponentToRender/>
            </section> 
         </main>
    );
}

export default Mentee;