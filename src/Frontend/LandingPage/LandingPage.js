import React from "react";
import HeroSection from "./HeroSection";
import MediaSection from "./MediaSection";
import Banner from "./Banner";
import Cards from "./Cards";
import QuestionBanner from "./QuestionBanner";
import AboutBenefit from "./AboutBenefit";
import Reviews from "./Reviews";
import Footer from "./Footer";

function LandingPage() {
  return (
    <>
      <HeroSection />
      <MediaSection />
      <Banner />
      <Cards />
      <QuestionBanner />
      <AboutBenefit />
      <Reviews />
      <Footer />
    </>
  );
}

export default LandingPage;
