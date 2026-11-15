'use client'
import {permissionChoices,type CoachPermission} from './permissions-schema'
import styles from './chat.module.css'
export function PermissionControls({value,onChange}:{value:CoachPermission;onChange:(value:CoachPermission)=>void}){return <fieldset className={styles.permissionOptions}><legend>Permissões do eCoach</legend>{permissionChoices.map(choice=><label key={choice.value} data-selected={value===choice.value}><input type="radio" name="ecoach-permission" value={choice.value} checked={value===choice.value} onChange={()=>onChange(choice.value)}/><span><strong>{choice.title}</strong><small>{choice.description}</small></span></label>)}</fieldset>}
