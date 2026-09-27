'use client'
import { PageLayout } from '@/components/ui/PageLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <PageLayout>
      <Card>
        <p className="text-sm text-danger">Não foi possível carregar os dados.</p>
        <Button variant="secondary" className="mt-4" onClick={reset}>Tentar novamente</Button>
      </Card>
    </PageLayout>
  )
}
