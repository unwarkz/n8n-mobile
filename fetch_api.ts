async function main() {
  const res = await fetch('https://docs.n8n.io/api/authentication/');
  const text = await res.text();
  const mainContent = text.split('<main')[1].split('</main>')[0];
  console.log(mainContent.replace(/<[^>]*>?/gm, ''));
}
main();
