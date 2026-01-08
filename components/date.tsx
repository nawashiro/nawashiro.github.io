import { format, parseISO } from "date-fns";
import cx from "classnames";

type DateProps = {
  dateString: string;
};

export default function Date({ dateString }: DateProps) {
  const date = parseISO(dateString);
  return (
    <time dateTime={dateString} className={cx("dt-published", "published")}>
      {format(date, "yyyy年M月d日")}
    </time>
  );
}
