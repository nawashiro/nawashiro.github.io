import { useEffect, useMemo, useRef } from "react";
import { Network } from "vis-network";
import type { NetworkData } from "../lib/posts";

type NetworkGraphProps = {
  networkData: NetworkData;
  height: string;
};

const normalizeThemeColor = (value: string, fallback: string) => {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (trimmed.includes("(") || trimmed.startsWith("#")) return trimmed;
  return `oklch(${trimmed})`;
};

export const openNetworkPost = (
  postId: string,
  openWindow?: (url: string, target?: string, features?: string) => Window | null
) => {
  const openFn =
    openWindow ?? (typeof window === "undefined" ? null : window.open);
  if (!openFn) return false;
  const opened = openFn(`/posts/${postId}`, "_blank", "noopener,noreferrer");
  if (opened) {
    opened.opener = null;
  }
  return true;
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
      return normalizeThemeColor(value, fallback);
    };

    const info = getThemeColor("--color-info", "#005aff");
    const primary = getThemeColor("--color-primary", "#48731d");
    const secondary = getThemeColor("--color-secondary", "#cbbba0");
    const accent = getThemeColor("--color-accent", "#4a6f8a");
    const warning = getThemeColor("--color-warning", "#d59a2f");
    const base = getThemeColor("--color-base-200", "#f5efe7");

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
      openNetworkPost(params.nodes[0]);
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
