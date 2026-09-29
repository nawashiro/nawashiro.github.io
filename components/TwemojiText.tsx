/** @jsxImportSource react */
import { Fragment } from "react";
import { emojiParts } from "../lib/twemoji";

export default function TwemojiText({ text }: { text: string }) {
  return <>{emojiParts(text).map(({ text: part, src }, index) =>
    src ? <img key={index} className="twemoji" draggable={false} alt={part} src={src} />
      : <Fragment key={index}>{part}</Fragment>,
  )}</>;
}
