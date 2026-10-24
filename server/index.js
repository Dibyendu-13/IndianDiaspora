import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {submissionsHandler} from './submissions.js';
const root=path.resolve('dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
http.createServer((req,res)=>submissionsHandler(req,res,async()=>{if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}try{const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403);res.end();return}let data,file=target;try{data=await readFile(file)}catch{file=path.join(root,'index.html');data=await readFile(file)}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data)}catch{res.writeHead(500);res.end('Unable to serve page')}})).listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('App ready on 0.0.0.0:'+(process.env.PORT||3000)));
