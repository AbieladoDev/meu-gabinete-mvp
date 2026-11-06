/**
 * Carregamento entre um módulo e outro: aparece só no conteúdo (a barra e o
 * cabeçalho ficam parados), enquanto a próxima tela carrega.
 */
export default function PainelLoading() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-[3px] border-muted" />
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-primary" />
      </div>
      <span className="text-sm text-muted-foreground">Carregando...</span>
    </div>
  )
}
