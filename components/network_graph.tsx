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

  const options = useMemo(() => {
    const getThemeColor = (token: string, fallback: string) => {
      if (typeof window === "undefined") return fallback;
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(token)
        .trim();
      return value ? `hsl(${value})` : fallback;
    };

    const info = getThemeColor("--in", "#005aff");
    const primary = getThemeColor("--p", "#48731d");
    const secondary = getThemeColor("--s", "#cbbba0");
    const accent = getThemeColor("--a", "#4a6f8a");
    const warning = getThemeColor("--wa", "#d59a2f");
    const base = getThemeColor("--b2", "#f5efe7");

    return {
      nodes: {
        shape: "dot",
        size: 8,
        color: {
          highlight: {
            background: info,
            border: info,
          },
        },
      },
      groups: {
        none: { color: { background: base } },
        index: { color: { background: primary } },
        book: { color: { background: secondary } },
        javascript: { color: { background: accent } },
        sns: { color: { background: warning } },
        highlight: { color: { background: info } },
      },
    };
  }, []);

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

  useEffect(() => {
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      {/* Network図 を表示する領域 */}
      <div
        className="rounded-box bg-base-100 shadow-soft"
        style={{
          height: height,
          width: "100%",
        }}
        ref={containerRef}
      />
    </div>
  );
}
