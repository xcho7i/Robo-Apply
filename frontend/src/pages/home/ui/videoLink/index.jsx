import React from "react";

const VideoShow = () => {
  return (
    <>
      <div className="flex justify-center pt-20 ">
        <iframe
          width="80%"
          height="700"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Example video URL
          title="Dummy Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg shadow-lg border  border-[#9F52F2]"
          style={{
            boxShadow: `
        0 0 55px 50px rgba(255, 255, 255, 0.2), 
            0 0 110px 5px rgba(128, 0, 255, 0.3), 
            0 0 100px 10px rgba(128, 0, 255, 0.2)
          `,
          }}
        ></iframe>
      </div>
    </>
  );
};

export default VideoShow;
