
import React from 'react'
import { Clock3 } from 'lucide-react';
import { Zap } from 'lucide-react';

const Mentor = () => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 px-6 sm:px-10 py-40 gap-32 sm:gap-20 lg:gap-32'>

        <div className='bg-gray-200 w-full border border-l-0 border-b-0  rounded-r-md pr-5 pt-5'>
           <div className='bg-gray-50 border px-5 pt-5 rounded-tr-xl  border-l-0 border-b-0'>
            <div className='bg-gray-50 border pt-3 px-5 rounded-xl mb-5'>
                <h1 className='text-orange-500 font-bold text-xl'>Mentor Statistics</h1>
                <div className='flex items-center justify-between gap-x-5 py-5'>
                    <div className='flex items-center gap-x-2'>
                      <div className='border border-gray-400 rounded-full p-2 w-8 h-8'>
                      <Clock3 className='text-red-500 w-4 h-4'/>
                      </div>
                      <div className='text-[10px] text-gray-400'>
                      <p>4207 mins</p>
                      <p>Total mentoring time</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-x-2'>
                      <div className='border border-gray-400 rounded-full p-2 w-8 h-8'>
                      <Zap className='text-red-500 w-4 h-4'/>
                      </div>
                      <div className='text-[10px] text-gray-400'>
                      <p>21</p>
                      <p>Sessions completed</p>
                      </div>
                    </div>
                </div>
                <hr />
                <div className='py-5'>
                  <h1 className='font-bold text-xl sm:text-lg'>Top areas of impact</h1>
                  <div className='pt-5 flex flex-wrap gap-y-2'>
                    <div className='border rounded-full text-[12px] mr-2 px-2 py-1'>Career guidance</div>
                    <div className='border rounded-full text-[12px] mr-2 px-5 py-1'>Academics </div>
                    <div className='border rounded-full text-[12px] mr-2 px-5 py-1'>Christ-like discipleship</div>
                    <div className='border rounded-full text-[12px] mr-2 px-5 py-1'>Personal development and leadership</div>
                  </div>
                </div>
            </div>
            <div className='border border-gray-200 h-5 rounded-t-md border-b-0'>

            </div>
           </div>
        </div>

      <div className='bg-white w-full'>
        <h1 className='text-orange-500 font-bold text-xl'>MENTOR PROFILE</h1>
        <div className='font-bold text-xl sm:text-lg lg:text-3xl text-left mt-8'>
        Detailed information about the <br/> mentor's expertise, experience, <br />and areas of mentorship.
        </div>
        <div className='bg-gray-200 mt-8 py-2 px-5 text-sm rounded-md'>
        highlighting the transformative journeys of former mentees and the remarkable achievements they've unlocked under the guidance of our expert mentors.        
        </div>
      </div>
    </div>
  )
}


export default Mentor
