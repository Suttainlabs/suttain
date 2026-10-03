export function downloadScript(file) {
  const url=URL.createObjectURL(new Blob([file.content],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=file.filename;
  document.body.appendChild(link);link.click();link.remove();setTimeout(() => URL.revokeObjectURL(url),1000);
}
export function downloadScriptBundle(result) {
  downloadScript({filename:`suttain_${result.engine}_inputs.txt`,content:result.files.map(file => `=== ${file.filename} ===\n${file.description || ''}\n\n${file.content}\n\n`).join('\n')});
}