import type {PrivatePhotoStore} from '../../src/server/progress-photos/storage'
export class ControlledPhotoStore implements PrivatePhotoStore {
 objects=new Map<string,Buffer>();writes=0;reads=0;deletes=0;failPut=false;writeThenFail=false;failRemove=false;afterPut?:(key:string)=>Promise<void>;afterGet?:(key:string)=>Promise<void>
 async put(key:string,bytes:Buffer){this.writes++;if(this.failPut)throw Error('controlled write failure');this.objects.set(key,Buffer.from(bytes));await this.afterPut?.(key);if(this.writeThenFail)throw Error('controlled uncertain response')}
 async get(key:string){this.reads++;const bytes=this.objects.get(key);if(!bytes)throw Error('controlled missing object');const copy=Buffer.from(bytes);await this.afterGet?.(key);return copy}
 async remove(key:string){this.deletes++;if(this.failRemove)throw Error('controlled cleanup failure');this.objects.delete(key)}
}
