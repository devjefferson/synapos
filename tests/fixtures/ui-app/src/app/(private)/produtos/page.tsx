import Link from 'next/link'
import { PageLayout } from '@/components/ui/PageLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { listProdutos } from '@/lib/api'

export default async function ProdutosPage() {
  const produtos = await listProdutos()

  return (
    <PageLayout>
      <PageHeader
        title="Produtos"
        description="Catálogo da loja"
        actions={
          <Link href="/produtos/novo">
            <Button>Novo produto</Button>
          </Link>
        }
      />
      <Card>
        {produtos.length === 0 ? (
          <EmptyState title="Nenhum produto cadastrado" description="Cadastre o primeiro produto da loja." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {produtos.map((p) => (
              <li key={p.id} className="flex justify-between py-3 text-sm">
                <span className="text-gray-900">{p.nome}</span>
                <span className="text-muted">R$ {p.preco.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageLayout>
  )
}
