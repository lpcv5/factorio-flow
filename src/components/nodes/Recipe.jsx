import { useState, useCallback } from "react";
import { Handle, Position } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { useNodeStore } from "../../stores/nodestore";

function PopupSelect({ id, options, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 w-auto bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white h-full rounded-lg ">
        <div className="flex flex-wrap justify-center m-4">
          {options.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-center hover:bg-gray-100 cursor-pointer rounded"
              onClick={() => {
                onSelect(id, option.id);
                onClose();
              }}
              title={option.translated_name}
            >
              <img
                src={`/recipe/${option.name}.png`}
                alt={option.translated_name}
                className="w-4 h-4"
              />
            </div>
          ))}
        </div>
        <button
          className="bg-red-500 text-white rounded hover:bg-red-600 w-full"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
    </div>
  );
}

export default function Recipe({ id, data }) {
  const { nodes, handleAddNode, setProducer, calculateProduction } =
    useNodeStore(
      useShallow((state) => ({
        nodes: state.nodes,
        handleAddNode: state.handleAddNode,
        setProducer: state.setProducer,
        calculateProduction: state.calculateProduction,
      }))
    );
  const [showPopup, setShowPopup] = useState(false);

  const handleLocalOutputChange = (e) => {
    const targetOutput = parseFloat(e.target.value);
    calculateProduction(id, targetOutput);
  };

  // console.log("返回数据", data);

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-1.5 w-24 shadow-md relative text-xs">
      <Handle type="target" position={Position.Left} />
      <div
        className="font-bold text-center mb-1 truncate"
        title={data.translated_name}
      >
        {data.translated_name}
      </div>
      <div>
        <div className="mb-1.5">
          {data.products.map((item, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-100 rounded-sm overflow-hidden mb-0.5"
            >
              <img
                src={`/recipe/${item.name}.png`}
                alt={item.name}
                className="w-3 h-3 mr-0.5"
              />
              <input
                value={item.amount}
                onChange={handleLocalOutputChange}
                className="flex-grow px-0.5 py-0.5 text-xs bg-transparent border-none focus:outline-none w-8"
              />
              <span className="text-xs">/分</span>
            </div>
          ))}
        </div>
        <div className="mb-1.5">
          <h4 className="font-semibold mb-0.5">入:</h4>
          <div className="flex flex-wrap gap-0.5">
            {data.ingredients.map((item, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-sm p-0.5 cursor-pointer"
                onClick={() => handleAddNode(id, item.item_id)}
                title={`${item.translated_name}`}
              >
                <img
                  src={`/recipe/${item.name}.png`}
                  alt={item.name}
                  className="w-3 h-3"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-100 p-0.5 rounded text-xs flex items-center">
          <img
            src={`/recipe/${data.producer}.png`}
            className="w-3 h-3 mr-1 cursor-pointer"
            onClick={() => setShowPopup(true)}
            title={`${
              data.producers.find((producer) => producer.id === data.producer)
                .translated_name
            }`}
          />
          <span>{data.machinesNeeded}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
      {showPopup && (
        <PopupSelect
          id={id}
          options={data.producers}
          onSelect={setProducer}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
