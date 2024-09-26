import json

with open('./src/assets/kr2sxp/data2.json', 'r') as f:
    data = json.load(f)

# 合并data["items"]和data["icons"]中,id相同的数据
for category in data["categories"]:
    data[category["id"]] = []
    for item in data["items"]:
        if category["id"] == item["category"]:
            data[category["id"]].append(item)
data["items"] = []
# 将合并后的数据保存到新的json文件中
with open('./src/assets/kr2sxp/data3.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("合并完成")
