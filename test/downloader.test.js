const path=require('path');
const assert=require('assert');
const {download}=require('../lib/downloader');

describe('downloader tester',function(done){

    const tempPath=path.join(__dirname,"../temp");


    it('#download() jpg',function(){
        this.timeout(50000);
        let accumulated=0;
        const callback=(chunck,total)=>{
            accumulated+=Buffer.from(chunck).length;
            const percentage=Number(accumulated/total*100).toFixed(2);
            console.log(`percentage: ${percentage} %`);
        };
        let url="https://www.baidu.com/img/bd_logo1.png";
        return download(url,tempPath,callback);
    });

    it('#download() large file timeout ',function(){
        this.timeout(50000);
        let accumulated=0;
        const callback=(chunck,total)=>{
            accumulated+=Buffer.from(chunck).length;
            const percentage=Number(accumulated/total*100).toFixed(2);
            console.log(`percentage: ${percentage} %`);
        };
        let url="https://ftp.nluug.nl/pub/vim/pc/gvim80-586.exe";
        return download(url,tempPath,callback,{timeout:1*1000});
    });
});