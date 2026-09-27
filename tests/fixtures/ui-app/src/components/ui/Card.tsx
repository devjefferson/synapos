import { clsx } from 'clsx'

type CardProps = { children: React.ReactNode; title?: string; className?: string }

export function Card({ children, title, className }: CardProps) {
  return (
    <section className={clsx('rounded-lg border border-gray-200 bg-surface p-6 shadow-sm', className)}>
      {title && <h2 className="mb-4 text-base font-medium text-gray-900">{title}</h2>}
      {children}
    </section>
  )
}
