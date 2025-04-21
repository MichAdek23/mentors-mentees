import { asset } from '@/assets/assets';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Overview = () => {
  const navigate = useNavigate();

  return (
    <div className='w-full sm:h-[45vh] lg:h-[100vh]'> 
      <div className="relative mb-12 bg-[url('/Section5.png')] bg-center bg-cover w-full h-[30vh] sm:h-[90%]">
        <div className='flex items-center justify-center h-1/3'>
          <div className='grid grid-cols-1 text-center pt-2 sm:pt-8 gap-y-0.5 sm:gap-y-3'>
            <h1 className='text-lg text-orange-50 font-bold sm:text-4xl'>Your Path to Success, Starts Here</h1>
            <h5 className='text-orange-50 font-semibold text-[12px] sm:text-md'>Connect with Industry Leaders, Accelerate Your Career.</h5>
            <button
              onClick={() => navigate('/sign-up')}
              className="mx-auto text-orange-500 text-[10px] sm:text-sm md:block border bg-orange-50 flex border-orange-50 px-4 py-2 sm:px-8 sm:py-3 rounded-xl shadow-lg hover:bg-orange-500 hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
        <div className='absolute bottom-0 flex mx-auto w-[80%] left-10 right-10 sm:left-20 sm:right-20'>
          <div className="relative w-full h-auto">
            <img src={asset.Overview} alt="" className="block w-full" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-orange-50 to-orange-500 opacity-70"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;