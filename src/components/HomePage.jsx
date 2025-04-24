import { useState } from "react";
import CreateQuestion from "../pages/CreateQuestion";
import UploadPdf from "../pages/UploadPdf";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("upload"); // 'create' or 'upload'

  return (
    <div className="flex flex-col items-center m-10">
      {/* Toggle between Create Questions and Upload PDF */}
      <div className="mb-6 border-2 border-gray-300 rounded-full p-1 flex w-96">
        <button
          className={`flex-1 py-2 px-4 rounded-full text-center ${
            activeTab === "upload" 
              ? "bg-gray-700 text-white" 
              : "bg-transparent text-gray-400"
          }`}
          onClick={() => setActiveTab("upload")}
        >
          Upload PDF
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-full text-center ${
            activeTab === "create" 
              ? "bg-gray-700 text-white" 
              : "bg-transparent text-gray-400"
          }`}
          onClick={() => setActiveTab("create")}
        >
          Create Questions
        </button>
      </div>
      
      {/* Render the active component */}
      {activeTab === "create" ? <CreateQuestion /> : <UploadPdf />}
    </div>
  );
};

export default HomePage;