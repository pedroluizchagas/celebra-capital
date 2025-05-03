# Configuração do PWA da Celebra Capital

Este documento descreve a configuração do Progressive Web App (PWA) da Celebra Capital.

## Componentes do PWA

O PWA da Celebra Capital inclui os seguintes componentes:

1. **Web App Manifest**: Definido em `frontend/public/manifest.json`
2. **Service Worker**: Implementado em `frontend/public/service-worker.js`
3. **Ícones e imagens**:
   - Ícones em diversos tamanhos em `frontend/public/icons/`
   - Screenshots em `frontend/public/screenshots/`
   - Imagem para compartilhamento social em `frontend/public/social-image.jpg`
4. **Utilitários PWA**:
   - `pwa-utils.js`: Funções utilitárias para gestão do PWA
   - `pwa-install-banner.js`: Banner personalizado para instalação
   - `cache-manager.js`: Gerenciador de estratégias de cache
   - `meta-tags.html`: Meta tags para SEO e compartilhamento social
   - `push-notifications.js`: Sistema de notificações push
   - `background-sync.js`: Sincronização em segundo plano
   - `offline.html`: Página de fallback para modo offline

## Configuração de Ícones

O PWA requer os seguintes ícones:

### Ícones Regulares

- 72x72 pixels: `/icons/pwa-72x72.png`
- 96x96 pixels: `/icons/pwa-96x96.png`
- 128x128 pixels: `/icons/pwa-128x128.png`
- 144x144 pixels: `/icons/pwa-144x144.png`
- 152x152 pixels: `/icons/pwa-152x152.png`
- 192x192 pixels: `/icons/pwa-192x192.png`
- 384x384 pixels: `/icons/pwa-384x384.png`
- 512x512 pixels: `/icons/pwa-512x512.png`

### Favicons

- 16x16 pixels: `/icons/favicon-16x16.png`
- 32x32 pixels: `/icons/favicon-32x32.png`
- 48x48 pixels: `/icons/favicon-48x48.png`

### Ícones Especiais

- Maskable Icon (Android): `/icons/maskable-icon.png` (512x512 pixels)
- Apple Touch Icon (iOS): `/icons/apple-touch-icon.png` (180x180 pixels)

## Como gerar os ícones

Há duas maneiras de gerar os ícones:

1. **Gerador HTML**:

   - Abra `frontend/public/icons/icon-generator.html` no navegador
   - Personalize as configurações e clique em "Gerar Todos os Ícones"
   - Baixe e salve os ícones nos caminhos apropriados

2. **Scripts Node.js**:
   - Execute `node scripts/generateIcons.js` para gerar os ícones básicos
   - Execute `node scripts/generate-screenshots.js` para gerar screenshots
   - Execute `node scripts/generate-social-image.js` para gerar imagem social
   - Execute `node scripts/rename-icons.js` para renomear ícones para os padrões corretos

## Recursos de PWA Implementados

### 1. Banner de Instalação Personalizado

O arquivo `pwa-install-banner.js` fornece um banner personalizado para sugerir a instalação do PWA.
Características:

- Design adaptável para dispositivos móveis
- Respeita a preferência do usuário (se recusou, não mostra novamente por 30 dias)
- Aparece automaticamente quando o app está pronto para instalação

### 2. Gerenciador de Cache Estratégico

O arquivo `cache-manager.js` implementa diferentes estratégias de cache para diferentes tipos de recursos:

- **Cache First**: Para recursos estáticos (CSS, imagens, fontes)
- **Network First**: Para dados dinâmicos (APIs, dashboard)
- **Stale-While-Revalidate**: Para recursos que podem ser atualizados em segundo plano
- **No Cache**: Para dados sensíveis que nunca devem ser cacheados

### 3. Utilitários PWA

O arquivo `pwa-utils.js` fornece funções úteis para:

- Verificar atualizações do PWA automaticamente
- Notificar o usuário quando houver atualizações
- Detectar se o app está instalado ou sendo executado no navegador
- Configurar o prompt de instalação

### 4. Meta Tags Otimizadas

O arquivo `meta-tags.html` contém todas as meta tags necessárias para:

