'use server'
import { redirect } from 'next/navigation'
import { createProduto } from '@/lib/api'

export async function createProdutoAction(data: { nome: string; preco: number }) {
  await createProduto(data)
  redirect('/produtos')
}
