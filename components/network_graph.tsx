import { useEffect, useMemo, useRef } from "react";
import { Network } from "vis-network";
import type { NetworkData } from "../lib/posts";

type NetworkGraphProps = {
  networkData: NetworkData;
  height: string;
};

export default function NetworkGraph({ networkData, height }: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const networkRef = useRef<Network | null>(null);

  const options = useMemo(
    () => ({
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
    }),
    []
  );

  useEffect(() => {
    if (!containerRef.current) return;

    if (!networkRef.current) {
      networkRef.current = new Network(containerRef.current, networkData, options);
    } else {
      networkRef.current.setData(networkData);
    }

    const network = networkRef.current;
    const onDoubleClick = (params: { nodes: string[] }) => {
      if (params.nodes.length === 0) return;
      window.open(`/posts/${params.nodes[0]}`, "_blank");
    };

    network.on("doubleClick", onDoubleClick);
    return () => {
      network.off("doubleClick", onDoubleClick);
    };
  }, [networkData, options]);

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
        ref={containerRef}
      />
    </div>
  );
}
