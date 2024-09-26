export function calculateProduction(
  targetOutput,
  timeUnit,
  craftTime,
  out,
  inp,
  craftingSpeed
) {
  // 将目标输出转换为每秒产量
  let targetOutputPerSecond =
    timeUnit === "minute" ? targetOutput / 60 : targetOutput;

  // 获取主要输出物品
  const mainOutput = out.find((item) => item.is_main_product === 1);
  const outputAmount = mainOutput.amount;

  // 计算基础生产率（每秒）
  const baseProductionRate = outputAmount / craftTime;

  // 计算实际生产率（考虑机器速度）
  const actualProductionRate = baseProductionRate * craftingSpeed;

  // 计算所需机器数量并保留一位小数
  const machinesNeeded = (targetOutputPerSecond / actualProductionRate).toFixed(
    1
  );

  // 计算每单位时间所需的输入材料数量
  const inputsPerUnit = inp.map((item) => ({
    name: item.name,
    amount: Math.round(
      ((targetOutputPerSecond * item.amount) / outputAmount) *
        (timeUnit === "minute" ? 60 : 1)
    ),
  }));

  // 计算每单位时间的所有输出数量
  const outputsPerUnit = out.map((item) => ({
    name: item.name,
    amount: Math.round(
      ((targetOutputPerSecond * item.amount) / outputAmount) *
        (timeUnit === "minute" ? 60 : 1)
    ),
  }));

  return {
    machines: parseFloat(machinesNeeded),
    inputsPerUnit: inputsPerUnit,
    outputsPerUnit: outputsPerUnit,
  };
}
