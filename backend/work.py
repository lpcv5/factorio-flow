import json
import sqlite3
import traceback

# 读取 JSON 文件
with open("./backend/recipes.json", "r", encoding="utf-8") as file:
    data = json.load(file)

# 连接到 SQLite 数据库（如果不存在，将创建一个新的）
conn = sqlite3.connect("./backend/factorio_data.db")
cursor = conn.cursor()

# 创建 entities 表
cursor.execute('''
CREATE TABLE IF NOT EXISTS entities (
    name TEXT PRIMARY KEY,
    type TEXT,
    order_value TEXT,
    group_name TEXT,
    subgroup TEXT,
    crafting_speed REAL,
    crafting_categories TEXT,
    allowed_effects TEXT,
    module_inventory_size INTEGER,
    width INTEGER,
    height INTEGER,
    flags TEXT,
    translated_name TEXT,
    fixed_recipe TEXT,
    rocket_parts_required INTEGER,
    energy_consumption REAL,
    drain REAL,
    energy_source TEXT,
    pollution REAL
)
''')

# 打开错误日志文件
with open('error_log.txt', 'w') as error_log:
    # 插入 entities 数据
    for entity_name, entity_data in data['entities'].items():
        try:
            cursor.execute('''
            INSERT OR REPLACE INTO entities (
                name, type, order_value, group_name, subgroup, crafting_speed, crafting_categories, 
                allowed_effects, module_inventory_size, width, height, flags, translated_name, 
                fixed_recipe, rocket_parts_required, energy_consumption, drain, energy_source, pollution
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                entity_data['name'],
                entity_data.get('type', ''),
                entity_data.get('order', ''),
                entity_data.get('group', ''),
                entity_data.get('subgroup', ''),
                entity_data.get('crafting_speed', 0),
                json.dumps(entity_data.get('crafting_categories', [])),
                json.dumps(entity_data.get('allowed_effects', [])),
                entity_data.get('module_inventory_size', 0),
                entity_data.get('width', 0),
                entity_data.get('height', 0),
                json.dumps(entity_data.get('flags', [])),
                entity_data.get('translated_name', ''),
                entity_data.get('fixed_recipe', ''),
                entity_data.get('rocket_parts_required', 0),
                entity_data.get('energy_consumption', 0),
                entity_data.get('drain', 0),
                entity_data.get('energy_source', ''),
                entity_data.get('pollution', 0)
            ))
            conn.commit()
        except Exception as e:
            conn.rollback()
            error_log.write(f"Error inserting entity: {entity_name}\n")
            error_log.write(f"Error message: {str(e)}\n")
            error_log.write(f"Traceback: {traceback.format_exc()}\n")
            error_log.write(f"Entity data: {json.dumps(entity_data, indent=2)}\n")
            error_log.write("\n" + "-"*50 + "\n\n")
            print(f"Error inserting entity: {entity_name}. Check error_log.txt for details.")
            continue

# 关闭数据库连接
conn.close()

print("Data import process for entities completed. Check error_log.txt for any errors.")