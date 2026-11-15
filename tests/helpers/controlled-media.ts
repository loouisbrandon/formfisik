// Test-only provider, never imported by product.
import {randomBytes} from 'node:crypto'
import type {VideoProvider,RemoteVideo} from '../../src/server/media/provider'
export class ControlledVideo implements VideoProvider{
 videos=new Map<string,RemoteVideo>();calls=0;fail=false;failRemove=false;private async check(){if(this.fail)throw Error('controlled_network_failure')}
 async reserve(){await this.check();this.calls++;const id=randomBytes(16).toString('hex');this.videos.set(id,{id,ready:false,failed:false,seconds:20,bytes:1024,private:true});return {id,url:'https://upload.videodelivery.net/'+id,expiresAt:new Date(Date.now()+900000).toISOString()}}
 async inspect(id:string){await this.check();const v=this.videos.get(id);if(!v)throw Error('controlled_missing');return v}
 async play(id:string){await this.check();if(!this.videos.get(id)?.ready)throw Error('controlled_not_ready');return {url:'https://customer-controlled.cloudflarestream.com/'+id+'/iframe',expiresAt:new Date(Date.now()+300000).toISOString()}}
 async remove(id:string){await this.check();if(this.failRemove)throw Error('controlled_delete_failure');this.videos.delete(id)}
}
