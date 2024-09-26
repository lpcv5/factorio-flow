import { useState, useCallback, useRef, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { calculateProduction } from "../../utils/calspeed";
import { useNodeStore } from "../../stores/nodestore";

const ItemPill = ({ name, amount, suffix, onClick, isOutput, onAddNode, showAddButton }) => (
  <div className="flex items-center bg-gray-200 rounded-md overflow-hidden mb-1">
    <div 
      className="flex-grow flex items-center cursor-pointer"
      onClick={isOutput ? onClick : undefined}
    >
      <div className="bg-gray-300 p-1">
        <img src={`/item/${name}.png`} alt={name} className="w-6 h-6" />
      </div>
      <span className="px-2 py-1 text-sm">
        {amount} {suffix}
      </span>
    </div>
    {showAddButton && (
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-r"
        onClick={() => onAddNode(name)}
      >
        →
      </button>
    )}
  </div>
);

const FloatingInput = ({ value, onChange, onClose }) => (
  <div className="absolute right-0 top-0 bg-white border border-gray-300 rounded p-2 shadow-md z-10">
    <input
      type="number"
      value={value}
      onChange={onChange}
      className="w-24 px-2 py-1 border border-gray-300 rounded nodrag"
    />
    <button onClick={onClose} className="ml-2 px-2 py-1 bg-red-500 text-white rounded">X</button>
  </div>
);

export default function Recipe({ id, data }) {
  const { updateNode, createNode } = useNodeStore(
    useShallow((state) => ({
      updateNode: state.updateNode,
      createNode: state.createNode,
    }))
  );
  const [productionData, setProductionData] = useState(null);
  const [selectedOutput, setSelectedOutput] = useState(null);
  const [targetOutput, setTargetOutput] = useState("");
  const outputRefs = useRef({});

  const handleCalculate = useCallback((output) => {
    if (output) {
      const result = calculateProduction(
        output,
        "minute",
        data.craft_time,
        data.out,
        data.in,
        data.producers[0].crafting_speed
      );
      setProductionData(result);
    }
  }, [data]);

  const handleOutputClick = useCallback((item) => {
    setSelectedOutput(item);
    const currentAmount = productionData
      ? productionData.outputsPerUnit.find(o => o.name === item.name).amount
      : item.amount;
    setTargetOutput(currentAmount.toString());
  }, [productionData]);

  const handleTargetOutputChange = useCallback((e) => {
    setTargetOutput(e.target.value);
  }, []);

  const handleCloseFloatingInput = useCallback(() => {
    handleCalculate(parseFloat(targetOutput));
    setSelectedOutput(null);
  }, [handleCalculate, targetOutput]);

  const handleAddNode = useCallback(async (itemName) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/get_recipe?recipe_name=${itemName}`
      );
      const data = await response.json();
      createNode(data);
    } catch (error) {
      console.error("Error adding new node:", error);
    }
  }, [createNode]);

  useEffect(() => {
    if (selectedOutput) {
      const outputRef = outputRefs.current[selectedOutput.name];
      if (outputRef) {
        outputRef.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedOutput]);

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 w-64 shadow-md relative">
      <Handle type="target" position={Position.Left} />
      <div className="font-bold text-center mb-3">{data.translated_name}</div>
      <div className="text-sm">
        <div className="mb-3">
          <h4 className="font-semibold mb-1">输入:</h4>
          {productionData
            ? productionData.inputsPerUnit.map((item, index) => (
                <ItemPill 
                  key={index} 
                  name={item.name} 
                  amount={item.amount} 
                  suffix="/分钟"
                  onAddNode={handleAddNode}
                  showAddButton={true}
                />
              ))
            : data.in.map((item, index) => (
                <ItemPill 
                  key={index} 
                  name={item.name} 
                  amount={item.amount}
                  onAddNode={handleAddNode}
                  showAddButton={true}
                />
              ))}
        </div>
        <div className="mb-3">
          <h4 className="font-semibold mb-1">输出:</h4>
          {data.out.map((item, index) => (
            <div key={index} className="relative" ref={el => outputRefs.current[item.name] = el}>
              <ItemPill 
                name={item.name} 
                amount={productionData ? productionData.outputsPerUnit.find(o => o.name === item.name).amount : item.amount}
                suffix={productionData ? "/分钟" : ""}
                onClick={() => handleOutputClick(item)}
                isOutput={true}
                onAddNode={handleAddNode}
                showAddButton={false}
              />
              {selectedOutput && selectedOutput.name === item.name && (
                <FloatingInput
                  value={targetOutput}
                  onChange={handleTargetOutputChange}
                  onClose={handleCloseFloatingInput}
                />
              )}
            </div>
          ))}
        </div>
        <div className="italic mb-3">
          制作时间: {data.craft_time}秒
        </div>
        {productionData && (
          <div className="bg-gray-100 p-2 rounded">
            <div>需要机器数量: {productionData.machines}</div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}