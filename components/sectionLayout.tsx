import { ReactNode } from "react";

export default function SectionLayout({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className={`w-dvw md:w-full md:mx-auto max-w-3xl px-4 pb-5 pt-5`}>
        {children}
      </div>
    </div>
  );
}
