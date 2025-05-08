import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* 🎥 Fullscreen Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/login.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 👇 Button Overlay aligned under logo */}
      <div className="absolute inset-0 flex flex-col justify-center items-center z-10">
        <div className="mt-[340px]">
          <button
            onClick={() => navigate('/login')}
            className="px-12 py-4 bg-white text-blue-800 text-xl font-bold rounded-full shadow-lg hover:bg-blue-100 transition duration-300"
          >
            Enter Conference Hub       
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
