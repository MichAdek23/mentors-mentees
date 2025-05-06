import React, { useContext } from 'react'
import { GlobalContext } from '../GlobalStore/GlobalState';
import { FontAwesomeIcon  } from '@fortawesome/react-fontawesome';
import { faRemove, faDeleteLeft } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from "../../lib/AuthContext";
import { useNavigate } from 'react-router-dom';
function NavRes() {

  const { upDatePage, activeComponent, handleToggleState } = useContext(GlobalContext)

  const {  logout } = useAuth();
  const navigate = useNavigate();
    
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <section className=' z-50 h-full w-1/2 pb-3  flex flex-col justify-center items-center pt-10 '>
      <div className=' w-full flex justify-between px-3 items-center '>
      <div className="w-full flex justify-center items-center">
      <h1 className=' text-xl md:text-2xl font-bold text-orange-400  '>Leap Mentorship</h1>
      </div>
        <div className=' cursor-pointer' onClick={handleToggleState}>
            <FontAwesomeIcon className=' text-2xl' icon={faRemove}/>
        </div>
      </div>
      <div className=' mt-14 flex items-center text-center flex-col px-5 gap-10 '>
        <div onClick={() => upDatePage('OverView') } className={`${activeComponent === 'OverView' ? 'text-customOrange' : 'text-gray-500'} flex gap-4 font-medium cursor-pointer items-center`}>
          <span><img src="/image/overViewIcon.png" className='h-7' alt="" /></span>
          Overview
        </div>
        <div onClick={() => upDatePage('Explore')} className={`${activeComponent === 'Explore' ? 'text-customOrange' : 'text-gray-500'} flex gap-4 font-medium cursor-pointer items-center`}>
          <span><img src="/image/exploreIcon.png" className='h-7' alt="" /></span>
          Explore
        </div>
        <div onClick={() => upDatePage('Message')} className={`${activeComponent === 'Message' ? 'text-customOrange' : 'text-gray-500'} flex gap-4 font-medium cursor-pointer items-center`}>
          <span><img src="/image/messagenavIcon.png" className='h-7' alt="" /></span>
          Message
        </div>
        <div onClick={() => upDatePage('Booking')} className={`${activeComponent === 'Booking' ? 'text-customOrange' : 'text-gray-500'} flex gap-4 cursor-pointer font-medium items-center`}>
          <span><img src="/image/BookingIcon.png" className='h-7' alt="" /></span>
          Bookings
        </div>
      </div>

      <div className=' mt-20 flex justify-center items-center flex-col px-5 gap-4'>
        <h1 className=' text-customDarkBlue text-center text-lg font-medium'>Manage Account</h1>
        <div className=' mt-8   flex flex-col gap-6'>
          <div onClick={() => upDatePage('Profile')}  className={`${activeComponent === 'Profile' ? 'text-customOrange' : 'text-gray-500'}  flex  gap-4  cursor-pointer font-medium items-center`}>
            <span><img src="/image/ProfileIcon.png" className=' h-7' alt="" /></span>
            My Profile
          </div>

          <div onClick={() => upDatePage('Setting')} className={`${activeComponent === 'Setting' ? 'text-customOrange' : 'text-gray-500'}  flex  gap-4  cursor-pointer font-medium items-center`}>
            <span><img src="/image/navBarSettingIcon.png" className=' h-7' alt="" /></span> Settings
          </div>

            <div
                      onClick={handleLogout}
                      className="flex gap-4 font-medium cursor-pointer items-center text-gray-400 hover:text-red-500"
                    >
                      <span>
                        <FontAwesomeIcon icon={faDeleteLeft} />
                      </span>
                      Log Out
                    </div>
        </div>
      </div>
    </section>
  );
}

export default NavRes;