import React from 'react';
import math from '../../assets/math.jpg';
import english from '../../assets/englishbook.jpg';
import thinking from '../../assets/thinkingskill.jpg';
import writing from '../../assets/wrodCloud.png';
import { Link } from 'react-router-dom';

function AddQuestionBooks() {
  return (
    <div className="flex justify-center items-center pt-20 bg-gray-50 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
        
        {/* English Card */}
        <div className="bg-white shadow-lg shadow-slate-500 rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl w-80">
          <img src={english} alt="English Book" className="w-full h-64 object-cover" />
          <div className="p-6 text-center">
            <Link to='/add-readingQuestions'>
              <button className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold transition-all duration-300 hover:bg-blue-500 shadow-md hover:shadow-lg">
                Add English Question
              </button>
            </Link>
          </div>
        </div>

        {/* Math Card */}
        <div className="bg-white shadow-lg shadow-slate-500 rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl w-80">
          <img src={math} alt="Math Book" className="w-full h-64 object-cover" />
          <div className="p-6 text-center">
            <Link to='/add-mathQuestions'>
              <button className="w-full py-3 bg-green-600 text-white rounded-md font-semibold transition-all duration-300 hover:bg-green-500 shadow-md hover:shadow-lg">
                Add Math Question
              </button>
            </Link>
          </div>
        </div>

        {/* Thinking Skill Card */}
        <div className="bg-white shadow-lg shadow-slate-500 rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl w-80">
          <img src={thinking} alt="Thinking Skill Book" className="w-full h-64 object-cover" />
          <div className="p-6 text-center">
            <Link to='/add-thinkingskillQuestions'>
              <button className="w-full py-3 bg-yellow-500 text-white rounded-md font-semibold transition-all duration-300 hover:bg-yellow-400 shadow-md hover:shadow-lg">
                Add Thinking Skill Question
              </button>
            </Link>
          </div>
        </div>

        {/* Writing Card */}
        <div className="bg-white shadow-lg  shadow-slate-500 rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl w-80">
          <img src={writing} alt="Writing Book" className="w-full h-64 object-cover" />
          <div className="p-6 text-center">
            <Link to='/add-writingQuestions'>
              <button className="w-full py-3 bg-red-600 text-white rounded-md font-semibold transition-all duration-300 hover:bg-red-500 shadow-md hover:shadow-lg">
                Add Writing Question
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AddQuestionBooks;
