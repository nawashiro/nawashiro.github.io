<%*
async function share(){
	const url = `https://nawashiro.dev/posts/${tp.file.title}`;

	const mstdnFormData = new FormData();
    const githubFormData = new FormData();
	
	mstdnFormData.append("source", url);
	mstdnFormData.append("target", "https://brid.gy/publish/mastodon");
	
	try {
		const webmentionUrl = "https://brid.gy/publish/webmention";
			
		const mstdnResponse = await fetch(webmentionUrl, {
			method: "POST",
			body: mstdnFormData,
		});
		
		const mstdnResult = await mstdnResponse.json();
		
		if(typeof mstdnResult.url === "undefined"){
			return `\nfail:\n${mstdnResult.error}`
		}
		
		return `\n---\n\n[Bluesky]() か [Fediverse](${mstdnResult.url}) から返信して会話に参加してください。`;
	} catch (e) {
		return `\nfail: ${e}`;
	}
}
return share();
%>