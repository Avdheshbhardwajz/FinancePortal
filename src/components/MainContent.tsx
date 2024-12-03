import React from "react";
import WelcomeImage from "../assets/Logo.png"; // Importing a PNG image

const MainContent: React.FC = () => {
  return (
    <div className="flex flex-col font-poppins   items-center justify-center h-[100%] p-6 bg-transparent rounded-lg shadow-md">
      <img src={WelcomeImage} alt="Welcome" className="w-[30%] mb-6" /> {/* PNG image */}
      <h1 className="text-xl font-bold md:text-4xl text-[#20205C] mb-2">
        Welcome to the Sundaram Mutual Fund Admin Portal
      </h1>
      <h2 className="text-lg md:text-xl font-light text-gray-600 mb-6">
        Manage your operations efficiently and effectively
      </h2>
      
    </div>
  );
};

export default MainContent;
