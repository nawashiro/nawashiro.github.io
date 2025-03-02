import { parseISO, format } from "date-fns";
import cx from "classnames";

export default function Date({ dateString }) {
  const date = parseISO(dateString);
  return (
    <time dateTime={dateString} className={cx("dt-published", "published")}>
      {format(date, "yyyy-MM-dd")}
    </time>
  );
}
