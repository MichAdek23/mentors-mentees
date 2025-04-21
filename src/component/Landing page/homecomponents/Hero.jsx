import React from 'react'
import { asset } from '../../../assets/assets'
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate()
  return (
    <div className='flex items-center justify-center md:justify-between  py-8'>
      <div className='relative hidden md:block'>
          <ul className='grid grid-cols-2 gap-2'>
           <img className='rounded-xl' src={asset.blackman1} alt="" />
           <img className='rounded-xl' src={asset.people} alt="" />
           <img className='rounded-xl' src={asset.closeup} alt="" />
           <img className='rounded-xl' src={asset.frame17} alt="" />
          </ul>
          <div className="absolute inset-y-0  right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/100 to-white/100 opacity-70"></div>

      </div>
      <div className='text-center px-4'>
         <h1 className='  text-5xl lg:text-6xl font-bold text-center'>  1-on-1 <br/>
            Strategic <br/>
            Mentorship</h1>
        <p className='mb-5 mt-4 p-3 text-md'>Experience life-changing mentorship, your path to <br/> extraordinary growth starts here.</p>
        <div className=' flex justify-center items-center'>
        <button onClick={()=> navigate('/sign-up')} className='border font-bold bg-customOrange text-neutral-50 rounded-xl w-[150px]  py-3 px-1 text-md flex items-center justify-center'> Get Started Now </button>
        </div>
       
      </div>
      <div className=' relative hidden md:block'>
          <ul className='grid grid-cols-2 gap-2'>
           <img className='rounded-xl' src={asset.young} alt="" />
           <img className='rounded-xl' src={asset.confident} alt="" />
           <img className='rounded-xl' src={asset.portrait} alt="" />
           <img className='rounded-xl' src={asset.couple } alt="" />
          </ul>
          <div className="absolute inset-y-0 left-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/100 to-white/100 opacity-70"></div>

      </div>
    </div>
  )
}

export default Hero
