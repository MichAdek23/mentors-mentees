import React, { useState } from 'react'
import MatchingDate from './homecomponents/MatchingDate'
import { asset } from '@/assets/assets'




const MatchingSystem = () => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 px-6 sm:px-10 lg:px-20 py-15 gap-32 sm:gap-20 lg:gap-32'>
      <div className='bg-white w-full'>
        <h1 className='text-orange-500 font-bold text-xl'>MATCHING SYSTEM</h1>
        <div className='font-bold text-xl sm:text-lg lg:text-3xl text-left mt-8'>
        Matches mentees and mentors based on their interests, goals, expertise, and availability.
        </div>
        <div className='bg-gray-200 mt-8 py-2 px-5 text-sm rounded-md'>
        Mentees and mentors can express interest in each other. <br />
        A match is confirmed only when both parties agree.
        </div>
      </div>
               

      <div className='bg-gray-200 w-full border border-r-0 border-b-0 rounded-tl-xl pl-5 pt-5'>
          <div className=' flex bg-gray-50 border sm:px-5 px-2 pt-5 rounded-tl-xl border-gray-400 border-r-0 border-b-0 mb-5'>
            <div className='bg-gray-50  pt-3 sm:border w-1/2 sm:border-t-0 sm:border-t-0 sm:border-l-0'>
                <div className=" pr-10 sm:pr-5 hidden lg:block">
                  <div className='flex items-center'>
                      <img src={asset.volunteer} alt="" className='rounded-full w-[40px] mr-2'/>
                      <div>
                        <p className='text-[9px] sm:text-[9px] font-bold text-gray-600'>Braide Shekinah</p>
                        <p className='text-[6px] sm:text-[7px] text-gray-600'> Nifest President /B..</p>
                      </div>
                  </div>
                  <hr className='mt-4'/>
                  <p className='sm:text-sm text-[10px] font-bold py-5'>Mentorship Session </p>

                 <div className='sm:text-sm text-[10px] font-bold py-5 sm:py-3'>
                 <p className='text-gray-500 text-[10px] sm:text-[13px]'>Session Duration</p>
                 <p className='text-gray-600 text-sm text-[11px]'> 30 Minutes</p> 
                 </div>

                 <div className='text-sm font-bold py-5'>
                  <p className='text-gray-500 sm:text-[13px] text-[10px]'> About</p> 
                  <p className='text-gray-600 text-[13px] sm:text-sm font-bold'>Mentorship Session</p> 
                 </div>
            
                </div>
            </div>
            <div className="pr-5 pl-2 sm:px-4 w-full">
              <p className='text-[8px] font-bold text-gray-500'>Step 1 of 3</p>
              <p className='text-md text-bold mb-2'>Select Date and Time</p>
              <p className='text-[10px] mb-5 font-bold text-gray-500'>In your local time zone (Europe/London) {" "}
                <span className='text-orange-500'>Update</span>
              </p>
                 <MatchingDate className=""/>
            </div>
           </div>
        </div>
    </div>
  )
}



export default MatchingSystem
