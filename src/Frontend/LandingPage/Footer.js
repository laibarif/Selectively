import React from "react";
import logo from "../../assets/Logo_White - Complete.svg";
import { Link } from "react-router-dom";
function Footer() {
  return (
    <>
      <footer class="text-gray-600 body-font bg-yellow-50">
        <div class="container px-5 pb-14 mx-auto">
          <div class="w-full block sm:flex ">
            <div className="w-full sm:w-1/5 ">
              <img
                src={logo}
                alt="Logo"
                className="h-32 w-32 mx-auto sm:mx-0"
              />
            </div>
            <div className="w-full sm:w-2/3 flex flex-wrap justify-center  gap-y-4  gap-x-10 sm:gap-x-11 mx-auto mb-6 sm:mb-0">
              <Link className="text-gray-600 hover:text-gray-800 font-semibold">
                Privacy
              </Link>

              <Link className="text-gray-600 hover:text-gray-800 font-semibold">
                Terms & Conditions
              </Link>

              <Link className="text-gray-600 hover:text-gray-800 font-semibold">
                Term of use
              </Link>

              <Link className="text-gray-600 hover:text-gray-800 font-semibold">
                About Us
              </Link>

              <Link className="text-gray-600 hover:text-gray-800 font-semibold">
                Technical requirements
              </Link>
            </div>

            <div class="w-full mt-1 sm:w-1/3 px-2">
              <h2 class=" font-bold text-gray-900 tracking-widest text-lg mb-1">
                Expert tips delivered to your inbox
              </h2>
              <p
                for="footer-field"
                class="leading-7 text-md text-gray-700 font-semibold my-4 sm:my-1"
              >
                Sign up to receive emails from Janison about RiSE+ and relevant
                education products, services, content and events.​
              </p>
              <div class="flex xl:flex-nowrap md:flex-nowrap items-end md:justify-start justify-center">
                <div class="relative w-40 sm:w-auto xl:mr-1 lg:mr-0 sm:mr-4 mr-1 my-4">
                  <input
                    type="text"
                    id="footer-field"
                    name="footer-field"
                    placeholder="Enter your Email"
                    class="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  />
                </div>
                <button class="lg:mt-2 xl:mt-0 flex-shrink-0 inline-flex text-white bg-yellow-500 border-0 py-2 px-6 focus:outline-none hover:bg-yellow-600 rounded my-4">
                  Button
                </button>
              </div>
              <p class="text-gray-700 text-md font-semibold mt-4 sm:mt-1 md:text-left text-center my-1">
                By subscribing, you agree to our Terms and conditions, Terms of
                use and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
