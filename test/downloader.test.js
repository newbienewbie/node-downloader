const path=require('path');
const assert=require('assert');
const Downloader=require('../lib/downloader');

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
        const downloader=new Downloader();
        const saveAs=path.join(tempPath,"fuck.png");
        return downloader.download(url,callback,saveAs);
    });

    it('#download() large file timeout ',function(){
        this.timeout(900000);
        let accumulated=0;
        const callback=(chunck,total)=>{
            accumulated+=Buffer.from(chunck).length;
            const percentage=Number(accumulated/total*100).toFixed(2);
            console.log(`percentage: ${percentage} %`);
        };
        let url="https://ftp.nluug.nl/pub/vim/pc/gvim80-586.exe";
        const downloader=new Downloader({
            baseDir:tempPath,
            fetchOpts:{
                timeout:0.01*60*1000
            }
        });
        return downloader.download(url,callback);
    });

    it('#downloadGroup() large file timeout ',function(){
        this.timeout(900000);
        let accumulated=0;
        const callback=(chunck,total)=>{
            accumulated+=Buffer.from(chunck).length;
            const percentage=Number(accumulated/total*100).toFixed(2);
            console.log(`percentage: ${percentage} %`);
        };
        const downloader=new Downloader({
            baseDir:tempPath,
            fetchOpts:{
                timeout:60*60*1000
            }
        });
        const taskArray=[
            {url:'http://file.allitebooks.com/20170611/MCSA%2070-741%20Cert%20Guide.pdf',status:""},
            {url:'http://file.allitebooks.com/20170611/Winning%20Design!,%202nd%20Edition.pdf',status:""}
        ];
        return downloader.downloadGroup(
            taskArray,
            t=>{
                console.log(t);
            }
        );
    });

    

});