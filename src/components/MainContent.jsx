// MainContent.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import MyFlow from "../components/MyFlow";
import ItemSelectionModal from "./ItemSelectionModal";

const API_BASE_URL = "http://localhost:8000";
const api = axios.create({ baseURL: API_BASE_URL });

const MainContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // 改为单个选中项
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItemsList, setSelectedItemsList] = useState([]); // 新增：已选择物品列表

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    api
      .get("/groups")
      .then((response) => {
        setGroups(response.data.slice(0, 6));
        if (response.data.length > 0) {
          setSelectedGroup(response.data[0].id);
        }
      })
      .catch((error) => {
        console.error("Error fetching groups:", error);
        setError("获取物品组失败。请检查网络连接或稍后再试。");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      setIsLoading(true);
      setError(null);
      api
        .get(`/items/by_group/${selectedGroup}`)
        .then((response) => {
          setItems(response.data);
        })
        .catch((error) => {
          console.error("Error fetching items:", error);
          setError("获取物品失败。请检查网络连接或稍后再试。");
        })
        .finally(() => setIsLoading(false));
    }
  }, [selectedGroup]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setError(null);
  };

  const handleGroupChange = (groupId) => {
    setSelectedGroup(groupId);
    setSelectedItem(null); // 清除选中的物品
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item); // 设置选中的物品
  };

  const handleConfirm = () => {
    if (selectedItem) {
      setSelectedItemsList((prevList) => [...prevList, selectedItem]); // 将选中的物品添加到列表
      console.log("Selected item:", selectedItem);
      setIsModalOpen(false);
      setSelectedItem(null); // 重置选中的物品
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-4">
        <div className="flex items-center">
          <div className="flex items-center bg-gray-200 rounded-l-lg overflow-hidden">
            {selectedItemsList.map((item, index) => (
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
            ))}
          </div>
          <button
            onClick={toggleModal}
            className="h-8 w-8 bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg transition duration-300 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
      <MyFlow className="flex-1 w-full"></MyFlow>
      <ItemSelectionModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        onConfirm={handleConfirm}
        groups={groups}
        items={items}
        selectedGroup={selectedGroup}
        selectedItem={selectedItem}
        onGroupChange={handleGroupChange}
        onItemSelect={handleItemSelect}
        error={error}
        isLoading={isLoading}
      />
    </div>
  );
};

export default MainContent;
