import { asset } from '@/assets/assets'
import React from 'react'
import {Twitter} from 'lucide-react'
import {Facebook} from 'lucide-react'
import {Instagram} from 'lucide-react'

const Footer = () => {
  return (
    <div className='px-5 py-10 sm:px-20'>
      <div className='sm:flex items-center justify-between space-y-5'>
        <div>
          <img src={asset.logo} alt="" />
        </div>
        <ul className='flex gap-5'>
          <Twitter size={17}/>
          <Facebook size={17}/>
          <Instagram size={17}/>
        </ul>
      </div>
      <hr className='my-7'/>
      <div className='sm:flex items-center justify-between space-y-5'>
        <h1>© Copyright 2024, All Rights Reserved</h1>
        <ul className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          <li>Privacy Policy</li>
          <li> Terms & Conditions</li>
        </ul>
      </div>
    </div>
    
  )
}

export default Footer
