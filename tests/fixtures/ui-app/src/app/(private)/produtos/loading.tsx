import { PageLayout } from '@/components/ui/PageLayout'
import { Card } from '@/components/ui/Card'

export default function Loading() {
  return (
    <PageLayout>
      <Card>
        <div className="h-24 animate-pulse rounded bg-gray-100" />
      </Card>
    </PageLayout>
  )
}
