// Menyusun hasil build satu berkas menjadi fragmen HTML untuk halaman Artifact.
// Artifact membungkus halaman dengan kerangka dokumen sendiri, jadi keluarannya tanpa doctype, html, head, atau body.
import { readFileSync, writeFileSync } from 'node:fs'

const css = readFileSync('dist-artifact/app.css', 'utf8')
const js = readFileSync('dist-artifact/app.js', 'utf8').replace(/<\/script/gi, '<\\/script')

const html = `<title>Sewa Alat Berat</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`

writeFileSync('dist-artifact/artifact.html', html)
console.log('artifact.html', Math.round(html.length / 1024), 'KB')
