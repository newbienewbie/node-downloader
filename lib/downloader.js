const fs=require('fs');
const url=require('url');
const path=require('path');
const EventEmitter =require('events');
const fetch=require('node-fetch');

function _prommisePipeStream(readableStream,filename,onstep,totalLength=null){
    return new Promise(function(resolve,rejct){
        var dest=fs.createWriteStream(filename);
        readableStream.on('data',function(chunk){
            onstep(chunk,totalLength);
        });
        readableStream.on('end',function(){
            resolve(filename);
        });
        readableStream.pipe(dest);
    });
}

function download(urlString,dir,onstep=(chunk,totalLength=null)=>{},opts={}){
    
    let _opts={
        headers:{
            'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:53.0) Gecko/20100101 Firefox/53.0',
        }, 
    }; 

    _opts=Object.assign({},_opts,opts);
    return fetch(urlString,opts)
        .then(resp=>{
            const totalLength=resp.headers.get('content-length');
            const urlPath=url.parse(urlString).path;
            const paths=urlPath.split('/');
            let filename=paths[paths.length-1];
            filename=path.join(dir,filename);
            return _prommisePipeStream(resp.body,filename,onstep,totalLength);
        });
}



module.exports={download};