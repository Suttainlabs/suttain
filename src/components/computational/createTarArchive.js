export default function createTarArchive(files) {
  const encoder=new TextEncoder(),chunks=[];
  for(const file of files) {
    const data=encoder.encode(file.content),header=new Uint8Array(512);
    const put=(offset,length,text)=>header.set(encoder.encode(text).slice(0,length),offset);
    const oct=(value,length)=>value.toString(8).padStart(length-1,'0')+'\0';
    put(0,100,file.filename.replace(/[^a-zA-Z0-9_.-]/g,'_'));
    put(100,8,oct(file.filename.endsWith('.sh')?493:420,8));put(108,8,oct(0,8));put(116,8,oct(0,8));
    put(124,12,oct(data.length,12));put(136,12,oct(Math.floor(Date.now()/1000),12));
    header.fill(32,148,156);put(156,1,'0');put(257,6,'ustar\0');put(263,2,'00');
    const checksum=header.reduce((sum,byte)=>sum+byte,0);put(148,8,checksum.toString(8).padStart(6,'0')+'\0 ');
    chunks.push(header,data,new Uint8Array((512-data.length%512)%512));
  }
  chunks.push(new Uint8Array(1024));return new Blob(chunks,{type:'application/x-tar'});
}