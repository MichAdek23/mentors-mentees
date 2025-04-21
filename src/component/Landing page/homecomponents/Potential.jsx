import React from 'react'
import { Link, useNavigate } from 'react-router-dom' // Ensure useNavigate is imported

const Potential = () => {
  const navigate = useNavigate()
  return (
    <div className='py-20 '>
      <div className="relative bg-[url('/Section5.png')] bg-center bg-cover sm:h-80  h-80 w-100 rounded-xl mx-6 sm:mx-10">
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-orange-50 '>
          <h2 className='text-[12px] sm:text-2xl lg:text-4xl font-bold'>Unlock Your Potential with <br /> Expert Guidance</h2>
          
          <button className=' mt-7'>
            <Link 
              to='/sign-up' 
              className='mx-auto text-orange-500 text-[14px] sm:text-base md:block border bg-orange-50 flex border-orange-50 px-4 py-3 sm:px-10 sm:py-4 rounded-full shadow-lg hover:bg-orange-500 hover:text-white transition-all duration-300 ease-in-out transform hover:scale-110'
            >
              Get Started
            </Link> 
          </button>
        </div>
      </div>
    </div>
  )
}

export default Potential
