type EmptyStateProps = { title: string; description?: string; action?: React.ReactNode }

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <p className="font-medium text-gray-900">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
      {action}
    </div>
  )
}
