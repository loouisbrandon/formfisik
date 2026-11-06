'use client'
import {createContext,useContext,useEffect,useState,type Dispatch,type SetStateAction,type ReactNode} from 'react'
const Memory=createContext<Map<string,unknown>|null>(null)
/** Private, bounded React memory. Destroyed with the authenticated shell; never Web Storage. */
export function NavigationMemory({children}:{children:ReactNode}){const [cache]=useState(()=>new Map<string,unknown>());return <Memory.Provider value={cache}>{children}</Memory.Provider>}
export function useNavigationState<T>(key:string,initial:T|(()=>T)):[T,Dispatch<SetStateAction<T>>]{const cache=useContext(Memory),[value,setValue]=useState<T>(()=>cache?.has(key)?cache.get(key) as T:typeof initial==='function'?(initial as ()=>T)():initial);useEffect(()=>{if(!cache)return;if(cache.size>=40&&!cache.has(key))cache.delete(cache.keys().next().value!);cache.set(key,value)},[cache,key,value]);return [value,setValue]}
export function listChanged(){window.dispatchEvent(new Event('formfisik:list-change'))}
