'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { createProdutoAction } from './actions'

const schema = z.object({
  nome: z.string().min(2, 'Informe o nome'),
  preco: z.coerce.number().positive('Preço deve ser maior que zero'),
})

type FormValues = z.infer<typeof schema>

export function ProdutoForm() {
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) })

  return (
    <form onSubmit={handleSubmit(createProdutoAction)} className="flex flex-col gap-4">
      <FormField label="Nome" htmlFor="nome" error={formState.errors.nome?.message}>
        <input id="nome" className="rounded-md border border-gray-300 px-3 py-2" {...register('nome')} />
      </FormField>
      <FormField label="Preço" htmlFor="preco" error={formState.errors.preco?.message}>
        <input id="preco" type="number" step="0.01" className="rounded-md border border-gray-300 px-3 py-2" {...register('preco')} />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" loading={formState.isSubmitting}>Salvar</Button>
      </div>
    </form>
  )
}
