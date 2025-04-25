# Sistema Celebra Capital – Roadmap de Melhoria do MVP

Este README centraliza **todas as tarefas necessárias** para levar o MVP à produção.  
Cada item possui um status:

- ⬜ **To Do** – ainda não iniciado
- 🟡 **In Progress** – trabalhando neste momento
- ✅ **Done** – concluído e revisado

> **Como usar**
>
> 1. Quando iniciar uma tarefa, troque ⬜ por 🟡.
> 2. Quando finalizar, troque 🟡 por ✅.
> 3. Se uma tarefa depender de outra, mantenha-a como **⬜ To Do** até que a dependência esteja ✅ Done.

---

## 🌊 Onda 0 – Ajustes rápidos _(prioridade máx., 1-2 dias)_

| Tarefa                                                                           | Status  | Depende de |
| -------------------------------------------------------------------------------- | ------- | ---------- |
| ✅ Centralizar exibição de erros de API e formulários (`<ErrorProvider>`)        | ✅ Done | —          |
| ✅ Padronizar formulários com **React Hook Form + zod**                          | ✅ Done | —          |
| ✅ Garantir contraste AA com `@tailwindcss/colors-contrast`                      | ✅ Done | —          |
| ✅ Revisar e padronizar interceptors de API para tratamento consistente de erros | ✅ Done | —          |

---

## 🌊 Onda 1 – Confiabilidade básica _(≈ 1 semana)_

| Tarefa                                                                                     | Status         | Depende de           |
| ------------------------------------------------------------------------------------------ | -------------- | -------------------- |
| ✅ Configurar **Jest + RTL** (frontend) & **pytest** (backend) – coverage ≥ 80 %           | ✅ Done        | —                    |
| 🟡 Pipeline **CI/CD GitHub Actions → Railway** (lint → test → build → deploy)              | 🟡 In Progress | Testes automatizados |
| 🟡 Adicionar **Sentry** (front + back)                                                     | 🟡 In Progress | Pipeline CI/CD       |
| 🟡 Estruturar logs JSON (logrus/structlog)                                                 | 🟡 In Progress | Pipeline CI/CD       |
| 🟡 Configurar ambientes separados (dev/staging/prod) com variáveis de ambiente apropriadas | 🟡 In Progress | Pipeline CI/CD       |

---

## 🌊 Onda 2 – Experiência & Escala _(2-3 semanas)_

| Tarefa                                                                                        | Status   | Depende de        |
| --------------------------------------------------------------------------------------------- | -------- | ----------------- |
| ⬜ Migrar contextos pesados para **Zustand**                                                  | ⬜ To Do | Pipeline CI/CD    |
| ⬜ Otimizar performance (lazy loading, memoização, imagens)                                   | ⬜ To Do | Zustand migration |
| ⬜ Implementar fila **Celery + Redis** p/ OCR                                                 | ⬜ To Do | Logs & Sentry     |
| ⬜ Expor endpoint `/ocr/<id>/status` + WebSocket push                                         | ⬜ To Do | Celery + Redis    |
| ⬜ Integrar assinatura eletrônica (**Clicksign/D4Sign**)                                      | ⬜ To Do | Pipeline CI/CD    |
| ⬜ Implementar cache HTTP e otimização de consultas ao banco de dados para endpoints críticos | ⬜ To Do | Pipeline CI/CD    |

---

## 🌊 Onda 3 – Robustez de produção _(4-6 semanas)_

| Tarefa                                                                           | Status   | Depende de            |
| -------------------------------------------------------------------------------- | -------- | --------------------- |
| ⬜ Criar **Design System** (tokens + Storybook)                                  | ⬜ To Do | Zustand migration     |
| ⬜ Auditoria de acessibilidade (axe-core, NVDA, VoiceOver)                       | ⬜ To Do | Design System         |
| ⬜ Estratégia de **Backup & Disaster Recovery** (PostgreSQL snapshots + S3-like) | ⬜ To Do | Pipeline CI/CD        |
| ⬜ SEO & PWA (manifest, sitemap, LCP < 2.5 s)                                    | ⬜ To Do | Performance otimizada |
| ⬜ Auditoria de segurança (OWASP Top 10)                                         | ⬜ To Do | Pipeline CI/CD        |
| ⬜ Implementar monitoramento de performance de backend                           | ⬜ To Do | Logs estruturados     |
| ⬜ Configurar rate limiting/throttling para proteção contra abusos               | ⬜ To Do | Pipeline CI/CD        |
| ⬜ Implementar documentação técnica e de usuário                                 | ⬜ To Do | Design System         |
| ⬜ Configurar Analytics para métricas de negócio                                 | ⬜ To Do | Pipeline CI/CD        |

---

## 📈 Métricas de Saída

| Indicador                      | Meta para produção                   |
| ------------------------------ | ------------------------------------ |
| Test Coverage                  | ≥ 80 % front/back                    |
| LCP (mobile 4G)                | ≤ 2.5 s                              |
| Erros não tratados em produção | < 1 % das requisições                |
| Uptime Railway                 | ≥ 99.5 %                             |
| Conformidade WCAG              | Nível AA                             |
| Tempo médio de resposta da API | < 200ms para 95% das requisições     |
| Taxa de conversão do fluxo     | > 60% de conclusão por etapa         |
| Tempo médio processamento OCR  | < 5 segundos para 90% dos documentos |

---

## 🗂️ Referências Rápidas

- **Frontend**: React + TypeScript + Vite + Tailwind + Zustand
- **Backend**: Django REST Framework + Celery + PostgreSQL
- **Infra**: Docker • Railway • GitHub Actions
- **Observabilidade**: Sentry • Railway Logs
- **Assinatura Digital**: Clicksign / D4Sign
- **OCR**: Tesseract / AWS Textract (a confirmar)
- **Analytics**: Google Analytics / Mixpanel (a definir)

---

_Atualize este README sempre que mover tarefas entre estados ou adicionar novas exigências._  
**Vamos em frente!**
