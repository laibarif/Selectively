import React from 'react'
import './landing.css'
import hero from '../../assets/herosection.jpg'
function HeroSection() {
  return (
    <>
    <section
  className="block sm:flex justify-between "
>
  

<div className="w-10/12 sm:max-w-xl  ltr:sm:text-left rtl:sm:text-right mx-auto my-auto">
      <p className="text-2xl font-semibold sm:text-5xl text-justify here-para text-yellow-600">
      Prepare your child for NAPLAN and ICAS
      </p>

      <p className="mt-4 max-w-lg sm:text-md font-semibold text-yellow-600">
      Prepare your child for academic success with online practice tests designed to build their confidence, relieve their anxiety on test day and help them get ahead.
      </p>

      <div className="mt-8 flex flex-wrap gap-4 text-center">
        <a
          href="#"
          className="block w-full rounded bg-yellow-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-yellow-500 focus:outline-none focus:ring active:bg-rose-500 sm:w-auto"
        >
          Get Today
        </a>

       
      </div>
    </div>
  <div
    className=" inset-0 ltr:sm:bg-gradient-to-r rtl:sm:bg-gradient-to-l"
  >
    <img src={hero} alt='hero'/>
  </div>
</section>
    </>
  )
}

export default HeroSection