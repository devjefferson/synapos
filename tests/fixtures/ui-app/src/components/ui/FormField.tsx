type FormFieldProps = { label: string; htmlFor: string; error?: string; children: React.ReactNode }

// All form inputs are wrapped in FormField: label on top, inline error below (skills/ux.md).
export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  )
}
