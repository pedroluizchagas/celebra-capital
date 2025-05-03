# Migração para Zustand

Este documento descreve a migração dos contextos de React para o gerenciamento de estado com Zustand.

## Motivação

A migração dos contextos React para Zustand foi realizada visando os seguintes benefícios:

1. **Performance**: Zustand é mais eficiente que a Context API, especialmente para estados que mudam frequentemente
2. **Redução de re-renderizações**: Zustand permite selecionar apenas as partes do estado que interessam, evitando re-renderizações desnecessárias
3. **Simplicidade**: API mais simples e intuitiva para gerenciar estado global
4. **Persistência de estado**: Facilidade de implementar persistência de estado entre sessões
5. **DevTools integration**: Integração com ferramentas de desenvolvimento para depuração

## Comparação: Context API vs Zustand

| Aspecto                 | Context API                                                           | Zustand                                                                    |
| ----------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Re-renderizações        | Todo o componente re-renderiza quando qualquer parte do contexto muda | Apenas componentes que usam partes específicas do estado são atualizados   |
| Boilerplate             | Requer criação de Provider, Context e Hooks                           | API declarativa simples, reduz significativamente o código boilerplate     |
| Performance             | Pode causar problemas de performance em estados complexos             | Otimizado para performance, usa o zustand/immer para atualizações parciais |
| Middleware/Plugins      | Não tem suporte nativo                                                | Suporte a middleware e plugins para persistência, devtools, etc.           |
| Instrumentação/DevTools | Requer configuração manual para Debug                                 | Integração nativa com Redux DevTools via middleware                        |
| Memoização              | Necessita de useMemo em vários níveis para evitar re-renderizações    | Seleção automática de estado evita re-renderizações desnecessárias         |

## Arquitetura implementada

### 1. Stores

Criamos stores específicas para cada domínio:

- `useAuthStore`: Gerencia autenticação e dados do usuário
- `useErrorStore`: Gerencia erros globais, de API e de formulários
- `useNotificationStore`: Gerencia notificações e configurações do usuário

### 2. Adaptadores para compatibilidade

Para facilitar a migração gradual, criamos hooks de compatibilidade em `src/stores/adapters.ts` que mantêm a mesma API dos hooks baseados em contexto:

```typescript
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout, checkAuth } =
    useAuthStore()
  return { user, isAuthenticated, isLoading, login, logout, checkAuth }
}
```

### 3. Remoção de Providers

Eliminamos os Providers desnecessários do `App.tsx`, simplificando a árvore de componentes e evitando re-renderizações cascata.

## Padrões e boas práticas

1. **Seletores específicos**: Use seletores para selecionar apenas o que for necessário:

   ```typescript
   const userName = useAuthStore((state) => state.user?.name)
   ```

2. **Ações encapsuladas**: As ações estão encapsuladas na própria store:

   ```typescript
   login: async (cpf, password) => {
     set({ isLoading: true })
     // implementation...
   }
   ```

3. **Comunicação entre stores**: As stores se comunicam através de subscribers:
   ```typescript
   useAuthStore.subscribe((state, prevState) => {
     if (state.isAuthenticated && !prevState.isAuthenticated) {
       // do something when authenticated
     }
   })
   ```

## Migração futura

A arquitetura permite evoluir facilmente para uma abordagem de "fatias" de estado com o padrão Redux Toolkit:

```typescript
// Exemplo futuro com abordagem de "slices"
const createAuthSlice = (set, get) => ({
  user: null,
  isAuthenticated: false,
  login: async (cpf, password) => {
    // implementation
  },
})

const createErrorSlice = (set, get) => ({
  // ...
})

const useBoundStore = create((...a) => ({
  ...createAuthSlice(...a),
  ...createErrorSlice(...a),
}))
```

## Impacto da implementação

- **Redução de re-renderizações**: Componentes só são re-renderizados quando dados relevantes mudam
- **Performance**: Menor overhead em operações como login/logout e notificações
- **Legibilidade**: O código ficou mais limpo e fácil de manter
- **Preparação para escala**: Arquitetura pronta para escalar conforme o aplicativo cresce
