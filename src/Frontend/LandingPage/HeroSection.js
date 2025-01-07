import React from "react";
import "./landing.css";
import hero from "../../assets/herosection.png";
import { Link } from "react-router-dom";
function HeroSection() {
  return (
    <>
      <section className="block sm:flex justify-between bg-yellow-50">
        <div className="w-10/12 sm:max-w-xl  ltr:sm:text-left rtl:sm:text-right mx-auto my-auto">
          <p className="text-2xl font-semibold sm:text-5xl text-justify here-para text-yellow-600">
          Set your child up for the love of learning 
          </p>

          <p className="mt-4 max-w-lg sm:text-md font-semibold text-yellow-600">
          Empower your child to excel academically with online practice tests
tailored to boost confidence, give them a competitive edge and pave the
way for top results.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 text-center">
            <Link
              to='/freeassesment'
              className="block w-full rounded bg-yellow-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-yellow-500 focus:outline-none focus:ring active:bg-yellow-300 sm:w-auto"
            >
              Try a free test for my child
            </Link>
          </div>
        </div>
        <div className=" inset-0 ltr:sm:bg-gradient-to-r rtl:sm:bg-gradient-to-l">
          <img src={hero} alt="hero" />
        </div>
      </section>
    </>
  );
}

export default HeroSection;
