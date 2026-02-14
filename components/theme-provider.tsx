'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Use NoSSR component to prevent hydration mismatch
  const NoSSR = ({ children }: { children: React.ReactNode }) => {
    const [isClient, setIsClient] = React.useState(false)
    
    React.useEffect(() => {
      setIsClient(true)
    }, [])

    if (!isClient) {
      return null
    }

    return <>{children}</>
  }

  return (
    <NextThemesProvider {...props}>
      <NoSSR>{children}</NoSSR>
    </NextThemesProvider>
  )
}
