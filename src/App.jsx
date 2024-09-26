import { useState } from "react";
import { NextUIProvider } from "@nextui-org/react";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import "./App.css";

export default function App() {
  const [selectedFactory, setselectedFactory] = useState("oil");
  const [factories, setFactories] = useState(["oil", "tech", "test"]);

  return (
    <NextUIProvider>
      <div className="flex h-[100vh]">
        <Sidebar className="w-64" factories={factories} onSelectFactory={setselectedFactory} />
        <MainContent className="flex-1" selectedFactory={selectedFactory} />
      </div>
    </NextUIProvider>
  );
}
