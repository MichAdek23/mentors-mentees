import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import StepOne from './stepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import StepFour from './StepFour';
import { useAuth } from '../../../lib/AuthContext';

function MenteeForm() {
  const navigate = useNavigate();
  const { currentIndex } = useContext(GlobalContext);
  const { completeProfile } = useAuth();

  const handleFormSubmit = async (formData) => {
    try {
      await completeProfile({
        department: formData.department,
        yearOfStudy: formData.yearOfStudy,
        role: 'student'
      });
      navigate('/payment');
    } catch (error) {
      console.error('Error completing profile:', error);
      // Handle error (show error message to user)
    }
  };

  const DisplaySteps = () => {
    switch (currentIndex) {
      case 1:
        return <StepOne />;
      case 2:
        return <StepTwo />;
      case 3:
        return <StepThree />;
      case 4:
        return <StepFour onSubmit={handleFormSubmit} />;
      default:
        return <StepOne />;
    }
  };

  return (
    <section className="relative flex min-h-screen">
      <div className="hidden lg:block w-3/5 relative">
        <div className="absolute inset-0">
          <img 
            src="/image/young-people-working-from-modern-place 1.png" 
            loading="lazy" 
            className="h-full w-full object-cover" 
            alt="" 
          />
        </div>
        <div onClick={() => navigate('/')} className="absolute top-4 z-10">
          <img src="/image/LogoAyth.png" loading="lazy" className="w-40" alt="" />
        </div>
      </div>

      <div className="flex flex-col w-full lg:w-2/5">
        <div onClick={() => navigate('/')} className="block lg:hidden bg-black py-2 px-2">
          <img src="/image/LogoAyth.png" className="w-40" alt="" />
        </div>

        <div className='w-full flex-1 flex items-center justify-center py-8'>
          {DisplaySteps()}
        </div>
      </div>
    </section>
  );
}

export default MenteeForm;