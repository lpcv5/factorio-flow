from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import sqlite3
from typing import List, Dict, Optional
from pydantic import BaseModel

app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite 默认端口
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 数据库连接函数
def get_db_connection():
    conn = sqlite3.connect("./backend/factorio.db")
    conn.row_factory = sqlite3.Row
    return conn

class Group(BaseModel):
    id: str
    name: str
    translated_name: str
    order_value: str
    type: str

# 模型定义
class Item(BaseModel):
    id: str
    name: str
    translated_name: Optional[str] = None
    order_value: str
    subgroup_id: str


class Recipe(BaseModel):
    id: str
    name: str
    translated_name: Optional[str] = None
    category: str
    energy: float
    order_value: str
    enabled: bool
    subgroup_id: str


class Ingredient(BaseModel):
    item_id: str
    name: str
    translated_name: str
    amount: float


class Product(BaseModel):
    item_id: str
    name: str
    translated_name: str
    amount: float
    probability: float
    is_main_product: int


class Producer(BaseModel):
    id: str
    name: str
    translated_name: str
    crafting_speed: float


class RecipeDetail(BaseModel):
    id: str
    name: str
    translated_name: str
    category: str
    energy: float
    order_value: str
    enabled: int
    subgroup_id: str
    ingredients: List[Ingredient]
    products: List[Product]
    producers: List[Producer]  # 更改为 Producer 类型的列表


@app.get("/groups", response_model=List[Group])
async def get_groups():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM groups ORDER BY order_value")
    groups = cursor.fetchall()
    conn.close()
    return [Group(**dict(group)) for group in groups]

# 1. 给出指定的group查询item
@app.get("/items/by_group/{group_name}", response_model=List[Item])
async def get_items_by_group(group_name: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
    SELECT i.id, i.name, i.translated_name, i.order_value, i.subgroup_id
    FROM items i
    JOIN subgroups s ON i.subgroup_id = s.id
    JOIN groups g ON s.group_id = g.id
    WHERE g.name = ?
    ORDER BY s.order_value, i.order_value
    """,
        (group_name,),
    )

    items = cursor.fetchall()
    conn.close()

    if not items:
        raise HTTPException(
            status_code=404, detail=f"No items found for group: {group_name}"
        )

    return [Item(**dict(item)) for item in items]


# 2. 给出指定的item查询可以制造的配方
@app.get("/recipes/for_item/{item_id}", response_model=List[Recipe])
async def get_recipes_for_item(item_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
    SELECT r.* 
    FROM recipes r
    JOIN recipe_products rp ON r.id = rp.recipe_id
    WHERE rp.item_id = ?
    ORDER BY r.order_value
    """,
        (item_id,),
    )

    recipes = cursor.fetchall()
    conn.close()

    if not recipes:
        raise HTTPException(
            status_code=404, detail=f"No recipes found for item: {item_id}"
        )

    return [Recipe(**dict(recipe)) for recipe in recipes]


# 3. 给出指定的配方可以查询配方详细信息（材料，产物，制造机器）
@app.get("/recipe/{recipe_id}", response_model=RecipeDetail)
async def get_recipe_details(recipe_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    # 获取配方基本信息
    cursor.execute("SELECT * FROM recipes WHERE id = ?", (recipe_id,))
    recipe = cursor.fetchone()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    recipe_dict = dict(recipe)

    # 获取配方原料
    cursor.execute(
        """
    SELECT i.id as item_id, i.name, i.translated_name, ri.amount
    FROM recipe_ingredients ri
    JOIN items i ON ri.item_id = i.id
    WHERE ri.recipe_id = ?
    """,
        (recipe_id,),
    )
    recipe_dict["ingredients"] = [dict(ing) for ing in cursor.fetchall()]

    # 获取配方产物
    cursor.execute(
        """
    SELECT i.id as item_id, i.name, i.translated_name, rp.amount, rp.probability, rp.is_main_product
    FROM recipe_products rp
    JOIN items i ON rp.item_id = i.id
    WHERE rp.recipe_id = ?
    """,
        (recipe_id,),
    )
    recipe_dict["products"] = [dict(prod) for prod in cursor.fetchall()]

    # 获取可以制造这个配方的机器列表
    cursor.execute(
        """
    SELECT p.id, p.name, p.translated_name, p.crafting_speed
    FROM producers p
    JOIN producer_categories pc ON p.id = pc.producer_id
    WHERE pc.category = ? AND p.id NOT IN ('character', 'character-jetpack')
    ORDER BY p.crafting_speed
    """,
        (recipe_dict["category"],),
    )
    recipe_dict["producers"] = [dict(producer) for producer in cursor.fetchall()]

    conn.close()

    return RecipeDetail(**recipe_dict)


if __name__ == "__main__":
    uvicorn.run(app="main:app", host="0.0.0.0", port=8000, reload=True)
