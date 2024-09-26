// ItemSelectionModal.jsx
import React, { useState } from "react";
import { useNodeStore } from "../stores/nodestore";

const ImageWithFallback = ({ src, alt, className }) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  if (error) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
      >
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={className} onError={handleError} />
  );
};

const ItemSelectionModal = ({
  isOpen,
  onClose,
  onConfirm,
  groups,
  items,
  selectedGroup,
  selectedItem, // 改为单个选中项
  onGroupChange,
  onItemSelect, // 改为单选函数
  error,
  isLoading,
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const createNode = useNodeStore(state => state.createNode);

  const handleItemHover = (item) => {
    clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => {
      setHoveredItem(item);
    }, 300);
    setHoverTimeout(timeout);
  };

  const handleItemLeave = () => {
    clearTimeout(hoverTimeout);
    setHoveredItem(null);
  };

  const groupItems = (items) => {
    const groupedItems = {};
    items.forEach((item) => {
      if (!groupedItems[item.subgroup_id]) {
        groupedItems[item.subgroup_id] = [];
      }
      groupedItems[item.subgroup_id].push(item);
    });
    return groupedItems;
  };

  const chunkItems = (items, size) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks;
  };

  const addNode = async () => {
    const name = "electronic-circuit";
    const response = await fetch(
      `http://localhost:8000/api/get_recipe?recipe_name=${name}`
    );
    const data = await response.json();
    createNode(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-auto max-w-4xl flex flex-col h-[90vh]">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4">选择物品组</h2>
          <div className="flex flex-wrap">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => onGroupChange(group.id)}
                className={`transition duration-300 ${
                  selectedGroup === group.id
                    ? "border-2 border-blue-500"
                    : "border border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="w-16 h-16">
                  <ImageWithFallback
                    src={`/item-group/${group.id}.png`}
                    alt={group.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {isLoading ? (
            <p className="text-center py-4">加载中...</p>
          ) : (
            <>
              <h3 className="font-semibold mb-2">选择物品</h3>
              <div>
                {Object.entries(groupItems(items)).map(
                  ([subgroupId, subgroupItems]) => (
                    <div key={subgroupId} className="mb-2">
                      {chunkItems(subgroupItems, 10).map((chunk, index) => (
                        <div key={index} className="flex">
                          {chunk.map((item) => (
                            <div
                              key={item.id}
                              className="relative"
                              onMouseEnter={() => handleItemHover(item)}
                              onMouseLeave={handleItemLeave}
                            >
                              <button
                                onClick={() => onItemSelect(item)}
                                className={`transition duration-300 ${
                                  selectedItem && selectedItem.id === item.id
                                    ? "border-2 border-green-500"
                                    : "border border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                <div className="w-8 h-8">
                                  <ImageWithFallback
                                    src={`/recipe/${item.id}.png`}
                                    alt={item.translated_name || item.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              </button>
                              {hoveredItem === item && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                  {item.translated_name || item.name}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t flex justify-between">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-300"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemSelectionModal;
