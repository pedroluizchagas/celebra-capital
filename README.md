# Plataforma de Pré-Análise de Crédito - Celebra Capital

![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-green)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![React Version](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue)

<p align="center">
  <img src="https://via.placeholder.com/200x100?text=Celebra+Capital" alt="Logo da Celebra Capital"/>
</p>

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Demo](#-demo)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar](#-como-executar)
- [Documentação](#-documentação)
- [Roadmap](#-roadmap)
- [Testes](#-testes)
- [Licença](#-licença)

## 🚀 Sobre o Projeto

A Plataforma de Pré-Análise de Crédito é uma solução desenvolvida para a Celebra Capital, permitindo que clientes possam solicitar análises de crédito de forma digital e eficiente. O sistema oferece uma avaliação automática inicial, simplificando o processo de concessão de crédito e melhorando a experiência do cliente.

O projeto está estruturado em uma aplicação frontend React com TypeScript e uma API backend (em repositório separado).

## ✨ Funcionalidades

- **Autenticação e Autorização**

  - Sistema de login e cadastro de usuários
  - Controle de acesso baseado em perfis (admin, analista, cliente)
  - Proteção de rotas baseada em permissões

- **Formulários de Negócio**

  - Formulário completo de análise de crédito para empresas
  - Cálculos automáticos de capacidade de pagamento e parcelas
  - Upload de documentação necessária
  - Simulação de score de crédito

- **Dashboard Administrativo**

  - Visualização de estatísticas e métricas principais
  - Listagem de propostas de crédito com filtros avançados
  - Visualização de atividades recentes
  - Gráficos de desempenho

- **Sistema de Notificações**

  - Notificações em tempo real no header
  - Contador de notificações não lidas
  - Página dedicada para gerenciamento de notificações
  - Classificação por tipos (info, sucesso, alerta, erro)

- **Gerenciamento de Propostas**
  - Detalhes completos de cada proposta
  - Sistema de aprovação/rejeição com comentários
  - Solicitação de documentos adicionais
  - Acompanhamento de status
  - Exportação de dados em formatos diversos (CSV, Excel, PDF)

## 🖥️ Demo

![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Preview)

## 🛠️ Tecnologias Utilizadas

### Frontend

- **React** - Biblioteca para construção de interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **React Router** - Gerenciamento de rotas
- **react-hook-form** - Gerenciamento de formulários
- **zod** - Validação de formulários
- **Chart.js** - Biblioteca para visualização de dados
- **TailwindCSS** - Framework CSS utilitário

### Testes

- **Jest** - Framework de testes
- **Testing Library** - Biblioteca para testes de componentes
- **MSW (Mock Service Worker)** - Interceptação de requisições para testes
- **Cypress** - Framework para testes End-to-End

### Ferramentas de Desenvolvimento

- **Vite** - Ferramenta de build
- **ESLint** - Linter para identificar problemas no código
- **Prettier** - Formatador de código

## 📁 Estrutura do Projeto

```
frontend/
├── public/                 # Arquivos públicos
├── src/                    # Código fonte
│   ├── components/         # Componentes reutilizáveis
│   │   ├── dashboard/      # Componentes do dashboard
│   │   ├── notifications/  # Componentes de notificações
│   │   ├── proposal/       # Componentes de propostas
│   │   └── ui/             # Componentes de UI genéricos
│   ├── contexts/           # Contextos React (AuthContext, etc)
│   ├── pages/              # Páginas da aplicação
│   │   ├── admin/          # Páginas administrativas
│   │   └── ...             # Outras páginas
│   ├── services/           # Serviços de API
│   ├── utils/              # Utilitários e helpers
│   └── App.tsx             # Componente principal
├── tests/                  # Testes de integração e E2E
│   ├── integration/        # Testes de integração
│   └── e2e/                # Testes end-to-end
├── docs/                   # Documentação
│   ├── manual/             # Manuais de usuário
│   └── CHANGELOG.md        # Histórico de alterações
└── ...
```

## 🚀 Como Executar

Siga os passos abaixo para executar o projeto localmente:

```bash
# Clone este repositório
$ git clone https://github.com/seu-usuario/celebra-capital-frontend.git

# Acesse a pasta do projeto
$ cd celebra-capital-frontend

# Instale as dependências
$ npm install
# ou
$ yarn install

# Execute a aplicação
$ npm run dev
# ou
$ yarn dev
```

A aplicação estará disponível em `http://localhost:3000`.

## 📖 Documentação

A documentação da plataforma está disponível na pasta `docs/manual/` e inclui:

- **Guia Rápido**: Um guia conciso para usuários regulares, com instruções sobre o uso das principais funcionalidades do sistema.

- **Manual do Administrador**: Um documento detalhado para administradores, abrangendo todas as funcionalidades do sistema, configurações avançadas e resolução de problemas.

Para acessar a documentação:

```bash
# Visualizar o guia rápido
$ open docs/manual/guia-rapido.md

# Visualizar o manual do administrador
$ open docs/manual/admin-guide.md
```

## 📊 Roadmap

- [x] Autenticação e Autorização
- [x] Formulário de Análise de Crédito
- [x] Dashboard Administrativo
- [x] Sistema de Notificações
- [x] Página de Detalhes das Propostas
- [x] Fluxo de Aprovação/Rejeição
- [x] Formulário para Feedback/Comentários
- [x] Testes Unitários
- [x] Testes de Integração
- [x] Documentação de usuário
- [ ] Testes End-to-End
- [ ] Implementação de políticas e termos de uso
- [ ] Métricas de sucesso e análise de dados

## 🧪 Testes

Para executar os testes unitários:

```bash
# Executar todos os testes
$ npm run test

# Executar apenas testes unitários
$ npm run test:unit

# Executar apenas testes de integração
$ npm run test:integration

# Executar testes com coverage
$ npm run test:coverage

# Executar em modo watch
$ npm run test:watch
```

Os testes unitários verificam o funcionamento isolado de cada componente, enquanto os testes de integração validam fluxos completos como aprovação de propostas e interação com notificações.

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com ❤️ por Celebra Capital
