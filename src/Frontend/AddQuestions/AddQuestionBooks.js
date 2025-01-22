import React from 'react';
import logo from '../../assets/english.jpg'
import { Link } from 'react-router-dom';
function AddQuestionBooks() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-4">
        {/* Card 1 */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-all hover:scale-105 w-72"> {/* Increased width */}
          <img src={logo} alt="Book Cover" className="w-full h-64 object-cover"/> {/* Increased height */}
          <div className="p-4">
            
            <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">Add English Question</button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-all hover:scale-105 w-72"> {/* Increased width */}
          <img src={logo} alt="Book Cover" className="w-full h-64 object-cover"/> {/* Increased height */}
          <div className="p-4">
            <Link to='/add-mathQuestions'>
            <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">Add Math Question</button>
            </Link>
          </div>
          
        </div>

        {/* Card 3 */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-all hover:scale-105 w-72"> {/* Increased width */}
          <img src={logo} alt="Book Cover" className="w-full h-64 object-cover"/> {/* Increased height */}
          <div className="p-4">
            <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">Add ThinkingSkill Question</button>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-all hover:scale-105 w-72"> {/* Increased width */}
          <img src={logo} alt="Book Cover" className="w-full h-64 object-cover"/> {/* Increased height */}
          <div className="p-4">
            {/* <h3 className="text-xl font-semibold text-gray-700">Book Name 4</h3> */}
            <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">Add Writing Question</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddQuestionBooks;
