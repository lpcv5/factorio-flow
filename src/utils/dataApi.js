import axios from "axios";

// 假设你的 API 基础 URL 是这个
const BASE_URL = "http://localhost:8000";

// 创建一个 Axios 实例
const api = axios.create({
  baseURL: BASE_URL,
});

// API 封装
const dataAPI = {
  // 获取所有组
  getGroups: () => {
    return api.get("/groups");
  },

  // 根据组名获取物品
  getItemsByGroup: (groupName) => {
    return api.get(`/items/by_group/${groupName}`);
  },

  // 根据物品 ID 获取可制造的配方
  getRecipesForItem: (itemId) => {
    return api.get(`/recipes/for_item/${itemId}`);
  },

  // 获取指定配方的详细信息
  getRecipeDetails: (recipeId) => {
    return api.get(`/recipe/${recipeId}`);
  },
};

export default dataAPI;
