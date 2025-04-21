import { asset } from '@/assets/assets'
import React from 'react'
import { CircleCheck } from 'lucide-react';
import { MoveLeft } from 'lucide-react';
import { MoveRight } from 'lucide-react';
import { ChevronDown } from 'lucide-react';

const MoreInfo = () => {

const now = new Date();
  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  const formatter = new Intl.DateTimeFormat(undefined, options);
  const parts = formatter.formatToParts(now);

  const weekday = parts.find((part) => part.type === 'weekday').value;
  const day = parts.find((part) => part.type === 'day').value;
  const month = parts.find((part) => part.type === 'month').value;
  const year = parts.find((part) => part.type === 'year').value;
  const hour = parts.find((part) => part.type === 'hour').value;
  const minute = parts.find((part) => part.type === 'minute').value;

  const formattedDateTime = `${weekday} ${day} ${month}, ${year} ${hour}:${minute}pm`;

  return (
    <>
    <div className='px-6 sm:px-10 py-10 w-[100%]'>
      <h1 className='text-center font-bold text-2xl py-10'>More features on Mentorship</h1>
        <div className='sm:flex items-center justify-between sm:gap-x-20'>
            <div className='sm:w-[55%] w-[100%] mb-10 border rounded-xl pb-4'>
                <div>
                    <img src={asset.Views} alt="" />
                </div>
                <div className='px-5 pt-5'>
                        <h1 className='font-semibold py-3'>Communication Tools</h1>
                        <p className='text-[10px]'>Direct messaging between mentors and mentees and Integrated video conferencing <br /> tools for virtual meetings.</p>
                </div>
            </div>
            <div className='border rounded-xl pb-4'>
               <div className=' bg-gray-50 pl-5 pt-5 rounded-tl-md'>
                    <div className='border-t border-l rounded-tl-xl bg-white py-6 px-5'>
                            <h1 className='font-semibold text-md sm:text-lg'>My Quick overview</h1>
                            <p className='py-4 text-sm'>View your monthly mentoring activities <br />and overall performance</p>
                            <p className='font-semibold flex'>
                               <CircleCheck className='bg-orange-500 text-white rounded-full mr-3'/> Well done
                            </p>
                    </div>
               </div>
                <div className='px-5'>
                    <h1 className='font-semibold py-3'>Progress Tracking</h1>
                    <p className='text-'>Track milestones, check-ins, and progress towards goals.</p>
                </div>
            </div>
        </div> 
    </div>

    <div className='px-6 sm:px-10 pb-10 w-[100%]'>
        <div className='sm:flex items-center justify-between sm:gap-x-20'>
            <div className='border mb-10 rounded-xl pb-4'>
               <div className=' bg-gray-50 pl-5  pt-5 rounded-tl-md'>
                    <div className='border-t border-l rounded-tl-xl bg-white py-6 px-5'>
                        <div className='flex text-sm items-center justify-between'>
                            <h1>#1TipsforSuccess</h1>
                            <p className='flex gap-5'>
                                <MoveLeft className='bg-orange-50 p-1 text-orange-500 rounded-full'/> 
                                <MoveRight className='bg-orange-50 p-1 rounded-full'/>
                            </p>
                        </div>
                            <h1 className='font-semibold text-sm py-2'>How to prepare for your first <br /> meeting?</h1>
                            <p className=' text-sm'>Plan an agenda! Plan out the questions and topics
                                you'd  <br />like to discuss. If you'd like to work together on 
                                long-term  <br /> goals, set some time to discuss 
                                expectations for each other.</p>
                    </div>
               </div>
                <div className='px-5'>
                    <h1 className='font-semibold py-3'>Get Tips</h1>
                    <p className='text-'>
                        Building a strong mentor-mentee relationship <br /> 
                        takes time and effort we offer some tips to help.
                    </p>
                </div>
            </div>

            <div className='sm:w-[55%] w-[100%] -mt-0 sm:-mt-9 border rounded-xl pb-4'>
                <div className='flex p-5 gap-5 text-[10px] justify-center items-center'>
                    <h1 className='border rounded-xl bg-orange-500 text-orange-100 px-4 py-1'>Upcoming</h1>
                    <h1 className='border rounded-xl bg-gray-200 px-4 py-1'>Pending</h1>
                    <h1 className='border rounded-xl bg-gray-200 px-4 py-1'>History</h1>
                </div>
                <div className='flex items-center justify-center text-[10px] sm:text-sm'>
                    <div className=' rounded-t-xl pt-5 sm:border sm:border-b-0 '>
                        <div className='flex items-center sm:gap-x-5 px-10'>
                            <h1 className='flex'>Mentorship session with <span className='font-bold'>Braide Shekinah</span></h1>
                            <ChevronDown/>
                        </div>
                        <div className='flex gap-x-5 py-5 text-left px-10'>
                            {formattedDateTime}
                        </div>
                        <div className='flex px-2 iems-center justify-between sm:justify-center sm:gap-x-5 text-[6px]'>
                            <h1 className='border rounded-xl bg-orange-500 text-orange-100 px-2 py-1'>Join Meeting</h1>
                            <h1 className='border rounded-xl bg-gray-200 px-4 py-1'>Send Message</h1>
                            <h1 className='border rounded-xl bg-gray-200 px-4 py-1'>Reschedule</h1>
                            <h1 className='border rounded-xl bg-orange-50 text-orange-500 px-4 py-1'>Cancel</h1>
                        </div>
                    </div>
                </div>
                <div className='px-5 pt-5'>
                        <h1 className='font-semibold py-3'>Manage your bookings</h1>
                        <p className='text-sm'>
                            Avoid scheduling conflicts and sends timely reminders to both parties about upcoming <br /> meetings, reducing no-shows and cancellations.
                        </p>
                </div>
            </div>

        </div> 
    </div>
    </>
  )
}

export default MoreInfo
