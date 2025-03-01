import Layout from "../../components/layout";
import {
  getAllPostIds,
  getPostData,
  getNeighborNetworkData,
} from "../../lib/posts";
import Head from "next/head";
import Date from "../../components/date";
import utilStyles from "../../styles/utils.module.css";
import cx from "classnames";
import Link from "next/link";
import styles from "./[id].module.css";
import { useEffect, useState } from "react";
import NetworkGraph from "../../components/network_graph";

export async function getStaticProps({ params }) {
  // Add the "await" keyword like this:
  const id = params.id;
  const postData = await getPostData(id);
  const neighborNetwork = getNeighborNetworkData(id);

  return {
    props: {
      id,
      postData,
      neighborNetwork,
    },
  };
}

export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}

export default function Post({ id, postData, neighborNetwork }) {
  const [comment, setComment] = useState("");
  const [commentState, setCommentState] = useState("submitButton");
  const [currentUrl, setCurrentUrl] = useState("");
  const [inputServer, setInputServer] = useState("");

  useEffect(() => {
    setCurrentUrl(encodeURIComponent(window.location.href));
    setComment("");
    setCommentState("submitButton");
  }, [id]);

  const submit = () => {
    if (comment.length > 0) {
      setCommentState("selectSNS");
    }
  };

  const mastodonOrMisskey = () => {
    setCommentState("inputServer");
  };

  const toMastodonOrMisskey = () => {
    const url = `https://${inputServer}/share?text=${encodeURIComponent(
      `@nawashiro@gamelinks007.net ${comment}`
    )}&url=${currentUrl}`;

    window.open(url, "_blank");
  };

  const toBluesky = () => {
    const url = `https://bsky.app/intent/compose?text=${encodeURIComponent(
      `@nawashiro.dev ${comment} `
    )}${currentUrl}`;

    window.open(url, "_blank");
  };

  const toX = () => {
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(
      `@yineleyici ${comment}`
    )}&url=${currentUrl}`;

    window.open(url, "_blank");
  };

  return (
    <Layout title={postData.title} blog>
      <Head>
        <title>{postData.title}</title>
        <link rel="webmention" href="https://webmention.io/nawashiro.dev/webmention" />
      </Head>
      <article>
        <h1>{postData.title}</h1>
        <div className={cx(utilStyles.lightBlogText, utilStyles.lightText)}>
          <Date dateString={postData.date} />
        </div>
        <div
          className={"blog"}
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />
        {postData.backLinks.length > 0 && (
          <>
            <h2>Back Link</h2>
            <ul>
              {postData.backLinks.map(({ id, title }) => (
                <li key={id}>
                  <Link href={id}>{title}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className={styles.networkGraph}>
          <h2>Neighbor Graph</h2>
          <NetworkGraph height={"300px"} networkData={neighborNetwork} />
        </div>
        <div className={styles.comment}>
          <h2>Comments</h2>
          <form>
            <textarea
              name="comments"
              value={comment}
              placeholder="こうしたほうがいいんじゃないかな"
              onChange={(event) => setComment(event.target.value)}
            />
            <div>
              {commentState == "submitButton" && (
                <>
                  <input
                    type="button"
                    value="Submit"
                    disabled={!comment}
                    onClick={submit}
                    className={styles.button}
                  />
                </>
              )}
              {commentState == "selectSNS" && (
                <>
                  <input
                    type="button"
                    value="Mastodon or Misskey"
                    onClick={mastodonOrMisskey}
                    className={styles.chooseSNSButton}
                  />
                  <input
                    type="button"
                    value="Bluesky"
                    onClick={toBluesky}
                    className={styles.chooseSNSButton}
                  />
                  <input
                    type="button"
                    value="X"
                    onClick={toX}
                    className={styles.chooseSNSButton}
                  />
                </>
              )}
              {commentState == "inputServer" && (
                <>
                  <label for="servername">Your Server:</label>
                  <input
                    type="text"
                    id="servername"
                    value={inputServer}
                    placeholder="example.com"
                    className={styles.inputServerField}
                    onChange={(event) => setInputServer(event.target.value)}
                  />
                  <input
                    type="button"
                    value="OK"
                    disabled={!inputServer}
                    onClick={toMastodonOrMisskey}
                    className={styles.button}
                  />
                  <input
                    type="button"
                    value="Back"
                    onClick={() => {
                      setCommentState("selectSNS");
                    }}
                    className={styles.button}
                  />
                </>
              )}
            </div>
          </form>
        </div>
      </article>
    </Layout>
  );
}
