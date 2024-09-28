import React, { useState, useEffect, useRef } from "react";
import { useNodeStore } from "../stores/nodestore";
import dataAPI from "../utils/dataapi";

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

const ItemSelectionPanel = ({ isOpen, setIsModalOpen }) => {
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("logistics");
  const [selectedItem, setSelectedItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isRecipePopupOpen, setIsRecipePopupOpen] = useState(false);
  const containerRef = useRef(null);
  const popupRef = useRef(null);

  const createNode = useNodeStore((state) => state.createNode);

  useEffect(() => {
    async function fetchGroups() {
      const groupsResponse = await dataAPI.getGroups();
      setGroups(groupsResponse.data);
    }
    fetchGroups();
  }, []);

  useEffect(() => {
    async function fetchItems() {
      const itemsResponse = await dataAPI.getItemsByGroup(selectedGroup);
      setItems(itemsResponse.data);
    }
    fetchItems();
  }, [selectedGroup]);

  if (isOpen === false) {
    return null;
  }

  const handleGroupChange = (groupId) => {
    setSelectedGroup(groupId);
    setSelectedItem(null);
  };

  const handleItemHover = (item, event) => {
    setHoveredItem(item);
    if (containerRef.current) {
      const rect = event.target.getBoundingClientRect();
      const left = rect.left + rect.width / 2;
      const top = rect.top - 30; // Adjust this value as needed

      containerRef.current.style.setProperty("--hover-left", `${left}px`);
      containerRef.current.style.setProperty("--hover-top", `${top}px`);
    }
  };

  const handleItemLeave = () => {
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

  const handleItemClick = async (item, event) => {
    setSelectedItem(item);
    try {
      const response = await dataAPI.getRecipesForItem(item.id);
      setRecipes(response.data);
      setIsRecipePopupOpen(true);

      // 计算弹出窗口的位置
      if (popupRef.current) {
        const rect = event.target.getBoundingClientRect();
        const left = rect.left;
        const top = rect.top + rect.height + 10;

        popupRef.current.style.setProperty("--popup-left", `${left}px`);
        popupRef.current.style.setProperty("--popup-top", `${top}px`);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const handlePopupClose = () => {
    setSelectedItem(null);
    setIsRecipePopupOpen(false);
  };

  const handleConfirm = async () => {
    try {
      const response = await dataAPI.getRecipeDetails(selectedItem.id);
      if (response.data) {
        createNode(response.data);
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-auto max-w-4xl flex flex-col h-[90vh]">
        <button
          onClick={handleClose}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300"
        >
          取消
        </button>
        {/* Group 开始 */}
        <div className="p-4 border-b">
          <div className="flex flex-wrap">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => handleGroupChange(group.id)}
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
        {/* Group 结束 */}

        {/* Items 开始 */}
        <div className="w-[390px] overflow-y-auto pl-6" ref={containerRef}>
          <div>
            {Object.entries(groupItems(items)).map(
              ([subgroupId, subgroupItems]) => (
                <div key={subgroupId} className="flex flex-wrap">
                  {subgroupItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={(e) => handleItemClick(item, e)}
                      className={`relative transition duration-300 w-8 h-8 ${
                        selectedItem && selectedItem.id === item.id
                          ? "border-2 border-green-500"
                          : "border border-gray-300 hover:border-gray-400"
                      }`}
                      onMouseEnter={(e) => handleItemHover(item, e)}
                      onMouseLeave={handleItemLeave}
                    >
                      <ImageWithFallback
                        src={`/recipe/${item.id}.png`}
                        alt={item.translated_name || item.name}
                        className="w-full h-full object-contain"
                      />
                      {hoveredItem === item && (
                        <div
                          className="fixed transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50"
                          style={{
                            left: `var(--hover-left)`,
                            top: `var(--hover-top)`,
                          }}
                        >
                          {item.translated_name || item.name}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        <div ref={popupRef}>
          {isRecipePopupOpen && selectedItem && (
            <div
              className="absolute bg-slate-500 border border-gray-300 rounded shadow-lg p-2 z-50"
              style={{
                left: `var(--popup-left)`,
                top: `var(--popup-top)`,
              }}
            >
              <h3 className="text-sm font-semibold mb-2">选择配方：</h3>
              <div className="max-h-40 overflow-y-auto">
                {recipes.map((recipe) => (
                  <button
                    key={recipe.id}
                    onClick={handleConfirm}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded transition duration-300"
                  >
                    <div className="flex items-center">
                      <ImageWithFallback
                        src={`/recipe/${recipe.id}.png`}
                        alt={recipe.name}
                        className="w-6 h-6 mr-2 object-contain"
                      />
                      <span className="text-xs">
                        {recipe.translated_name || recipe.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handlePopupClose}
                className="mt-2 text-xs text-red-500 hover:text-red-600 transition duration-300"
              >
                关闭
              </button>
            </div>
          )}
        </div>

        {/* Items 结束 */}
      </div>
    </div>
  );
};

export default ItemSelectionPanel;
