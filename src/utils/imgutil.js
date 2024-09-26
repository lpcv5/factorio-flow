const parsePosition = (position) => {
  if (position) {
    const [x, y] = position.split(" ").map((pos) => parseFloat(pos));
    return { x, y };
  }
  return { x: -3036, y: -924 };
};

const getScaledPosition = (position, scale) => {
  const { x, y } = parsePosition(position);
  return `${x * scale}px ${y * scale}px`;
};

const getScaledBackgroundSize = (spriteWidth, spriteHeight, scale) => {
  return `${spriteWidth * scale}px ${spriteHeight * scale}px`;
};

const getScaledIconSize = (iconSize, scale) => {
  return `${iconSize * scale}px`;
};

export { getScaledPosition, getScaledBackgroundSize, getScaledIconSize };
