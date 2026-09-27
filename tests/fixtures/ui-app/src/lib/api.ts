// Server-side data access. Pages are Server Components and call these functions directly (ADR-002).
export type Produto = { id: string; nome: string; preco: number }

export async function listProdutos(): Promise<Produto[]> {
  const res = await fetch(`${process.env.API_URL}/produtos`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Falha ao carregar produtos')
  return res.json()
}

export async function createProduto(data: Omit<Produto, 'id'>): Promise<Produto> {
  const res = await fetch(`${process.env.API_URL}/produtos`, { method: 'POST', body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Falha ao criar produto')
  return res.json()
}
