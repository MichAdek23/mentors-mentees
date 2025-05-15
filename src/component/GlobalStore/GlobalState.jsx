import React, { createContext, useMemo, useState } from "react";
import Overview from "../MeentoDashboard/MentorPages/Overview";
import Explore from "../MeentoDashboard/MentorPages/Explore";
import Booking from "../MeentoDashboard/MentorPages/Booking";
import MyProfile from "../MeentoDashboard/MentorPages/MyProfile";
import Setting from "../MeentoDashboard/MentorPages/Setting";
import ProfileId from "../MeentoDashboard/MentorPages/profileId";
import UserList from '../MeentoDashboard/MentorPages/UserList';
import Settings from '../MeentoDashboard/MentorPages/Setting';
import UsersList from '../MeentoDashboard/MentorPages/UsersList';
import MenteeOverview from '../MeentoDashboard/MenteePages/Overview';
import Message from "../Mentee-onboarding/messageComponent";

export const GlobalContext = createContext();

const components = {
  Overview,
  Explore,
  Booking,
  Profile: MyProfile,
  Setting,
  ProfileId,
  UserList,
  Settings,
  UsersList,
  MenteeOverview,
  Message
};

const defaultProfile = {
  firstName: '',
  lastName: '',
  role: '',
  email: '',
  mentorshipStatus: '',
  gender: '',
  modeOfContact: '',
  availability: '',
  bio: '',
  overview: '',
  profilePicture: '',
  social: {
    twitter: '',
    facebook: '',
    whatsapp: '',
    instagram: ''
  }
};

function GlobalState({ children }) {
  const [activeComponent, setActiveComponent] = useState(() => {
    const storedComponent = localStorage.getItem('components');
    if (storedComponent && storedComponent !== "undefined") {
      try {
        return JSON.parse(storedComponent);
      } catch (error) {
        console.error("Error parsing stored component:", error);
        return "Overview"; 
      }
    }
    return "Overview"; 
  });

  const [profile, setProfile] = useState(() => {
    const storedProfile = localStorage.getItem('profile');
    if (storedProfile) {
      try {
        return JSON.parse(storedProfile);
      } catch (error) {
        console.error("Error parsing stored profile:", error);
        return defaultProfile;
      }
    }
    return defaultProfile;
  });

  const [formData, setFormData] = useState(() => {
    const storedFormData = localStorage.getItem('formData');
    if (storedFormData) {
      try {
        return JSON.parse(storedFormData);
      } catch (error) {
        console.error("Error parsing stored form data:", error);
        return {};
      }
    }
    return {};
  });

  React.useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  const [otpshow , setOtpShow] = useState(false)

  const ShowResetConfirmation = ()=>{
       setOtpShow(!otpshow)
  }

  const [toggleState, setToggleState] = useState(false);

  const [selectedMentee, setSelectedMentee] = useState(() => {
    const storedMentee = localStorage.getItem('mentee');
    if (storedMentee) {
      try {
        return JSON.parse(storedMentee);
      } catch (error) {
        console.error("Error parsing stored mentee:", error);
        return null;
      }
    }
    return null;
  });

  const [acceptedMentors, setAcceptedMentors] = useState(() => {
    const AcceptedMentor = localStorage.getItem('AddMentor');
    try {
      return AcceptedMentor ? JSON.parse(AcceptedMentor) : [];
    } catch (error) {
      console.error("Error parsing accepted mentors:", error);
      return [];
    }
  });

  const [acceptedMentees, setAcceptedMentees] = useState(() => {
    const AcceptedMentee = localStorage.getItem('Add');
    try {
      return AcceptedMentee ? JSON.parse(AcceptedMentee) : [];
    } catch (error) {
      console.error("Error parsing accepted mentees:", error);
      return [];
    }
  });

  const memoizedAcceptedMentees = useMemo(() => acceptedMentees, [acceptedMentees]);

  const [currentIndex, setCurrentIndex] = useState(1);
    
  const steps = [1,2,3,4,3]
 
  const handleIncreament = ()=>{
     setCurrentIndex((index)=> (index + 1 ) % steps.length)
  }
  
  const handleDecreament = ()=>{
    setCurrentIndex((index)=> (index - 1 ) % steps.length)
  }

  const handleToggleState = () => {
    setToggleState(!toggleState);
  };

  const upDatePage = (ComponentName) => {
    console.log('Updating active component to:', ComponentName);
    localStorage.setItem('components', JSON.stringify(ComponentName));
    setActiveComponent(ComponentName);
    setToggleState(false);
  };

  const AddMentees = (mentee) => {
    const isAlreadyAdded = acceptedMentees.some((item) => item.id === mentee.id);
    if (!isAlreadyAdded) {
      const updatedList = [...acceptedMentees, mentee];
      setAcceptedMentees(updatedList);
      localStorage.setItem("Add", JSON.stringify(updatedList));
    }
  };

  const AddMentors = (mentor) => {
    setAcceptedMentors(prev => [...prev, mentor]);
  };

  const ActiveComponent = components[activeComponent] || Overview;

  const [selectedChatUser, setSelectedChatUser] = useState(() => {
    const storedChatUser = localStorage.getItem('selectedChatUser');
    if (storedChatUser) {
      try {
        return JSON.parse(storedChatUser);
      } catch (error) {
        console.error("Error parsing stored chat user:", error);
        return null;
      }
    }
    return null;
  });

  // Add effect to save selectedChatUser to localStorage
  React.useEffect(() => {
    if (selectedChatUser) {
      localStorage.setItem('selectedChatUser', JSON.stringify(selectedChatUser));
    } else {
      localStorage.removeItem('selectedChatUser');
    }
  }, [selectedChatUser]);

  const [selectedUserForSession, setSelectedUserForSession] = useState(null); // Add state for selected user

  const value = useMemo(() => ({
    ActiveComponent, 
    handleDecreament, 
    handleIncreament, 
    currentIndex, 
    acceptedMentees: memoizedAcceptedMentees, 
    AddMentees, 
    upDatePage, 
    ShowResetConfirmation, 
    otpshow, 
    setOtpShow, 
    activeComponent, 
    handleToggleState, 
    toggleState, 
    setSelectedMentee, 
    selectedMentee,
    profile,
    setProfile,
    formData,
    setFormData,
    acceptedMentors,
    AddMentors,
    selectedChatUser,
    setSelectedChatUser,
    selectedUserForSession,
    setSelectedUserForSession // Add to context
  }), [
    ActiveComponent, 
    handleDecreament, 
    handleIncreament, 
    currentIndex, 
    memoizedAcceptedMentees, 
    AddMentees, 
    upDatePage, 
    ShowResetConfirmation, 
    otpshow, 
    setOtpShow, 
    activeComponent, 
    handleToggleState, 
    toggleState, 
    setSelectedMentee, 
    selectedMentee,
    profile,
    setProfile,
    formData,
    setFormData,
    acceptedMentors,
    AddMentors,
    selectedChatUser,
    setSelectedChatUser,
    selectedUserForSession,
    setSelectedUserForSession
  ]);

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

export default GlobalState;