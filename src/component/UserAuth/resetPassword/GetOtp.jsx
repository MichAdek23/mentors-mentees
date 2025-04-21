import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../../lib/api"; // Import userApi

function GetOtp() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const OtpData = watch();

  useEffect(() => {
    localStorage.setItem("OtpData", JSON.stringify(OtpData));
  }, [OtpData]);

  useEffect(() => {
    const savedFormData = localStorage.getItem("loginFormData");
    if (savedFormData) {
      const parsedFormData = JSON.parse(savedFormData);
      setValue("otp1", parsedFormData.otp1);
      setValue("otp2", parsedFormData.otp2);
      setValue("otp3", parsedFormData.otp3);
      setValue("otp4", parsedFormData.otp4);
      setValue("otp5", parsedFormData.otp5);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    try {
      const otp = Object.values(data).join(''); // Combine OTP fields into a single string
      const email = localStorage.getItem('email'); // Retrieve email from localStorage
      if (!email) {
        console.error('Email not found in localStorage'); // Debug log
        throw new Error('Email is required to verify OTP');
      }
      console.log('Sending OTP verification:', { email, otp }); // Debug log
      const response = await userApi.verifyOtp({ email, otp }); // Use userApi method

      // Store reset token in localStorage
      if (response.data.token) {
        localStorage.setItem('resetToken', response.data.token);
      }

      navigate(response.data.redirect); // Redirect to change password page
    } catch (err) {
      console.error('OTP Verification Error:', err.response?.data || err.message); // Debug log
      alert(err.response?.data?.message || 'Failed to verify OTP. Please try again.');
    }
  };

  const handleInputChange = (e, fieldName, nextFieldName) => {
    const value = e.target.value.replace(/\D/g, ""); // Allow only numeric values
    if (value.length > 1) {
      e.target.value = value.slice(0, 1); // Limit input to 1 character
    }
    setValue(fieldName, value);

    // Move focus to the next input field if a value is entered
    if (value && nextFieldName) {
      const nextInput = document.querySelector(`input[name="${nextFieldName}"]`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  return (
    <section className="relative flex h-full">
      <div className="hidden lg:block h-full w-3/5">
        <img
          src="image/young-people-working-from-modern-place 1.png"
          className="h-full w-full object-cover"
          alt=""
        />
        <div onClick={() => navigate("/")} className="absolute top-4">
          <img src="/image/LogoAyth.png" className="w-40" alt="" />
        </div>
      </div>

      <div className="flex items-center w-full lg:w-2/5 justify-center">
        <div className="w-full px-6 lg:px-0 md:w-[400px]">
          <h1 className="text-2xl font-bold lg:text-[40px] text-customDarkBlue">Verify OTP</h1>
          <p className="text-slate-400 text-sm mt-2">Welcome back! Please enter your details</p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center gap-3 mt-4">
              {[1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  {...register(`otp${index}`, {
                    required: "This field is required",
                    maxLength: { value: 1 },
                    pattern: {
                      value: /^[0-9]+$/, // Ensure only numeric values are allowed
                      message: "Only numbers are allowed",
                    },
                  })}
                  type="text"
                  inputMode="numeric"
                  className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:border-customOrange"
                  onChange={(e) =>
                    handleInputChange(e, `otp${index}`, index < 5 ? `otp${index + 1}` : null)
                  }
                  maxLength={1}
                />
              ))}
            </div>
            {Object.keys(errors).map((key) => (
              <p key={key} className="text-red-500 text-sm mt-1">
                {errors[key].message}
              </p>
            ))}

            <div className="mt-4">
              <button
                type="submit"
                className="text-white bg-customOrange w-full h-14 rounded-lg cursor-pointer"
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default GetOtp;