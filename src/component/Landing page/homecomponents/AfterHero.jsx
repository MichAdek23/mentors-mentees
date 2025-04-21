import React from 'react'
import { asset } from '../../../assets/assets'
import { CircleDotDashed } from 'lucide-react';

const AfterHero = () => {
  return (
    <div className=' '>
      <div className='relative pb-20 '>
        <img className='mt-20 h-15 w-full' src={asset.section} alt="" />
        <div className='absolute md:top-6 sm:top-2 top-1 w-full flex items-center justify-center text-[10px] sm:text[16px] md:text-[24px] md:px-3 px-2 sm:px-5 text-orange-50 font-bold'> 
          <CircleDotDashed className='w-4 mr-2 sm:mr-6 md:mr-2'/>
          <div className='mr-2'>
          Your Mentorship, Your Future 
          </div>
          <CircleDotDashed className='w-4 mr-2 sm:mr-4 sm:ml-6'/> 
          <div className='mr-2'>Connect, Grow, Achieve </div>
          <CircleDotDashed className='w-4 mr-2 sm:mr-4 sm:ml-6'/> 
          <div className='mr-2'> Your Vision, Our Mission</div>
          <CircleDotDashed className='w-4 sm:mr-4 sm:ml-6'/> 
          </div>
      </div>
    </div>
  )
};

export default AfterHero
