'use client'

import { useId } from 'react'
import { Zap } from 'lucide-react'
import styles from './password-strength.module.css'

import { passwordStrength } from './password-strength-score'

export function PasswordStrength({ password }: { password: string }) {
  const id = useId()
  const { level, label, hint } = passwordStrength(password)
  return <div className={styles.meter}>
    <div className={styles.header}><span id={id}><Zap size={14} aria-hidden="true" /> Força estimada</span><strong>{level ? `NÍVEL ${level} / 4` : 'PRONTO PARA COMEÇAR'}</strong></div>
    <div role="meter" aria-labelledby={id} aria-valuemin={0} aria-valuemax={4} aria-valuenow={level} aria-valuetext={label} className={styles.track}>
      {[1, 2, 3, 4].map(n => <span key={n} className={`${styles.segment} ${n <= level ? styles.filled : ''}`} />)}
    </div>
    <div className={styles.caption}><strong>{label}</strong><span>{hint}</span></div>
  </div>
}
