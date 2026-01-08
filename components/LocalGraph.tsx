import type { NetworkData } from "../lib/posts";
import Graphviz from "graphviz-react";

type NetworkGraphProps = {
  networkData: NetworkData;
  height: string;
};

export default function NetworkGraph({
  networkData,
}: NetworkGraphProps) {

  let dot = "diagraph site{";

  networkData.nodes.map((node) => {
    dot += `"${node.id}"[URL="${process.env.NEXT_PUBLIC_SITE_URL}/posts/${node.id}",tooltip="${node.label}"];`
  })

  networkData.edges.map((edge) => {
    dot += `"${edge.from}"->"${edge.to}";`
  })

  dot += "}"
  return (
    <div>
      {/* Network図を表示する領域 */}
      <Graphviz
        dot={"graph{a--b}"}
        className="rounded-xl bg-white border-2 border-base-200"
      />
    </div>
  );
}
