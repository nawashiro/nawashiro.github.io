<%*
  const slide = [0,2,4,6,8,10];
  s = tp.file.content;
  p = s.split("\n")
        .filter(x => x.match(/^#+\s/))
        .map(x => {
            d = x.split(" ")[0].length;
            s = x.substr(d+1)
            link = "[" + s + "](#" + encodeURIComponent(s) +")";
            return " ".repeat(slide[d-2]) + "- " + link;
        }).join("  \n");
  return "\n" + p + "\n";
%>