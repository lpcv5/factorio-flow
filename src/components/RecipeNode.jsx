/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import "../styles/recipenode.css";

const RecipeNode = ({ recipe }) => {
  const adjustedTime = 10 / 1.5;
  useEffect(() => {
    console.log(recipe);
  })

  return (
    <div className="recipe-node">
      <Handle type="target" position={Position.Left} />
      <div className="recipe-content">
        {/* <h3>{recipe.name}</h3> */}
        <div className="recipe-details">
          <p>Time: {adjustedTime.toFixed(2)} seconds</p>
          <div className="recipe-io">
            <div className="recipe-input">
              <h4>Input:1</h4>
            </div>
            <div className="recipe-output">
              <h4>Output:123</h4>
            </div>
          </div>
          <div className="recipe-machine">
            <label htmlFor="machine-select">Producer: </label>
            <select id="machine-select">
              <option key="1" value="1">
                1
              </option>
              <option key="2" value="2">
                2
              </option>
            </select>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default RecipeNode;
