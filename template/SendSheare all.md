<%*
async function share(){
	const url = `https://nawashiro.dev/posts/${tp.file.title}`;

	const bskyFormData = new FormData();
	const mstdnFormData = new FormData();
    const githubFormData = new FormData();
	
	bskyFormData.append("source", url);
	bskyFormData.append("target",　"https://brid.gy/publish/bluesky");

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
		
		return `\n---\n\n[Bluesky](${bskyResult.url}) か [Fediverse](${mstdnResult.url}) から返信して会話に参加してください。`;
	} catch (e) {
		return `\nfail: ${e}`;
	}
}
return share();
%>