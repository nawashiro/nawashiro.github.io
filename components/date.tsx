import cx from "classnames";

type DateProps = {
  dateString: string;
  kind: "published" | "updated";
};

export default function Date({ dateString, kind }: DateProps) {
  // Display the author's calendar date, independent of the server timezone.
  const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);
  return (
    <time dateTime={dateString} className={cx(`dt-${kind}`, kind)}>
      {`${year}年${month}月${day}日`}
    </time>
  );
}
