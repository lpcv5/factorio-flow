// 高斯消元法求解线性方程组
function gaussianElimination(A, b) {
  let n = A.length;
  let augmentedMatrix = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    // 找主元
    let maxElement = Math.abs(augmentedMatrix[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmentedMatrix[k][i]) > maxElement) {
        maxElement = Math.abs(augmentedMatrix[k][i]);
        maxRow = k;
      }
    }

    // 交换最大行
    [augmentedMatrix[i], augmentedMatrix[maxRow]] = [
      augmentedMatrix[maxRow],
      augmentedMatrix[i],
    ];

    // 消元
    for (let k = i + 1; k < n; k++) {
      let factor = augmentedMatrix[k][i] / augmentedMatrix[i][i];
      for (let j = i; j <= n; j++) {
        augmentedMatrix[k][j] -= factor * augmentedMatrix[i][j];
      }
    }
  }

  // 回代
  let x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmentedMatrix[i][n] / augmentedMatrix[i][i];
    for (let k = i - 1; k >= 0; k--) {
      augmentedMatrix[k][n] -= augmentedMatrix[k][i] * x[i];
    }
  }

  return x;
}

function buildMatrixFromRecipes(recipes) {
  const items = new Set();
  recipes.forEach((recipe) => {
    recipe.products.forEach((product) => items.add(product.item_id));
    recipe.ingredients.forEach((ingredient) => items.add(ingredient.item_id));
  });
  const itemArray = Array.from(items);
  const n = itemArray.length;
  const m = recipes.length;

  // 初始化矩阵A
  const A = Array(n)
    .fill()
    .map(() => Array(m).fill(0));

  // 填充矩阵A
  recipes.forEach((recipe, recipeIndex) => {
    recipe.products.forEach((product) => {
      const rowIndex = itemArray.indexOf(product.item_id);
      A[rowIndex][recipeIndex] += product.amount; // 使用 += 而不是 =
    });
    recipe.ingredients.forEach((ingredient) => {
      const rowIndex = itemArray.indexOf(ingredient.item_id);
      A[rowIndex][recipeIndex] -= ingredient.amount; // 使用 -= 而不是 =
    });
  });

  // 检查并处理只有一个配方的情况
  if (m === 1) {
    // 添加一个虚拟列，以确保矩阵至少有两列
    A.forEach((row) => row.push(0));
  }

  console.log("Item Array:", itemArray);
  console.log("Matrix A:", A);

  return { A, itemArray };
}

// 主要的计算函数
export function calculateProduction(
  recipes,
  targetItemId,
  targetRate,
  isPerMinute
) {
  // 构建矩阵
  const { A, itemArray } = buildMatrixFromRecipes(recipes);

  // 创建目标向量b
  const b = Array(itemArray.length).fill(0);
  const targetIndex = itemArray.indexOf(targetItemId);
  const targetRatePerSecond = isPerMinute ? targetRate / 60 : targetRate;
  b[targetIndex] = targetRatePerSecond;

  // 求解方程
  const x = gaussianElimination(A, b);
  console.log(A);
  console.log(b);
  console.log(x);

  // 计算结果
  const results = {};
  itemArray.forEach((item, index) => {
    results[item] = Math.max(0, x[index]); // 避免负数结果
  });

  // 计算所需的机器数量
  const machinesNeeded = {};
  recipes.forEach((recipe, index) => {
    const recipeRate = x[index];
    if (recipeRate > 0) {
      // 使用配方中指定的生产者
      const producer = recipe.producers[0]; // 假设第一个生产者是默认的
      machinesNeeded[recipe.id] =
        (recipeRate * recipe.energy) / producer.crafting_speed;
    }
  });

  return {
    machinesNeeded,
    itemsPerSecond: results,
    itemsPerMinute: Object.fromEntries(
      Object.entries(results).map(([k, v]) => [k, v * 60])
    ),
  };
}
