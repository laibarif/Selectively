import React from 'react';
import Grade from '../../assets/pana.jpg'
import amico from '../../assets/amico.jpg'
import teach from '../../assets/pana1.jpg'

function Cards() {
  return (
    <>
      <div className="bg-gray-50 py-24">
        <h2 className="text-4xl font-sans font-semibold text-center mb-8 text-yellow-500">
          Online practice tests to help achieve academic success
        </h2>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-12">
          {/* FREE Practice Tests Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col items-center transition duration-300 ease-in-out transform hover:-translate-y-5 hover:shadow-lg hover:shadow-gray-400">
            <div className="mb-4">
              <img src={Grade} alt="Free Practice Tests" className="w-40 h-40 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              FREE practice tests
            </h3>
            <p className="text-sm text-gray-600 font-medium">Get a sneak peek</p>
            <p className="text-gray-600 mt-4">
              The perfect way to become familiar with the RISE+ platform and
              personalized reporting capabilities, while exploring the different
              types of Math's and English practice questions available for your
              child’s year level.
            </p>
            <button className="bg-orange-500 text-white font-bold py-2 px-6 rounded-full hover:bg-orange-600 mt-4">
              Start a FREE TRIAL
            </button>
          </div>

          {/* NAPLAN Practice Tests Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col items-center transition duration-300 ease-in-out transform hover:-translate-y-5 hover:shadow-lg hover:shadow-gray-400">
            <div className="mb-4">
              <img src={amico} alt="NAPLAN Practice Tests" className="w-40 h-40 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              NAPLAN practice tests
            </h3>
            <p className="text-sm text-gray-600 font-medium">For Years 2 to 7</p>
            <p className="text-gray-600 mt-4">
              Support your child's NAPLAN preparation with NAPLAN-style English
              and Maths practice tests, and help them get familiar with the
              NAPLAN online test format.
            </p>
            <button className="bg-yellow-500 text-white font-bold py-2 px-6 rounded-full hover:bg-yellow-600 mt-4">
              About NAPLAN practice tests
            </button>
          </div>

          {/* ICAS Practice Tests Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col items-center transition duration-300 ease-in-out transform hover:-translate-y-5 hover:shadow-lg hover:shadow-gray-400">
            <div className="mb-4">
              <img src={teach} alt="ICAS Practice Tests" className="w-40 h-40 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              ICAS practice tests
            </h3>
            <p className="text-sm text-gray-600 font-medium">For Years 2 to 7</p>
            <p className="text-gray-600 mt-4">
              Help your child achieve their ambitious ICAS goals with realistic
              practice on the same test player as the ICAS competition.
            </p>
            <button className="bg-orange-500 text-white font-bold py-2 px-6 rounded-full hover:bg-orange-400 mt-4">
              About ICAS practice tests
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Cards;
