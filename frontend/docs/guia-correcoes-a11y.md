# Guia de Correções de Acessibilidade

Este documento fornece soluções para problemas comuns de acessibilidade encontrados durante os testes com leitores de tela.

## 1. Problemas de Navegação

### 1.1 Ordem de Tabulação Incorreta

**Problema**: A ordem de navegação por teclado não segue o fluxo visual da interface.

**Solução**:

```tsx
// Antes
<div>
  <button>Botão 2</button>
  <button>Botão 1</button>
</div>

// Depois
<div>
  <button tabIndex={1}>Botão 1</button>
  <button tabIndex={2}>Botão 2</button>
</div>
```

### 1.2 Armadilhas de Teclado

**Problema**: O foco fica preso em um elemento ou modal.

**Solução**:

```tsx
// Implementar gerenciamento de foco em modais
const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // Salvar último elemento com foco
      const lastFocusedElement = document.activeElement

      // Focar primeiro elemento do modal
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      focusableElements[0]?.focus()

      return () => {
        // Restaurar foco ao fechar
        lastFocusedElement?.focus()
      }
    }
  }, [isOpen])

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {children}
    </div>
  )
}
```

## 2. Problemas com Formulários

### 2.1 Labels Ausentes ou Incorretos

**Problema**: Campos de formulário sem labels associados.

**Solução**:

```tsx
// Antes
<input type="text" />

// Depois
<div>
  <label htmlFor="nome">Nome</label>
  <input id="nome" type="text" aria-required="true" />
</div>
```

### 2.2 Mensagens de Erro Inacessíveis

**Problema**: Mensagens de erro não são anunciadas por leitores de tela.

**Solução**:

```tsx
const FormField = ({ error, label, ...props }) => {
  return (
    <div>
      <label htmlFor={props.id}>{label}</label>
      <input
        {...props}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : undefined}
      />
      {error && (
        <span id={`${props.id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
```

## 3. Problemas com Conteúdo Dinâmico

### 3.1 Atualizações não Anunciadas

**Problema**: Leitores de tela não anunciam mudanças dinâmicas.

**Solução**:

```tsx
const DynamicContent = ({ content }) => {
  return (
    <div role="status" aria-live="polite">
      {content}
    </div>
  )
}
```

### 3.2 Status de Carregamento

**Problema**: Status de carregamento não é anunciado.

**Solução**:

```tsx
const LoadingState = ({ isLoading }) => {
  return (
    <div role="status" aria-live="polite">
      {isLoading && <span>Carregando...</span>}
    </div>
  )
}
```

## 4. Problemas com Imagens e Ícones

### 4.1 Imagens sem Texto Alternativo

**Problema**: Imagens sem descrição para leitores de tela.

**Solução**:

```tsx
// Antes
<img src="logo.png" />

// Depois
<img
  src="logo.png"
  alt="Logo Celebra Capital"
  aria-hidden="true" // Para imagens decorativas
/>
```

### 4.2 Ícones sem Descrição

**Problema**: Ícones sem texto descritivo.

**Solução**:

```tsx
// Antes
<button><Icon /></button>

// Depois
<button>
  <Icon aria-hidden="true" />
  <span>Adicionar Item</span>
</button>
```

## 5. Problemas com Tabelas

### 5.1 Tabelas sem Cabeçalhos

**Problema**: Tabelas sem cabeçalhos associados às células.

**Solução**:

```tsx
<table>
  <thead>
    <tr>
      <th scope="col">Nome</th>
      <th scope="col">Email</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td headers="nome">João Silva</td>
      <td headers="email">joao@email.com</td>
    </tr>
  </tbody>
</table>
```

## 6. Problemas com Contraste

### 6.1 Contraste Insuficiente

**Problema**: Texto com contraste insuficiente com o fundo.

**Solução**:

```tsx
// Antes
<div className="text-gray-400 bg-gray-100">
  Texto com baixo contraste
</div>

// Depois
<div className="text-gray-700 bg-gray-100">
  Texto com contraste adequado
</div>
```

## 7. Problemas com ARIA

### 7.1 Roles Incorretos

**Problema**: Uso incorreto de roles ARIA.

**Solução**:

```tsx
// Antes
<div onClick={handleClick}>Botão</div>

// Depois
<button
  onClick={handleClick}
  role="button"
  tabIndex={0}
>
  Botão
</button>
```

### 7.2 Estados ARIA

**Problema**: Estados dinâmicos não são anunciados.

**Solução**:

```tsx
const ToggleButton = ({ isExpanded, onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-expanded={isExpanded}
      aria-controls="conteudo-expansivel"
    >
      {isExpanded ? 'Recolher' : 'Expandir'}
    </button>
  )
}
```

## 8. Checklist de Verificação

Após implementar correções, verifique:

1. [ ] A ordem de tabulação está correta
2. [ ] Todos os elementos interativos são acessíveis por teclado
3. [ ] Mensagens de erro são anunciadas
4. [ ] Imagens têm texto alternativo apropriado
5. [ ] Contraste atende aos requisitos WCAG AA
6. [ ] Estados dinâmicos são anunciados
7. [ ] Tabelas têm cabeçalhos associados
8. [ ] Formulários têm labels associados

## 9. Recursos Úteis

- [WCAG 2.1 Checklist](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)
