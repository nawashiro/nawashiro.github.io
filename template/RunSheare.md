<%*
async function share(){
	const url = `https://nawashiro.dev/posts/${tp.file.title}`;

	const bskyFormData = new FormData();
	const mstdnFormData = new FormData();
	
	bskyFormData.append("source", url);
	bskyFormData.append("target", "https://brid.gy/publish/bluesky");

	mstdnFormData.append("source", url);
	mstdnFormData.append("target", "https://brid.gy/publish/mastodon");
	
	try {
		const webmentionUrl = "https://brid.gy/publish/webmention";

		const bskyResponse = await fetch(webmentionUrl, {
			method: "POST",
			body: bskyFormData,
		});
		
		const mstdnResponse = await fetch(webmentionUrl, {
			method: "POST",
			body: mstdnFormData,
		});
		
		const bskyResult = await bskyResponse.json();
		const mstdnResult = await mstdnResponse.json();
		
		if(typeof bskyResult.url === "undefined" || typeof mstdnResult.url === "undefined"){
			return `\nfail:\n${bskyResult.error}\n${mstdnResult.error}`
		}
		
		return `\n---\n\nここまで読んでくれてありがとう。よければでいいのだが、フィードバックがほしい。 [Bluesky](${bskyResult.url}) や [Mastodon](${mstdnResult.url}) から返信するとウェブサイト内にも反映される。健闘を祈る。`;
	} catch (e) {
		return `\nfail: ${e}`;
	}
}
return share();
%>