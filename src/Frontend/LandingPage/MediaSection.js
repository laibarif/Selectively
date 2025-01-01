import React from "react";

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
        <div className="w-8/12 mx-auto ">
          <div className="w-full ">
            {/* YouTube iframe */}
            <iframe
              className="w-full h-[300px] sm:h-[400px] lg:h-[500px]"
              src="https://www.youtube.com/embed/VIDEO_ID" // Replace VIDEO_ID with your YouTube video ID
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>

            {/* Overlay Play Button */}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MediaSection;
