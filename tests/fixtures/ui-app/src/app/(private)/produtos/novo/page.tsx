import { PageLayout } from '@/components/ui/PageLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { ProdutoForm } from './ProdutoForm'

export default function NovoProdutoPage() {
  return (
    <PageLayout size="md">
      <PageHeader title="Novo produto" />
      <Card>
        <ProdutoForm />
      </Card>
    </PageLayout>
  )
}
