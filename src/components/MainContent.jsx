// MainContent.jsx
import { useState, useEffect } from "react";
import MyFlow from "../components/MyFlow";
import { ReactFlowProvider } from "@xyflow/react";
import ItemSelectionPanel from "./ItemSelectionPanel";

const MainContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ReactFlowProvider>

    <div className="flex flex-col h-full w-full">
      <div className="p-4">
        <div className="flex items-center rounded-lg">
          <div className="flex items-center bg-gray-200 overflow-hidden">
            {/* {selectedItemsList.map((item, index) => (
              <div
                key={index}
                className="w-8 h-8 flex items-center justify-center"
              >
                <img
                  src={`/recipe/${item.id}.png`}
                  alt={item.translated_name || item.name}
                  className="w-6 h-6 object-contain"
                />
              </div>
            ))} */}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-8 w-8 bg-blue-500 hover:bg-blue-600 text-white transition duration-300 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
      <MyFlow className="flex-1 w-full"></MyFlow>
      <ItemSelectionPanel
        isOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </div>
  </ReactFlowProvider>
  );

};

export default MainContent;
