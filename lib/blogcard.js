import { Cheerio } from "cheerio";
export const addBlogCard = async (ContentHtml) => {
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

  let cardDatas = [];
  const temps = await Promise.all(
    links.map(async (link) => {
      //fetchでurl先のhtmlデータを取得
      const metas = await fetch(link.url)
        .then((res) => res.text())
        .then((text) => {
          //各サイトのmetaタグの情報をすべてmetasの配列に
          const $ = cheerio.load(text);
          const metas = $("meta").toArray();
          const metaData = {
            url: link.url,
            title: "",
            description: "",
            image: "",
          };
          //各サイトのmeta情報で、title,description,imageのurlだけ取り出す
          for (let i = 0; i < metas.length; i++) {
            if (metas[i].attribs?.property === "og:title")
              metaData.title = metas[i].attribs.content;
            if (metas[i].attribs?.property === "og:description")
              metaData.description = metas[i].attribs.content;
            if (metas[i].attribs?.property === "og:image")
              metaData.image = metas[i].attribs.content;
          }
          return metaData;
        })
        .catch((e) => {
          console.log(e);
        });
      return metas;
    })
  );
  //外部に情報を渡せるようにjson形式に整形
  cardDatas = temps.filter((temp) => temp !== undefined);
  return {
    props: {
      content,
      cardDatas,
    },
  };
};
