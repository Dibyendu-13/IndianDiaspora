import 'dotenv/config';
import {MongoClient} from 'mongodb';
let connection;
export async function database(){
 if(!process.env.MONGODB_URL)throw new Error('Database is not configured');
 if(!connection){const client=new MongoClient(process.env.MONGODB_URL,{serverSelectionTimeoutMS:8000});connection=client.connect().then(async()=>{const db=client.db(process.env.MONGODB_DATABASE||'indian_diaspora');await db.collection('community_voices').createIndex({expiresAt:1},{expireAfterSeconds:0});return db}).catch(e=>{connection=null;throw e})}
 return connection;
}
const kinds=['Kindness & belonging','Discrimination & racism','Anti-Hindu hate','A mixed experience','Something else'];
export function validate(input){
 if(!input||typeof input!=='object')throw new Error('Invalid submission');
 const text=(key,min,max)=>{if(typeof input[key]!=='string'||input[key].trim().length<min||input[key].trim().length>max)throw new Error(`Invalid ${key}`);return input[key].trim()};
 const doc={_id:text('submissionId',36,36),city:text('city',1,100),country:text('country',1,100),experience:text('experience',1,60),entry:text('entry',20,12000),publicationPreference:input.publicationPreference,consentVersion:'2026-10-24-v1'};
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(doc._id)||!kinds.includes(doc.experience)||!['private','anonymous'].includes(doc.publicationPreference)||input.consent!==true)throw new Error('Invalid consent or submission details');
 if(input.audio){const {base64,mimeType}=input.audio;if(typeof base64!=='string'||!base64.length||base64.length%4||!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)||!['audio/webm','audio/ogg','audio/mp4','audio/wav'].includes(mimeType?.split(';')[0]))throw new Error('Invalid recording');const data=Buffer.from(base64,'base64');if(data.length>8*1024*1024)throw new Error('Recording exceeds 8 MB. Please make a shorter recording.');doc.audio={data,mimeType}}
 const now=new Date();return {...doc,status:'pending_review',verified:false,recordingPublicationAllowed:false,createdAt:now,expiresAt:new Date(now.getTime()+30*86400000)};
}
export function createHandler(getDatabase=database){return async(req,res,next)=>{
 const path=req.url?.split('?')[0];if(path!=='/api/submissions'){if(path?.startsWith('/api/')){res.writeHead(404,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Not found'}));return}return next?.()}
 const reply=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body))};
 if(req.method!=='POST')return reply(405,{error:'Only POST is supported'});
 if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host)return reply(403,{error:'Cross-origin submissions are not allowed'})}catch{return reply(403,{error:'Invalid origin'})}}
 if(!req.headers['content-type']?.startsWith('application/json'))return reply(415,{error:'Expected JSON'});
 let raw='';try{let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>12*1024*1024)return reply(413,{error:'Submission too large. Keep recordings below 8 MB.'});raw+=chunk} }catch{return reply(400,{error:'Upload interrupted. Please retry.'})}
 let doc;try{doc=validate(JSON.parse(raw))}catch(e){return reply(400,{error:e instanceof SyntaxError?'Invalid JSON':e.message})}
 try{const db=await getDatabase();await db.collection('community_voices').insertOne(doc);return reply(201,{receipt:doc._id,status:doc.status,expiresAt:doc.expiresAt})}catch(e){if(e.code===11000)return reply(200,{receipt:doc._id,status:'pending_review'});return reply(503,{error:'Your story could not be saved. Your draft is still here. Please retry shortly.'})}
}}
export const submissionsHandler=createHandler();
