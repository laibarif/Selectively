import React from "react";
import star from '../../assets/stars.png'
import plant from '../../assets/Plant.jpg'
const Reviews = () => {
  return (
    <div className="relative py-28"> 
    <img src={plant} alt="Plant" className="absolute hidden sm:block  sm:top-48 left-40    w-24 h-28" /> 
    <img src={star} alt="Stars" className="absolute top-56 right-16 sm:top-56 sm:right-48 w-28 h-36" />
    <div className=" py-12">
      <div className="container mx-auto text-center">
        <h2 className="font-mono text-3xl md:text-4xl font-bold text-yellow-500 mb-8">
          Top reviews from parents across Australia
        </h2>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          {/* Card 1 */}
          <div className="bg-gray-300 rounded-lg shadow-md p-6 max-w-sm transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-gray-300">
            <p className="text-gray-700 text-lg italic">
              "I love that it's an impartial true representation of your child's abilities."
            </p>
            <p className="text-gray-800 font-bold mt-4">Amira</p>
          </div>
          {/* Card 2 */}
          <div className="bg-gray-300 rounded-lg shadow-md p-6 max-w-sm transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-gray-300">
            <p className="text-gray-700 text-lg italic">
              "Great resource. Focus tests and ICAS-style tests mean we're able to work on each skill individually once a weakness is identified."
            </p>
            <p className="text-gray-800 font-bold mt-4">Ramana</p>
          </div>
          {/* Card 3 */}
          <div className="bg-gray-300 rounded-lg shadow-md p-6 max-w-sm transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-gray-300">
            <p className="text-gray-700 text-lg italic">
              "Easy to use. Valuable resource"
            </p>
            <p className="text-gray-800 font-bold mt-4">Dave</p>
          </div>
        </div>
      </div>
    </div>
    <div className="w-full flex justify-center bg-gradient-to-r from-yellow-400 to-orange-500 py-4 rounded-lg shadow-lg">
    <div className="block md:flex gap-x-10 items-center py-10  text-center md:text-left">
      <p className="text-3xl font-normal text-gray-800">
      Take your child's academic results to the next level
      </p>
      <button className="bg-orange-800 text-white font-bold py-3 px-4 mt-4 md:mt-0 rounded-full hover:bg-orange-600 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-400">
        Sign up today
      </button>
    </div>
  </div>

    </div>
  );
};

export default Reviews;
