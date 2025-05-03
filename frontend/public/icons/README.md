# Guia de Ícones PWA - Celebra Capital

Este diretório contém todos os ícones necessários para o funcionamento correto do Progressive Web App (PWA) da Celebra Capital. Abaixo estão as informações e boas práticas para manter e atualizar estes ícones.

## Estrutura de Ícones

Os seguintes ícones são necessários para o PWA funcionar em diferentes plataformas:

| Arquivo              | Tamanho               | Propósito                               |
| -------------------- | --------------------- | --------------------------------------- |
| icon-72x72.png       | 72x72px               | Android/dispositivos de baixa resolução |
| icon-96x96.png       | 96x96px               | Android/dispositivos de resolução média |
| icon-128x128.png     | 128x128px             | Vários dispositivos/telas               |
| icon-144x144.png     | 144x144px             | Android/dispositivos de alta resolução  |
| icon-152x152.png     | 152x152px             | iOS (iPad)                              |
| icon-192x192.png     | 192x192px             | Android modernos                        |
| icon-384x384.png     | 384x384px             | Telas de alta densidade de pixels       |
| icon-512x512.png     | 512x512px             | Padrão moderno para PWAs                |
| maskable-icon.png    | 512x512px             | Ícone adaptável (Android)               |
| apple-touch-icon.png | 180x180px             | iOS (iPhone/home screen)                |
| favicon.ico          | 16x16, 32x32, 48x48px | Navegadores desktop                     |
| pwa-96x96.png        | 96x96px               | Atalhos de PWA                          |

## Boas Práticas para Ícones PWA

1. **Área Segura para Ícones Maskable**

   - O elemento principal do ícone deve estar dentro de uma área central, ocupando aproximadamente 60% do tamanho total
   - As bordas serão cortadas em diferentes formatos dependendo do sistema operacional
   - Este formato é crítico para dispositivos Android modernos

2. **Consistência Visual**

   - Todos os ícones devem manter uma identidade visual consistente
   - Cor primária: #0066cc (azul Celebra)
   - Fundo sólido para melhor contraste

3. **Formatos e Qualidade**

   - Usar PNG para todos os ícones (melhor suporte e transparência)
   - Otimizar imagens para reduzir o tamanho dos arquivos
   - Manter cantos arredondados consistentes

4. **Atributos no Manifest**
   - Cada ícone deve ter os atributos `src`, `sizes`, `type` e `purpose`
   - Purpose pode ser "any" (padrão) ou "maskable" (para ícones adaptáveis)

## Como Gerar Novos Ícones

Para facilitar a geração de novos ícones, temos uma ferramenta disponível:

1. Abra o arquivo `icon-generator.html` neste diretório em um navegador
2. Escolha entre gerar ícones com:
   - Texto/sigla (CC)
   - Logo carregado (formato transparente recomendado)
3. Defina as cores apropriadas
4. Clique em "Gerar Todos os Ícones"
5. Faça o download dos ícones necessários
6. Substitua os arquivos neste diretório

## Verificação de Conformidade

Após atualizar ou adicionar novos ícones, verifique:

1. Se todos os tamanhos necessários estão presentes
2. Se o arquivo `manifest.json` está corretamente configurado
3. Se os ícones são exibidos corretamente nas telas de homescreen
4. Se os ícones maskable são exibidos adequadamente em diferentes formatos

## Links Úteis

- [Guia de Ícones do Web App Manifest (MDN)](https://developer.mozilla.org/pt-BR/docs/Web/Manifest#icons)
- [Maskable.app Editor](https://maskable.app/editor) - Ferramenta para testar ícones maskable
- [PWA Builder](https://www.pwabuilder.com/) - Ferramentas adicionais para PWAs

---

Última atualização: Agosto 2023
