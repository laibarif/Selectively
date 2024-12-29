import React from "react";
import subscription from "../../assets/subscription.png";

const AboutBenefit = () => {
  return (
    <div className="py-16 bg-yellow-50">
      <div className="container mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row lg:justify-around items-center  mx-auto">
          {/* Left Section */}
          <div className="lg:w-1/2">
            <h1 className="text-5xl font-mono font-normal mb-6 text-gray-900 leading-snug">
              The benefits of RiSE+ for exam preparation
            </h1>
            <ul className="list-disc ml-6 text-gray-800 space-y-1 text-lg">
              <li>
                <strong>Actionable progress reports</strong> identify how you
                can help your child achieve their full potential.
              </li>
              <li>
                <strong>Personalised insights</strong> pinpoint your child’s{" "}
                <strong>strengths</strong>, <strong>weaknesses</strong>, and
                development opportunities.
              </li>
              <li>
                <strong>Results</strong> are shared <strong>immediately</strong>{" "}
                after every test completion.
              </li>
              <li>
                <strong>Unlimited re-sits.</strong> Practice each test as many
                times as you like.
              </li>
              <li>
                Build <strong>familiarity</strong> with assessment in an online
                format, to cultivate a sense of assurance and confidence
                pre-assessment day.
              </li>
              <li>
                <strong>Curriculum-linked skill areas</strong> are tailored to
                your child’s year level.
              </li>
              <li>
                PLUS, receive{" "}
                <strong>30 bonus tests for year levels 4–7</strong> to further
                develop foundational skills.
              </li>
            </ul>
            <div className="mt-6">
              <button className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-full shadow-lg hover:bg-yellow-700 text-lg">
                View subscription options
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="lg:w-3/2 mt-10 lg:mt-0 lg:ml-12">
            <img
              src={subscription}
              alt="Progress Report Mockup"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutBenefit;
