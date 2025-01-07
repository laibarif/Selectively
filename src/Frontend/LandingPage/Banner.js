import React from "react";
import { Link } from "react-router-dom";

const Banner = () => {
  return (
    <div className="w-full flex justify-center bg-gradient-to-r from-yellow-400 to-orange-500 py-8 rounded-lg shadow-lg">
      <div className="block md:flex gap-x-10 items-center p-4  text-center md:text-left">
        <p className="text-3xl font-normal text-gray-800">
          Get your child's exam preparation started with free practice tests
        </p>
        <Link to="/freeassesment"
        
        className="bg-orange-800 text-white font-bold py-3 px-4 mt-4 md:mt-0 rounded-full hover:bg-orange-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg ">
          Try a FREE test
        </Link>
      </div>
    </div>
  );
};

export default Banner;
