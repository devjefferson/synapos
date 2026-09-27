import { Container } from './Container'

type PageLayoutProps = { children: React.ReactNode; size?: 'md' | 'lg' }

// Every private page renders inside PageLayout. It owns vertical rhythm (py-8, gap-6).
export function PageLayout({ children, size = 'lg' }: PageLayoutProps) {
  return (
    <main className="py-8">
      <Container size={size} className="flex flex-col gap-6">
        {children}
      </Container>
    </main>
  )
}
