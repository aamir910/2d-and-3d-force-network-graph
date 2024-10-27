import React, { useState } from "react";
import { Button, Layout, Space } from "antd";
import "antd/dist/reset.css";
import "./App.css";
import Lattice_2d from "./Graphs/ForceGraph2D";
import Lattice_3d from "./Graphs/ForceGraph3D";

const { Header, Content } = Layout;

function App() {
  const [view, setView] = useState("3D");

  return (
    <Layout className="layout">
      <Header>
        <div className="navbar">
          <h2 style={{ color: "white" }}>Concept Lattice Visualization</h2>
          <Space>
            <Button
              type={view === "2D" ? "primary" : "default"}
              onClick={() => setView("2D")}
            >
              2D Visualization
            </Button>
            <Button
              type={view === "3D" ? "primary" : "default"}
              onClick={() => setView("3D")}
            >
              3D Visualization
            </Button>
          </Space>
        </div>
      </Header>

      <Content style={{ padding: "20px", minHeight: "80vh" }}>
        <div className="graph-container">
          {view === "3D" ? <Lattice_3d /> : <Lattice_2d />}
        </div>
      </Content>
    </Layout>
  );
}

export default App;
