<%*
async function publishLink(){
	const url = encodeURIComponent(`https://nawashiro.dev/posts/${tp.file.title}`);
	const sendUrl = `https://telegraph.p3k.io/dashboard/send?url=${url}`;
	return `\n[Telegraph](${sendUrl})\n`;
}
return publishLink();
%>