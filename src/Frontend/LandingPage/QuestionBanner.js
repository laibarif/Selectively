import React from "react";

function QuestionBanner() {
  return (
    <>
      <div className="w-full flex justify-start sm:justify-center bg-gradient-to-r from-yellow-400 to-orange-500 py-6 rounded-lg shadow-lg ">
        <p className="text-3xl sm:text-4xl font-normal text-gray-800 text-justify leading-relaxed">
          <b>12</b> question types, <b>5,000+</b> questions,
          <br />
          <span className="block text-center mt-2">
            <b>30+</b> tests for each year level
          </span>
        </p>
      </div>
    </>
  );
}

export default QuestionBanner;
