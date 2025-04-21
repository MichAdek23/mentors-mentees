import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBarDashboard from '../NavBarDashboard';
import NavRes from '../NavRes';
import MenteeProfile from './MenteeProfile';
import { useAuth } from '../../lib/AuthContext';
import Overview from '../MeentoDashboard/MenteePages/Overview';
import Booking from '../MeentoDashboard/MentorPages/Booking';
import Explore from '../MeentoDashboard/MentorPages/Explore';
import Message from '../MeentoDashboard/MentorPages/Message';

const MenteeDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState('Overview');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'Profile':
        return <MenteeProfile />;
      case 'Overview':
        return <Overview/>;
      case 'Setting':
        return <Setting/>;
      case 'Bookings':
        return <Booking/>;
      case 'Explore':
        return <Explore/>;
      case 'Messages':
        return  <Message/> ;
      case 'Progress':
        return <div>Progress Component</div>;
      default:
        return <MenteeProfile />;
    }
  };

  return (
    <div className="flex">
      <div className="hidden lg:block">
        <NavBarDashboard activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
      </div>
      <div className="lg:hidden">
        <NavRes activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
      </div>
      <div className="flex-1  h-screen ">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default MenteeDashboard;