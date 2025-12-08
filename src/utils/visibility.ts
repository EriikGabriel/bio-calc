import { useEffect, useRef } from "react"

/**
 * Observa um elemento e executa o callback na primeira vez que ele ficar visível.
 * Desconecta automaticamente após a primeira execução.
 */
export function useOnVisibleOnce(
  elementRef: React.RefObject<Element>,
  onVisible: () => void | Promise<void>,
  options: IntersectionObserverInit = { root: null, threshold: 0.1 }
) {
  const doneRef = useRef(false)
  useEffect(() => {
    const el = elementRef.current
    if (!el || doneRef.current) return

    const observer = new IntersectionObserver(async (entries, obs) => {
      const entry = entries[0]
      if (entry?.isIntersecting && !doneRef.current) {
        try {
          await onVisible()
        } finally {
          doneRef.current = true
          obs.disconnect()
        }
      }
    }, options)

    observer.observe(el)
    return () => observer.disconnect()
    // Dependências incluem ref e callback para evitar avisos do linter.
  }, [elementRef, onVisible, options])
}

/**
 * Especialização para carregamento de opções quando visível.
 * Chama `load()` e aplica o resultado via `apply()`, apenas uma vez.
 */
export function useLoadOptionsOnVisible(
  elementRef: React.RefObject<Element>,
  load: () => Promise<string[]>,
  apply: (opts: string[]) => void,
  options: IntersectionObserverInit = { root: null, threshold: 0.1 }
) {
  useOnVisibleOnce(
    elementRef,
    async () => {
      const opts = await load()
      if (opts?.length) apply(opts)
    },
    options
  )
}

/**
 * Variante para executar múltiplos carregamentos/aplicações em uma única observação de visibilidade.
 * Útil quando queremos carregar várias listas suspensas ao mesmo tempo usando um único observer.
 */
export function useLoadManyOptionsOnVisible(
  elementRef: React.RefObject<Element>,
  tasks: Array<{
    load: () => Promise<string[]>
    apply: (opts: string[]) => void
  }>,
  options: IntersectionObserverInit = { root: null, threshold: 0.1 }
) {
  useOnVisibleOnce(
    elementRef,
    async () => {
      // Executa as tarefas em paralelo
      const results = await Promise.all(tasks.map((t) => t.load()))
      results.forEach((opts, idx) => {
        if (opts?.length) tasks[idx].apply(opts)
      })
    },
    options
  )
}

/**
 * Variante com um único `load` e um único `apply` para compor vários carregamentos
 * e aplicar todos os resultados de uma vez. Útil quando queremos uma só assinatura.
 */
export function useLoadCombinedOnVisible<T>(
  elementRef: React.RefObject<Element>,
  load: () => Promise<T>,
  apply: (result: T) => void,
  options: IntersectionObserverInit = { root: null, threshold: 0.1 }
) {
  useOnVisibleOnce(
    elementRef,
    async () => {
      const result = await load()
      apply(result)
    },
    options
  )
}
