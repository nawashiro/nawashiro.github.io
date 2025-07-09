<%*
async function share(){
	const formData = new FormData();
	formData.append("source", `https://nawashiro.dev/posts/${tp.file.title}`);
	formData.append("target", "https://brid.gy/publish/bluesky");
	formData.append("target", "https://brid.gy/publish/mastodon");
	try {
		const response = await fetch("https://brid.gy/publish/webmention", {
			method: "POST",
			body: formData,
		});
		return `${JSON.stringify(await response.json())}`;
	} catch (e) {
		return `fail: ${e}`;
	}
}
return share();
%>