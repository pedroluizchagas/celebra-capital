# Roteiro de Testes com Leitores de Tela

Este documento fornece um roteiro estruturado para testar a acessibilidade da plataforma Celebra Capital usando leitores de tela (NVDA e VoiceOver).

## Configuração do Ambiente

### NVDA (Windows)

1. Baixe e instale o NVDA do site oficial: https://www.nvaccess.org/download/
2. Configure o NVDA para português brasileiro
3. Ajuste a velocidade da fala para um nível confortável
4. Ative o modo de navegação por formulário

### VoiceOver (macOS)

1. Ative o VoiceOver (Command + F5)
2. Configure o idioma para português brasileiro
3. Ajuste a velocidade da fala
4. Familiarize-se com os gestos de navegação

## Fluxos Principais para Teste

### 1. Login e Registro

#### Tela de Login

- [ ] Verificar se o título da página é anunciado corretamente
- [ ] Confirmar se os campos de email e senha são anunciados com seus labels
- [ ] Testar o botão "Esqueci minha senha"
- [ ] Verificar se mensagens de erro são anunciadas
- [ ] Testar o link para registro

#### Tela de Registro

- [ ] Verificar se todos os campos são anunciados corretamente
- [ ] Testar validações de formulário
- [ ] Confirmar se mensagens de erro são claras
- [ ] Verificar o botão de envio

### 2. Dashboard Principal

#### Navegação

- [ ] Testar o menu principal
- [ ] Verificar se a navegação por cabeçalhos funciona
- [ ] Testar links de atalho
- [ ] Verificar anúncios de notificações

#### Conteúdo

- [ ] Verificar se gráficos têm descrições alternativas
- [ ] Testar tabelas de dados
- [ ] Verificar se atualizações dinâmicas são anunciadas
- [ ] Testar filtros e ordenação

### 3. Formulário de Proposta

#### Preenchimento

- [ ] Verificar se todos os campos são anunciados corretamente
- [ ] Testar campos obrigatórios
- [ ] Verificar mensagens de validação
- [ ] Testar upload de documentos

#### Navegação

- [ ] Verificar se a navegação entre seções é clara
- [ ] Testar botões de salvar e enviar
- [ ] Verificar mensagens de sucesso/erro

### 4. Upload de Documentos

#### Processo de Upload

- [ ] Verificar se o botão de upload é anunciado corretamente
- [ ] Testar mensagens de progresso
- [ ] Verificar notificações de sucesso/erro
- [ ] Testar preview de documentos

#### OCR e Validação

- [ ] Verificar se o status do OCR é anunciado
- [ ] Testar mensagens de erro de validação
- [ ] Verificar se correções sugeridas são anunciadas

### 5. Minha Conta

#### Configurações

- [ ] Verificar navegação entre seções
- [ ] Testar alteração de senha
- [ ] Verificar notificações de sucesso/erro
- [ ] Testar preferências de acessibilidade

## Checklist de Verificação

### Navegação

- [ ] A ordem de leitura é lógica
- [ ] Todos os elementos interativos são acessíveis
- [ ] Links e botões têm textos descritivos
- [ ] Não há "armadilhas de teclado"

### Feedback

- [ ] Mensagens de erro são claras
- [ ] Status de carregamento é anunciado
- [ ] Notificações são anunciadas no momento correto
- [ ] Confirmações de ações são claras

### Formulários

- [ ] Labels são anunciados corretamente
- [ ] Campos obrigatórios são identificados
- [ ] Mensagens de erro são específicas
- [ ] Validações são anunciadas imediatamente

### Conteúdo

- [ ] Imagens têm descrições alternativas
- [ ] Tabelas são navegáveis
- [ ] Gráficos têm descrições
- [ ] Conteúdo dinâmico é anunciado

## Registro de Problemas

Para cada problema encontrado, registrar:

1. Página/Componente
2. Descrição do problema
3. Impacto na usabilidade
4. Passos para reprodução
5. Sugestão de correção

## Próximos Passos

1. Executar testes em todos os fluxos principais
2. Documentar problemas encontrados
3. Priorizar correções
4. Revalidar após correções
5. Atualizar documentação de acessibilidade
