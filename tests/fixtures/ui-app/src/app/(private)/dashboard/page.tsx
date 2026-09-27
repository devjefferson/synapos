import { PageLayout } from '@/components/ui/PageLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'

export default function DashboardPage() {
  return (
    <PageLayout>
      <PageHeader title="Dashboard" />
      <div className="grid gap-6 md:grid-cols-3">
        <Card title="Vendas hoje">—</Card>
        <Card title="Pedidos">—</Card>
        <Card title="Ticket médio">—</Card>
      </div>
    </PageLayout>
  )
}
