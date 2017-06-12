const fs=require('fs');
const url=require('url');
const path=require('path');
const EventEmitter =require('events');
const fetch=require('node-fetch');
const promiseWait=require('./promise-wait');



/**
 * 文件下载器
 */
class Downloader extends EventEmitter{

    constructor(config){
        super(config);

        // 默认的配置
        const _config= {
            fetchOpts:{
                headers:{
                    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:53.0) Gecko/20100101 Firefox/53.0',
                }, 
                timeout:1*60*1000,  
                follow:20, // 最多20次follow   
            },
            baseDir:__dirname,
        };
        this.config=Object.assign({},_config,config);
    }

    /**
     * 将readableStream 以promise的方式 pipe 到本地文件中
     * @param {ReadableStream} readableStream 
     * @param {String} filename 
     * @param {Function} onstep 
     * @param {Number} totalLength 
     */
    _promisePipeStream(readableStream,filename,onstep,totalLength=null){
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

    _guessSaveAsFileNameFromUrl(urlString){
        const urlPath=url.parse(urlString).path;
        const paths=urlPath.split('/');
        let filename=paths[paths.length-1];
        filename=path.join(this.config.baseDir,filename);
        return filename;
    }

    /**
     * 下载单个附件
     * @param {String} urlString 
     * @param {String} dir 
     * @param {function} onstep 
     * @param {Object} opts 
     */
    download(urlString,onstep=(chunk,totalLength=null)=>{},saveAs=null,opts={}){
            
        let _opts=Object.assign({},this.config.fetchOpts,opts);
        const d=fetch(urlString,_opts)
            .then(resp=>{
                const totalLength=resp.headers.get('content-length');
                let filename=saveAs?saveAs:this._guessSaveAsFileNameFromUrl(urlString);
                return this._promisePipeStream(resp.body,filename,onstep,totalLength);
            });
        const t=promiseWait(_opts.timeout,{status:'failed',msg:`download timeout exceeds ${_opts.timeout}`});

        return Promise.race([t,d])
            .then(
                f=>{
                    if(!f){
                        return Promise.reject( `unknown error`);
                    }
                    else if(f.status && f.status=="failed" ){
                        return Promise.reject(f);
                    }
                    else {
                        console.log(`********文件下载完成 ${f}`);
                        return f;
                    }
                },
                reason=>{
                    return Promise.reject(reason);
                }
            );
    }


    /**
     * 
     * @param {Array} arrayOfTask
     * @param {*} onTaskDone 
     */
    downloadGroup(arrayOfTask,onTaskSucceeded=t=>{},onTaskFailed=t=>{}){

        // 任务编组
        const map=new Map();
        const interval=setInterval(function(){
            console.log(`******************当前任务编组：`);
            for(let [k,v] of map){
                console.log(`<${k}>:\t${v}`);
            }
            console.log(`******************\r\n`);
        },1000*5);
        return Promise.all( arrayOfTask.map(t=>{
            map.set(t.url,"")
            console.log(`[+] 开始下载文件 ${t.url}\t....`);
            if(t.url=="#" || !t.url){
                t.status="shit";
                return onTaskFailed(t);
            }
            let accumulated=0;
            let totalSize=0;
            return this.download(t.url,function(chunk,_totalSize){
                totalSize=_totalSize;
                const chunkSize=Buffer.from(chunk).length;
                accumulated+=chunkSize;
                let percentage=``;
                if(totalSize && totalSize !=0){
                    percentage=`${Number(accumulated/totalSize*100).toFixed(2)}% of ${Number(totalSize/1024).toFixed(2)} KB`;  // 百分比形式
                }else{
                    let _accumulated=Number(accumulated/1024).toFixed(2);
                    percentage=`${_accumulated}KB/未知大小`;
                }
                map.set(t.url,percentage);
            })
            .then(
                filename=>{ t.saveAs=filename; return onTaskSucceeded(t); },
                reason=>{ console.log(reason); }
            );
        }) )
        .then(_=>{
            clearInterval(interval);
        });
    
    }
    
    /**
     * 
     */
    downloadMultiple(){

    }
}




module.exports=Downloader;