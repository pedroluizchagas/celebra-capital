# 📌 Celebra Capital – Plataforma de Pré-Análise de Crédito

Plataforma web e mobile criada para facilitar o processo de análise e triagem de crédito para servidores públicos, aposentados e pensionistas, de forma simples, segura e acessível.

---

## 💡 Visão Geral do Projeto

A proposta é criar um sistema elegante, visualmente agradável e altamente funcional, que permita aos usuários responder perguntas simples, enviar documentos e selfies, e assinar digitalmente, possibilitando à equipe da Celebra Capital realizar a triagem e simulação de crédito de forma eficiente e humanizada.

---

## ✅ Propósito do README

Este README serve como:

- 📋 Guia de estrutura do projeto
- 📌 Checklist de desenvolvimento e progresso
- 🧭 Roteiro técnico para desenvolvedores no Cursor
- 🧠 Memória viva da ideia e essência do projeto

---

## 🧠 Ideia Central

- Uma plataforma web/mobile bonita, simples e acessível
- Sem integração direta com sistemas bancários no início
- Interface de perguntas em tela cheia (uma pergunta por vez)
- Upload de documentos + selfie
- Assinatura eletrônica integrada
- Backoffice com triagem dos usuários em "Potenciais" e "Não potenciais"

---

## 🧱 Arquitetura do Projeto

| Camada         | Tecnologia                 |
| -------------- | -------------------------- |
| Front-end      | React (Web) + Mobile-first |
| Back-end       | Python (Django)            |
| Banco de Dados | PostgreSQL                 |
| Armazenamento  | Firebase Storage ou AWS S3 |
| Hospedagem     | Railway                    |
| Integrações    | OCR, Clicksign (futuro)    |

---

## 📁 Estrutura de Diretórios (Atual)

```
/
├── frontend/
│   ├── public/
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   └── Button.tsx
│   │   ├── pages/
│   │   │   ├── FormFlow.tsx
│   │   │   └── DocumentUpload.tsx
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/
│   ├── celebra_capital/
│   │   ├── api/
│   │   │   ├── core/
│   │   │   ├── users/
│   │   │   ├── proposals/
│   │   │   ├── documents/
│   │   │   └── urls.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   ├── asgi.py
│   │   └── celery.py
│   ├── manage.py
│   └── requirements.txt
│
└── README_Celebra_Capital.md
```

---

## 🔄 Progresso por Módulo

| Módulo / Arquivo                  | Status       | Observações                                              |
| --------------------------------- | ------------ | -------------------------------------------------------- |
| Estrutura inicial do projeto      | ✅ Concluído | Arquitetura e diretórios principais criados              |
| Frontend - Setup básico           | ✅ Concluído | Vite, React, TailwindCSS configurados                    |
| Frontend - Component Button       | ✅ Concluído | Componente de botão reutilizável criado                  |
| Frontend - FormFlow               | ✅ Concluído | Formulário guiado com validação e navegação              |
| Frontend - DocumentUpload         | ✅ Concluído | Upload de documentos com correções de bugs implementadas |
| Frontend - Signature              | ✅ Concluído | Tela de assinatura digital implementada                  |
| Frontend - Success                | ✅ Concluído | Tela de confirmação e resumo implementada                |
| Backend - Setup básico            | ✅ Concluído | Django, DRF, estrutura de aplicativos e settings         |
| Backend - Modelos                 | ✅ Concluído | Modelos de dados para users, proposals, documents, core  |
| Backend - URLs                    | ✅ Concluído | Endpoints para cada aplicativo criados                   |
| Backend - Views Básicas           | ✅ Concluído | Views com implementação básica (placeholders)            |
| Implementação de OCR              | ✅ Concluído | Integração com Google Cloud Vision API implementada      |
| Integração com assinatura digital | ✅ Concluído | Implementação básica da assinatura no frontend           |
| Dashboard admin - UI Base         | ✅ Concluído | Interface de navegação e layout principal implementados  |
| Dashboard admin - Lista Propostas | ✅ Concluído | Listagem de propostas com filtros e paginação            |
| Dashboard admin - Detalhes        | ✅ Concluído | Visualização detalhada e aprovação/rejeição de propostas |
| Dashboard admin - Relatórios      | ✅ Concluído | Visualizações gráficas e exportação para CSV, Excel, PDF |
| Autenticação e Segurança          | ✅ Concluído | Implementação de JWT, login/cadastro e rotas protegidas  |
| Integração Frontend-Backend       | ✅ Concluído | FormFlow, DocumentUpload, Signature e Success integrados |
| Deploy                            | ✅ Concluído | Configurado para Railway com CI/CD e monitoramento       |

---

## 🔐 Segurança e LGPD

- Dados criptografados em trânsito e repouso
- Consentimento digital explícito antes do envio
- Registro de IP, data e hora no aceite da assinatura
- Controle de acesso por perfil de usuário

---

## 🛠️ Etapas do Desenvolvimento

- [x] Definição do escopo do projeto
- [x] Escolha de tecnologias e arquitetura
- [x] Criação da estrutura básica do projeto
- [x] Implementação do formulário guiado
- [x] Implementação do upload de documentos (frontend)
- [x] Implementação da assinatura digital
- [x] Integração com OCR
- [x] Desenvolvimento do dashboard administrativo (base)
- [x] Finalização do dashboard interno (relatórios)
- [x] Deploy e testes finais

---

## 📌 Próximos Passos

1. ✅ Corrigir bugs na tela de upload de documentos
2. ✅ Implementar integração do frontend com as APIs do backend
3. ✅ Adicionar autenticação completa com JWT
   - ✅ Implementar tela de login e registro
   - ✅ Adicionar middleware de autenticação no frontend
   - ✅ Configurar interceptors para renovação de tokens
   - ✅ Adicionar rotas protegidas
4. ✅ Conectar com serviço de OCR para leitura de documentos
   - ✅ Implementar integração com Google Cloud Vision API
   - ✅ Integrar OCR com a API de upload de documentos
   - ✅ Implementar validação de documentos baseada em OCR
   - ✅ Mostrar feedback visual dos dados extraídos para o usuário
5. ✅ Desenvolver o dashboard administrativo
   - ✅ Criar página de listagem de propostas
   - ✅ Implementar filtros e pesquisa
   - ✅ Adicionar visualização detalhada de propostas
   - ✅ Implementar sistema de aprovação/rejeição de propostas
   - ✅ Criar relatórios e exportação de dados
     - ✅ Implementar visualizações gráficas (status, tipo de crédito, tendências)
     - ✅ Adicionar filtros para relatórios (data, tipo, status)
     - ✅ Implementar exportação em múltiplos formatos (CSV, Excel, PDF)
6. ✅ Implementar sistema de notificações
   - ✅ Adicionar notificações por email
   - ✅ Implementar notificações push no navegador
   - ✅ Criar centro de notificações no dashboard
7. ✅ Fazer deploy da aplicação completa
   - ✅ Configurar ambiente de produção no Railway
   - ✅ Implementar CI/CD para deploy automático
   - ✅ Configurar monitoramento e logging
   - ✅ Realizar testes de carga e segurança

---

## 📌 Observações Finais

> Este README deve ser mantido atualizado ao final de cada sprint ou marco do desenvolvimento.  
> Toda alteração significativa no projeto deve ser refletida aqui.

---

Desenvolvido com ❤️ no Cursor
