<%*

async function publishLink(){
	const url = encodeURIComponent(`https://nawashiro.dev/posts/${tp.file.title}`);
	const sendUrl = `https://webmention.app/check?url=${url}`;
	return `\n[Webmention.app](${sendUrl})\n`;
}
return publishLink();
%>