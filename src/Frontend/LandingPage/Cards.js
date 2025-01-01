import React from "react";
import Grade from "../../assets/pana.jpg";
import amico from "../../assets/amico.jpg";
import teach from "../../assets/pana1.jpg";

function Cards() {
  return (
    <>
      <div className="py-24 bg-yellow-50">
        <h2 className="text-4xl font-sans font-semibold text-center mb-8 text-yellow-500">
          Online practice tests to achieve your selective goal
        </h2>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-12">
          {/* FREE Practice Tests Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col items-center transition duration-300 ease-in-out transform hover:-translate-y-5 hover:shadow-lg hover:shadow-gray-400">
            <div className="mb-4">
              <img
                src={Grade}
                alt="Free Practice Tests"
                className="w-40 h-40 mx-auto"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Free assessment
            </h3>
            {/* <p className="text-sm text-gray-600 font-medium">
              Get a sneak peek
            </p> */}
            <p className="text-gray-600 mt-4">
              Take a free assessment in English, Mathematical Reasoning and
              Thinking Skills. There will be 10 questions each and will give the
              student a flavour of the exam.
            </p>
            {/* <button className="bg-orange-500 text-white font-bold py-2 px-6 rounded-full hover:bg-orange-600 mt-4">
              Start a FREE TRIAL
            </button> */}
          </div>

          {/* NAPLAN Practice Tests Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col items-center transition duration-300 ease-in-out transform hover:-translate-y-5 hover:shadow-lg hover:shadow-gray-400">
            <div className="mb-4">
              <img
                src={amico}
                alt="NAPLAN Practice Tests"
                className="w-40 h-40 mx-auto"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Affordable</h3>
            {/* <p className="text-sm text-gray-600 font-medium">
              For Years 2 to 7
            </p> */}
            <p className="text-gray-600 mt-4">
              There are varied plans to choose from to ensure we cater for the
              requirements of everyone. Extremely easy process to sign up for
              your child.
            </p>
            {/* <button className="bg-yellow-500 text-white font-bold py-2 px-6 rounded-full hover:bg-yellow-600 mt-4">
              About NAPLAN practice tests
            </button> */}
          </div>

          {/* ICAS Practice Tests Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col items-center transition duration-300 ease-in-out transform hover:-translate-y-5 hover:shadow-lg hover:shadow-gray-400">
            <div className="mb-4">
              <img
                src={teach}
                alt="ICAS Practice Tests"
                className="w-40 h-40 mx-auto"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Online Practice Tests
            </h3>
            {/* <p className="text-sm text-gray-600 font-medium">
              For Years 2 to 7
            </p> */}
            <p className="text-gray-600 mt-4">
              And once you sign upyour child receives - mock tests of English,
              Mathematical Reasoning, Thinking Skills and Creative Writing. If
              your child is not ready yet and requires some warm up- there are
              many practice questions too.
            </p>
            {/* <button className="bg-orange-500 text-white font-bold py-2 px-6 rounded-full hover:bg-orange-400 mt-4">
              About ICAS practice tests
            </button> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Cards;
