'use client'

import { useEffect } from 'react'

export default function AdminBodyClass({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add('emaro-admin')
    return () => document.body.classList.remove('emaro-admin')
  }, [])
  return children ? <>{children}</> : null
}
