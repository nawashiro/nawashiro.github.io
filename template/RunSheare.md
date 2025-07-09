<%*
async function share(){
	const bskyFormData = new FormData();
	const url = `https://nawashiro.dev/posts/${tp.file.title}`;

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
		
		return `---\n\nここまで読んでくれてありがとう。よければフィードバックをください。 [Bluesky](${await bskyResponse.json().url}) や [Mastodon](${await mstdnResponse.json().url}) から返信するとウェブサイト内にも反映されます。)`;
	} catch (e) {
		return `fail: ${e}`;
	}
}
return share();
%>