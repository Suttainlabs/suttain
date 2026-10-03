import createTarArchive from '@/components/computational/createTarArchive';
export function downloadScript(file) {
  const url=URL.createObjectURL(new Blob([file.content],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=file.filename;
  document.body.appendChild(link);link.click();link.remove();setTimeout(() => URL.revokeObjectURL(url),1000);
}
export function downloadScriptBundle(result) {
  const url=URL.createObjectURL(createTarArchive(result.files));
  const link=document.createElement('a');link.href=url;link.download=`suttain_${result.engine.replace(/[^a-zA-Z0-9_-]/g,'_')}_inputs.tar`;
  document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}