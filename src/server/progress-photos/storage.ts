import 'server-only'
import {S3Client,PutObjectCommand,GetObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3'
export interface PrivatePhotoStore {put(key:string,bytes:Buffer):Promise<void>;get(key:string):Promise<Buffer>;remove(key:string):Promise<void>}
export class PhotoStorageUnavailable extends Error {constructor(){super('Armazenamento privado indisponível. Esta operação não foi confirmada.')}}
export class R2PhotoStore implements PrivatePhotoStore {
 constructor(private client:S3Client,private bucket:string){}
 async put(key:string,bytes:Buffer){await this.client.send(new PutObjectCommand({Bucket:this.bucket,Key:key,Body:bytes,ContentType:'image/jpeg',CacheControl:'private, no-store'}),{abortSignal:AbortSignal.timeout(20000)})}
 async get(key:string){const r=await this.client.send(new GetObjectCommand({Bucket:this.bucket,Key:key}),{abortSignal:AbortSignal.timeout(20000)});if(!r.Body||(r.ContentLength??0)>3145728)throw new PhotoStorageUnavailable();const chunks:Buffer[]=[];let size=0;for await(const chunk of r.Body as AsyncIterable<Uint8Array>){size+=chunk.length;if(size>3145728)throw new PhotoStorageUnavailable();chunks.push(Buffer.from(chunk))}return Buffer.concat(chunks)}
 async remove(key:string){await this.client.send(new DeleteObjectCommand({Bucket:this.bucket,Key:key}),{abortSignal:AbortSignal.timeout(20000)})}
}
export function r2PhotoStore():PrivatePhotoStore|null{
 const account=process.env.R2_ACCOUNT_ID,bucket=process.env.R2_PHOTOS_BUCKET,accessKeyId=process.env.R2_ACCESS_KEY_ID,secretAccessKey=process.env.R2_SECRET_ACCESS_KEY
 if(!account||!bucket||!accessKeyId||!secretAccessKey||!/^[a-f\d]{32}$/i.test(account)||!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket))return null
 return new R2PhotoStore(new S3Client({region:'auto',endpoint:`https://${account}.r2.cloudflarestorage.com`,credentials:{accessKeyId,secretAccessKey},forcePathStyle:true,maxAttempts:2,requestChecksumCalculation:'WHEN_REQUIRED',responseChecksumValidation:'WHEN_REQUIRED'}),bucket)
}
