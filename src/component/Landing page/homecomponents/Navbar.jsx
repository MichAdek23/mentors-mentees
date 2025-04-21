import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { asset } from '../../../assets/assets'
import { AlignRight } from 'lucide-react';
import { X } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate()

    const [showMobileMenu, setShowMobileMenu] = useState(false);

//   prevent the web scrolling when the navbar is opened
    useEffect(()=> {
        if (showMobileMenu) {
            document.body.style.overflow = 'hidden'
        } else {
             document.body.style.overflow = 'auto'
        }
        return () => {
             document.body.style.overflow = 'auto'
        }
    }, [showMobileMenu]);

    return (
        <div className="">
          <div className=" flex justify-between items-center py-4 px-8 bg-transparent">
            <ul className=" md:flex items-center justify-between font-bold gap-7 text-orange-600">
              <img src={asset.logo} alt="" className='pr-10'/>
            </ul>

              <div className='flex items-center justify-between gap-x-5'>
              <button onClick={()=>  navigate('./sign-up')} className="hidden text-orange-500 md:block border  border-orange-500  px-8 py-2 rounded-full">Get Started</button>
              <button onClick={()=>  navigate('./Login')}  className="hidden text-orange-50 md:block bg-orange-500 px-8 py-2 rounded-full">Login</button>
              </div>
              <AlignRight onClick={()=> setShowMobileMenu(true)} className='md:hidden w-12 h-10 text-orange-600 cursor-pointer' />
          </div>

          {/* --mobile menu-- */}

            <div className={`md:hidden ${showMobileMenu ? 'fixed w-[50vw] z-10' : 'h-0 w-0'} 
                            right-0 top-0 bottom-0 overflow-hidden bg-orange-50 transition-all`}>
                <div className='flex justify-end p-6 cursor-pointer'>  
                <X onClick={()=> setShowMobileMenu(false)} className=' w-12 h-10 text-orange-600 cursor-pointer' alt="" />
                </div>
                
          <ul className='md:flex items-center justify-between gap-x-5 px-5 md:px-0'>
            <button onClick={()=> navigate("/sign-up" )}  className='block border border-orange-600 px-3 py-1 rounded-xl text-orange-600 mb-5'>Get started</button>
            <button  onClick={()=> navigate("/Login")}  className='block border border-orange-600 px-7 py-1 rounded-xl bg-orange-600 text-orange-100'>Sign in</button>
          </ul>
           </div>
           <hr className='border border-gray-100 w-full'/>
        </div>
   )
}

export default Navbar
