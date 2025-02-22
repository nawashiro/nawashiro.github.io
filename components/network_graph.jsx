import { useEffect, useRef } from "react";
import { Network } from "vis-network";

export default function NetworkGraph({ networkData, height }) {
  const ref = useRef(null);

  let network;

  let options = {
    nodes: {
      shape: "dot",
      size: 8,
      color: {
        highlight: {
          background: "#005aff",
          border: "#005aff",
        },
      },
    },
    groups: {
      none: { color: { background: "#bfe4ff" } },
      index: { color: { background: "#ff4b00" } },
      book: { color: { background: "#03af7a" } },
      javascript: { color: { background: "#990099" } },
      sns: { color: { background: "#f6aa00" } },
      highlight: { color: { background: "#005aff" } },
    },
  };

  useEffect(() => {
    // Network が存在しない場合の処理
    if (!network && ref.current) {
      // Network Instance を作成して、DataをSetする => new Network(Dom領域, Data(Nodes & Edges), Options)
      network = new Network(ref.current, networkData, options);
    }
    network.on("doubleClick", (params) => {
      if (params.nodes.length > 0) {
        // クリックした Node のIDを取得する
        const nodeId = params.nodes[0];
        window.open(`/posts/${nodeId}`, "_blank");
      }
    });
  });

  return (
    <div>
      {/* Network図 を表示する領域 */}
      <div
        style={{
          height: height,
          width: "100%",
          borderRadius: "1.5rem",
          backgroundColor: "#FFFF",
        }}
        ref={ref}
      />
    </div>
  );
}
