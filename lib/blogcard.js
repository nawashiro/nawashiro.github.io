import { Cheerio } from "cheerio";
export function addBlogCard(ContentHtml) {
  const $ = Cheerio.load(ContentHtml);
  const links = $(a)
    .toArray()
    .map((data) => {
      const url =
        data.attribs.href.indexof("http") === -1
          ? `${process.env.NEXT_PUBLIC_DOMEIN}${data.attribs.href}`
          : data.attribs.href;
      return { url: url };
    });
}
