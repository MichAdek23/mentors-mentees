import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1 from './stepOne';
import Step2 from './StepTwo';
import Step3 from './StepThree';
import Step4 from './StepFour';
import { useAuth } from '../../../lib/AuthContext';

function MentorForm() {
  const navigate = useNavigate();
  const { currentIndex } = useContext(GlobalContext);
  const { completeProfile } = useAuth();

  const handleFormSubmit = async (formData) => {
    try {
      await completeProfile({
        expertise: formData.expertise,
        experience: formData.experience,
        role: 'mentor'
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
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 onSubmit={handleFormSubmit} />;
      default:
        return <Step1 />;
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

export default MentorForm;