- Suporte a PWA em iOS (Apple)
- Compartilhamento em redes sociais (Open Graph, Twitter)
- SEO básico (descrição, palavras-chave)
- Ícones para diferentes plataformas

### 5. Notificações Push

O arquivo `push-notifications.js` implementa um sistema completo para notificações:

- Solicitação de permissão ao usuário
- Suporte a notificações push remotas (via Web Push API)
- Notificações locais para avisos do aplicativo
- Inscrição/cancelamento de inscrição de notificações
- Verificação de compatibilidade com navegadores

### 6. Sincronização em Segundo Plano

O arquivo `background-sync.js` permite enviar dados mesmo quando offline:

- Salvamento de dados no IndexedDB quando offline
- Sincronização automática quando a conexão for restaurada
- API para gerenciar diferentes tipos de dados
- Mecanismo de retry para falhas de sincronização
- Funcionalidade de fallback para navegadores sem suporte

### 7. Página Offline

O arquivo `offline.html` fornece uma experiência de usuário quando não há conexão:

- Exibição dos dados que foram previamente cacheados
- Interface amigável informando sobre o estado offline
- Botão para tentar reconectar
- Retorno automático à navegação normal quando a conexão for restaurada

## Verificação do PWA

Para verificar se o PWA está configurado corretamente:

```bash
node scripts/check-pwa.js
```

Este script verificará:

- Se todos os arquivos necessários existem
- Se todos os ícones estão disponíveis
- Se o manifest.json está configurado corretamente
- Se o service worker implementa as funcionalidades básicas
- Se as screenshots existem
- Se a imagem para compartilhamento social existe

## Integrando os Recursos PWA no Seu HTML

Adicione os seguintes scripts ao seu HTML (preferencialmente antes do fechamento do `</body>`):

```html
<!-- PWA Utils -->
<script src="/pwa-utils.js"></script>
<script src="/pwa-install-banner.js"></script>

<!-- Para páginas que precisam de funcionalidades avançadas -->
<script src="/push-notifications.js"></script>
<script src="/background-sync.js"></script>
<script src="/cache-manager.js"></script>
```

E adicione as meta tags (no `<head>` do documento):

```html
<!-- Incluir meta tags para PWA -->
<include src="/meta-tags.html"></include>
```

## Exemplo de Implementação

Um exemplo completo de integração está disponível em:

```
frontend/public/pwa-example.html
```

Este arquivo demonstra:

- Como integrar todos os componentes PWA
- Implementação de notificações push
- Demonstração de sincronização em segundo plano
- Interface para instalação do aplicativo

## Personalização

Ao substituir os ícones temporários por ícones definitivos, certifique-se de:

1. Manter os mesmos nomes de arquivo
2. Manter as mesmas dimensões
3. Usar imagens com boa qualidade
4. Testar a aparência dos ícones em diferentes dispositivos

## Atalhos

O manifest.json define os seguintes atalhos:

- "Nova Proposta": Para iniciar uma nova proposta de crédito
- "Minhas Propostas": Para ver propostas em andamento

## Requisitos do Servidor

Para que as funcionalidades avançadas do PWA funcionem corretamente, seu servidor precisa:

1. **Para Notificações Push**:

   - Implementar a Web Push API
   - Gerar chaves VAPID para autenticação
   - Armazenar as inscrições dos usuários
   - Enviar notificações para os endpoints registrados

2. **Para HTTPS**:
   - Todo PWA requer HTTPS para funcionar
   - Obtenha um certificado SSL válido (Let's Encrypt é gratuito)
   - Configure seu servidor para redirecionamento HTTP para HTTPS

## Testes e Depuração

Para testar o PWA, utilize:

1. **Chrome DevTools**:

   - Aba "Application" > "Service Workers"
   - Aba "Application" > "Manifest"
   - Aba "Application" > "Cache Storage"
   - Aba "Application" > "IndexedDB"

2. **Lighthouse**:

   - Ferramenta de auditoria do Google para PWAs
   - Acesse em Chrome DevTools > "Lighthouse"
   - Execute a auditoria na categoria "Progressive Web App"

3. **Teste Offline**:
   - Desative a conexão de rede no navegador (DevTools > Network > Offline)
   - Verifique se a página offline é exibida corretamente
   - Teste se as funcionalidades offline funcionam como esperado
