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
- [Roadmap](#-roadmap)
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

- **Gerenciamento de Propostas**
  - Detalhes completos de cada proposta
  - Sistema de aprovação/rejeição com comentários
  - Solicitação de documentos adicionais
  - Acompanhamento de status

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

### Ferramentas de Desenvolvimento

- **Vite** - Ferramenta de build
- **ESLint** - Linter para identificar problemas no código
- **Prettier** - Formatador de código
- **Jest** - Framework de testes

## 📁 Estrutura do Projeto

```
frontend/
├── public/          # Arquivos públicos
├── src/             # Código fonte
│   ├── components/  # Componentes reutilizáveis
│   ├── contexts/    # Contextos React (AuthContext, etc)
│   ├── pages/       # Páginas da aplicação
│   │   ├── admin/   # Páginas administrativas
│   │   └── ...      # Outras páginas
│   ├── services/    # Serviços de API
│   ├── utils/       # Utilitários e helpers
│   └── App.tsx      # Componente principal
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

## 📊 Roadmap

- [x] Autenticação e Autorização
- [x] Formulário de Análise de Crédito
- [x] Dashboard Administrativo
- [ ] Sistema de Notificações
- [ ] Documentação de usuário
- [ ] Testes End-to-End
- [ ] Implementação de políticas e termos de uso
- [ ] Métricas de sucesso e análise de dados

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com ❤️ por Celebra Capital
