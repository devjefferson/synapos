import { clsx } from 'clsx'

type ContainerProps = { children: React.ReactNode; size?: 'md' | 'lg'; className?: string }

export function Container({ children, size = 'lg', className }: ContainerProps) {
  return (
    <div className={clsx('mx-auto w-full px-gutter', size === 'lg' ? 'max-w-6xl' : 'max-w-3xl', className)}>
      {children}
    </div>
  )
}
