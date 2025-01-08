import React from "react"; 
import image from '../../assets/image11.svg'
function MediaSection() {
  return (
    <section className="py-24 bg-yellow-50">
      <div className="text-center">
        <h2 className="text-4xl font-semibold sm:text-4xl text-orange-500">
        Get your child`s exam preparation started with free practice tests.
        
          <br />
          Try a free test
        </h2>
      </div>
      <div className="w-full mt-10">
        <div className="w-1/2 mx-auto ">
          <div className="w-full ">
            {/* YouTube iframe */}
            <img
              className="w-full h-[300px] sm:h-[400px] lg:h-[500px]"
              src={image} 
              alt="image"
            ></img>

            {/* Overlay Play Button */}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MediaSection;
