import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import { useNavigate } from 'react-router-dom';

function ResetConfirmation() {
    const navigate = useNavigate('/GetOtp')
      const { otpshow, setOtpShow} = useContext(GlobalContext); 


      const HandleNavigate = ()=>{
        setOtpShow(!otpshow)
        navigate('/get-otp') // Use lowercase path
      }


    return (
        <div className={ `${otpshow ? ' translate-y-8': 'translate-y-0'  } transition-transform duration-300 bg-white  w-[300px]  gap-2  p-3 flex justify-center items-center  shadow-lg shadow-slate-400 rounded-md` }>
            <div className=' w-10'>
                <img src="/image/otpIcon.png" className=' w-full h-full object-contain' alt="" />
            </div>
            <div>
                <p className='lg:text-lg font-medium'>Reset OTP sent</p>
            </div>
            <div>
              <button onClick={HandleNavigate} className=' w-10 h-10 rounded-full bg-slate-400  cursor-pointer'>
                <FontAwesomeIcon className=' text-lg text-white' icon={faTimes}/>
              </button>
            </div>
        </div>
    );
}

export default ResetConfirmation;