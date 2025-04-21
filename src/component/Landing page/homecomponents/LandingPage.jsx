import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import AfterHero from './AfterHero';
import Mentee from './Mentee';
import Mentor from '../Mentor';
import MatchingSystem from '../MatchingSystem';
import Potential from './Potential';
import MoreInfo from './MoreInfo';
import Overview from './Overview';
import Footer from './Footer';


function LandingPage() {
    return (
        <>
              <Navbar/>
              <Hero/>
              <AfterHero/> 
              <Mentee/>
              <Mentor/> 
              <MatchingSystem/>
              <Potential/>
              <MoreInfo/>
              <Overview/>
              <Footer/>
        </>
       
    );
}

export default LandingPage;