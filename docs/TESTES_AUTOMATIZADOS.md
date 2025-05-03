# Estratégia de Testes Automatizados

## Plataforma de Pré-Análise de Crédito - Celebra Capital

---

## Índice

1. [Introdução](#introdução)
2. [Pirâmide de Testes](#pirâmide-de-testes)
3. [Testes Unitários](#testes-unitários)
4. [Testes de Integração](#testes-de-integração)
5. [Testes de API](#testes-de-api)
6. [Testes End-to-End](#testes-end-to-end)
7. [Testes de Performance](#testes-de-performance)
8. [Testes de Segurança](#testes-de-segurança)
9. [Infraestrutura de Testes](#infraestrutura-de-testes)
10. [Integração Contínua](#integração-contínua)
11. [Monitoramento e Métricas](#monitoramento-e-métricas)

---

## Introdução

Este documento descreve a estratégia de testes automatizados adotada para garantir a qualidade da Plataforma de Pré-Análise de Crédito da Celebra Capital. A abordagem visa identificar problemas o mais cedo possível no ciclo de desenvolvimento, reduzir riscos operacionais e assegurar uma experiência estável e confiável para os usuários.

A estratégia de testes foi elaborada considerando:

- A natureza crítica das transações financeiras
- Os requisitos regulatórios do setor financeiro
- A necessidade de proteger dados sensíveis dos clientes
- A importância da disponibilidade e performance da plataforma

## Pirâmide de Testes

Nossa estratégia segue o modelo de Pirâmide de Testes, com maior quantidade de testes nos níveis mais baixos e menor quantidade nos níveis mais altos:

```
    /\
   /  \
  /E2E \
 /      \
/  API   \
----------
/Integração\
------------
/  Unitários \
--------------
```

**Distribuição ideal:**

- Testes Unitários: 70%
- Testes de Integração: 20%
- Testes de API: 5%
- Testes End-to-End: 5%

## Testes Unitários

Os testes unitários verificam o comportamento correto das menores unidades de código em isolamento, geralmente funções ou métodos.

### Ferramentas

- **Frontend**: Jest e React Testing Library
- **Backend**: JUnit (Java), pytest (Python)
- **Cobertura**: Istanbul (JS), JaCoCo (Java), Coverage.py (Python)

### Padrões e Práticas

- **Nomenclatura**: `nomeDoMetodo_contexto_resultadoEsperado`
- **Organização**: Um arquivo de teste por classe/componente
- **Mocking**: Uso de mocks para isolar dependências externas
- **Cobertura mínima**: 80% de cobertura de código (linhas e branches)

### Exemplo de Teste Unitário (JavaScript/Jest)

```javascript
// calculadoraCredito.test.js
import { calcularTaxaJuros } from '../calculadoraCredito'

describe('calcularTaxaJuros', () => {
  test('deve retornar 1.5% para score acima de 800', () => {
    const resultado = calcularTaxaJuros({ score: 850, valorSolicitado: 50000 })
    expect(resultado).toBe(1.5)
  })

  test('deve retornar 2.5% para score entre 600 e 800', () => {
    const resultado = calcularTaxaJuros({ score: 700, valorSolicitado: 50000 })
    expect(resultado).toBe(2.5)
  })

  test('deve lançar erro para valores solicitados negativos', () => {
    expect(() => {
      calcularTaxaJuros({ score: 700, valorSolicitado: -1000 })
    }).toThrow('Valor solicitado deve ser positivo')
  })
})
```

### Exemplo de Teste Unitário (Java/JUnit)

```java
// AnaliseCreditoServiceTest.java
@RunWith(MockitoJUnitRunner.class)
public class AnaliseCreditoServiceTest {

    @Mock
    private ScoreRepository scoreRepository;

    @InjectMocks
    private AnaliseCreditoService analiseCreditoService;

    @Test
    public void avaliarProposta_clienteComScoreAlto_deveAprovar() {
        // Arrange
        PropostaDTO proposta = new PropostaDTO();
        proposta.setValorSolicitado(50000.0);
        proposta.setCpfCliente("123.456.789-00");

        when(scoreRepository.obterScorePorCpf("123.456.789-00")).thenReturn(850);

        // Act
        ResultadoAnaliseDTO resultado = analiseCreditoService.avaliarProposta(proposta);

        // Assert
        assertTrue(resultado.isAprovado());
        assertEquals(1.5, resultado.getTaxaJuros(), 0.01);
    }
}
```

## Testes de Integração

Os testes de integração verificam a interação entre diferentes módulos ou serviços, garantindo que funcionem corretamente em conjunto.

### Componentes Testados

- **Persistência**: Interação com banco de dados
- **Integrações Externas**: APIs de terceiros, bureaus de crédito
- **Filas e Mensageria**: Comunicação assíncrona
- **Cache**: Verificação de políticas de cache

### Ferramentas

- **Backend**: Spring Test, Testcontainers
- **Banco de Dados**: H2 (testes), PostgreSQL em containers
- **Mensageria**: Embedded Kafka, RabbitMQ em containers
- **APIs Externas**: WireMock, MockServer

### Exemplo de Teste de Integração (Spring/Java)

```java
// PropostaRepositoryIntegrationTest.java
@SpringBootTest
@Testcontainers
public class PropostaRepositoryIntegrationTest {

    @Container
    public static PostgreSQLContainer<?> postgresContainer = new PostgreSQLContainer<>("postgres:13")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private PropostaRepository propostaRepository;

    @Test
    public void deveSalvarERecuperarProposta() {
        // Arrange
        Proposta proposta = new Proposta();
        proposta.setValorSolicitado(50000.0);
        proposta.setStatus(StatusProposta.EM_ANALISE);

        // Act
        Proposta saved = propostaRepository.save(proposta);
        Optional<Proposta> found = propostaRepository.findById(saved.getId());

        // Assert
        assertTrue(found.isPresent());
        assertEquals(50000.0, found.get().getValorSolicitado(), 0.01);
        assertEquals(StatusProposta.EM_ANALISE, found.get().getStatus());
    }
}
```

## Testes de API

Os testes de API verificam os endpoints REST da aplicação, garantindo contratos, validações e respostas corretas.

### Abordagem

- **Teste de Contrato**: Verificação de schemas e formatos de resposta
- **Sequência de Requisições**: Fluxos de negócio via API
- **Casos de Erro**: Validação de respostas para entradas inválidas
- **Autenticação e Autorização**: Testes de segurança da API

### Ferramentas

- **Postman/Newman**: Coleções de testes automatizados
- **REST Assured**: Testes de API em Java
- **SuperTest**: Testes de API em Node.js
- **Swagger/OpenAPI**: Validação de contrato

### Exemplo de Teste de API (REST Assured/Java)

```java
// PropostaApiTest.java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public class PropostaApiTest {

    @LocalServerPort
    private int port;

    private String baseUrl;

    @BeforeEach
    public void setup() {
        baseUrl = "http://localhost:" + port + "/api";
    }

    @Test
    public void criarProposta_dadosValidos_deveRetornarCreated() {
        // Arrange
        PropostaDTO proposta = new PropostaDTO();
        proposta.setValorSolicitado(50000.0);
        proposta.setCpfCliente("123.456.789-00");

        // Act & Assert
        given()
            .contentType(ContentType.JSON)
            .body(proposta)
        .when()
            .post(baseUrl + "/propostas")
        .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("status", equalTo("EM_ANALISE"));
    }

    @Test
    public void criarProposta_cpfInvalido_deveRetornarBadRequest() {
        // Arrange
        PropostaDTO proposta = new PropostaDTO();
        proposta.setValorSolicitado(50000.0);
        proposta.setCpfCliente("123.456.789-XX");

        // Act & Assert
        given()
            .contentType(ContentType.JSON)
            .body(proposta)
        .when()
            .post(baseUrl + "/propostas")
        .then()
            .statusCode(400)
            .body("mensagem", containsString("CPF inválido"));
    }
}
```

## Testes End-to-End

Os testes E2E simulam o comportamento real do usuário, verificando a aplicação como um todo.

### Cenários Prioritários

1. **Jornada de Proposta**:

   - Cadastro de usuário
   - Login na plataforma
   - Criação de proposta
   - Upload de documentos
   - Assinatura digital
   - Visualização de status

2. **Jornada Administrativa**:
   - Login como administrador
   - Análise de proposta
   - Solicitação de documentos adicionais
   - Aprovação/rejeição de proposta
   - Geração de relatórios

### Ferramentas

- **Cypress**: Testes E2E para web
- **Selenium**: Para casos complexos ou sistemas legados
- **Playwright**: Testes cross-browser
- **BDD**: Cucumber para cenários em linguagem natural

### Exemplo de Teste E2E (Cypress)

```javascript
// cypress/integration/proposta.spec.js
describe('Criação de Proposta', () => {
  beforeEach(() => {
    cy.login('usuario@teste.com', 'senha123')
  })

  it('Deve criar uma proposta com sucesso', () => {
    // Navegação para criação de proposta
    cy.get('[data-testid=menu-propostas]').click()
    cy.get('[data-testid=nova-proposta]').click()

    // Seleção do tipo de proposta
    cy.get('[data-testid=tipo-proposta]').select('Crédito Pessoal')
    cy.get('[data-testid=continuar]').click()

    // Preenchimento de dados
    cy.get('[data-testid=valor-solicitado]').type('50000')
    cy.get('[data-testid=prazo]').select('36')
    cy.get('[data-testid=finalidade]').select('Reforma')
    cy.get('[data-testid=continuar]').click()

    // Upload de documento
    cy.get('[data-testid=upload-documento]').attachFile('comprovante_renda.pdf')
    cy.get('[data-testid=enviar-documento]').click()
    cy.get('[data-testid=status-upload]').should(
      'contain',
      'Enviado com sucesso'
    )
    cy.get('[data-testid=continuar]').click()

    // Revisão e envio
    cy.get('[data-testid=termos]').check()
    cy.get('[data-testid=enviar-proposta]').click()

    // Verificação de sucesso
    cy.get('[data-testid=mensagem-sucesso]').should('be.visible')
    cy.get('[data-testid=numero-protocolo]').should('exist')
  })
})
```

## Testes de Performance

Os testes de performance avaliam o comportamento da aplicação sob carga, identificando gargalos e limites operacionais.

### Tipos de Testes

- **Teste de Carga**: Verificar comportamento com volume normal/esperado
- **Teste de Estresse**: Verificar comportamento com volumes acima do esperado
- **Teste de Resistência**: Verificar comportamento com uso prolongado
- **Teste de Pico**: Verificar comportamento com aumentos súbitos de tráfego

### Métricas Monitoradas

- **Tempo de Resposta**: Latência média, percentis (P95, P99)
- **Throughput**: Requisições por segundo
- **Utilização de Recursos**: CPU, memória, I/O, banco de dados
- **Erros**: Taxa de erros sob carga

### Ferramentas

- **JMeter**: Testes de carga para APIs e serviços
- **Gatling**: Testes de carga com scripting avançado
- **k6**: Testes modernos baseados em JavaScript
- **New Relic/Datadog**: Monitoramento em tempo real durante testes

### Exemplo de Script de Teste de Carga (k6)

```javascript
// scripts/load-test-api.js
import http from 'k6/http'
import { sleep, check } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp-up para 100 usuários
    { duration: '5m', target: 100 }, // Carga constante
    { duration: '2m', target: 0 }, // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições devem responder em menos de 500ms
    http_req_failed: ['rate<0.01'], // Menos de 1% de falhas
  },
}

export default function () {
  const BASE_URL = 'https://api-hml.celebracapital.com.br/v1'
  const payload = JSON.stringify({
    cliente: {
      documento: `123456789${Math.floor(Math.random() * 10)}`,
      nome: 'Teste Performance',
    },
    proposta: {
      valorSolicitado: 50000,
      parcelas: 36,
    },
  })

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${__ENV.API_TOKEN}`,
    },
  }

  // Criação de proposta
  const res = http.post(`${BASE_URL}/propostas`, payload, params)

  check(res, {
    'status é 201': (r) => r.status === 201,
    'tem ID de proposta': (r) => r.json().id !== undefined,
  })

  sleep(3)
}
```

## Testes de Segurança

Os testes de segurança identificam vulnerabilidades e problemas de proteção de dados na plataforma.

### Categorias de Testes

- **OWASP Top 10**: Verificação das vulnerabilidades mais comuns
- **Análise Estática de Código**: Identificação de problemas no código
- **Análise de Dependências**: Verificação de bibliotecas vulneráveis
- **Testes de Penetração**: Simulação de ataques reais
- **Análise de Configuração**: Verificação de hardening e configurações seguras

### Ferramentas

- **SAST**: SonarQube, Checkmarx
- **DAST**: OWASP ZAP, Burp Suite
- **Dependency Check**: OWASP Dependency-Check, Snyk
- **Vulnerabilidades de Infraestrutura**: Nessus, OpenVAS
- **Conformidade de Configuração**: AWS Config, Azure Policy

### Exemplo de Configuração (OWASP ZAP via CI/CD)

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * 1' # Toda segunda-feira às 2h
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  zap_scan:
    runs-on: ubuntu-latest
    name: OWASP ZAP Scan
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: ZAP Scan
        uses: zaproxy/action-baseline@v0.6.1
        with:
          target: 'https://api-hml.celebracapital.com.br'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'

      - name: Upload ZAP Report
        uses: actions/upload-artifact@v2
        with:
          name: ZAP-Report
          path: report.html
```

## Infraestrutura de Testes

### Ambientes de Teste

1. **Ambiente de Desenvolvimento**:

   - Testes unitários e de integração durante desenvolvimento
   - Mocks para dependências externas
   - Feedback rápido para desenvolvedores

2. **Ambiente de QA**:

   - Testes integrados completos
   - Versão replicada da infraestrutura de produção
   - Execução diária de todos os testes

3. **Ambiente de Homologação**:

   - Testes de aceitação do usuário
   - Testes de performance programados
   - Simulação de cenários de produção

4. **Ambiente de Produção**:
   - Testes de smoke após deploy
   - Monitoramento contínuo
   - Testes canários para novas features

### Gestão de Dados de Teste

- **Geração de Dados**: Faker, DataFactory
- **Anonimização**: Mascaramento de dados reais para testes
- **Cenários de Teste**: Catálogo de dados pré-configurados
- **Reset de Dados**: Limpeza e restauração entre testes

### Exemplo de Geração de Dados de Teste (Java)

```java
// TestDataFactory.java
public class TestDataFactory {

    private static final Faker faker = new Faker(new Locale("pt-BR"));

    public static Cliente criarClientePF() {
        Cliente cliente = new Cliente();
        cliente.setNome(faker.name().fullName());
        cliente.setCpf(geradorCPFValido());
        cliente.setEmail(faker.internet().emailAddress());
        cliente.setTelefone(faker.phoneNumber().cellPhone());
        cliente.setRendaMensal(faker.number().randomDouble(2, 3000, 30000));
        return cliente;
    }

    public static Proposta criarPropostaValida(Cliente cliente) {
        Proposta proposta = new Proposta();
        proposta.setCliente(cliente);
        proposta.setValorSolicitado(faker.number().randomDouble(2, 5000, 100000));
        proposta.setParcelas(faker.options().option(12, 24, 36, 48, 60));
        proposta.setFinalidade(faker.options().option(Finalidade.values()));
        return proposta;
    }

    private static String geradorCPFValido() {
        // Implementação de algoritmo para gerar CPF válido
        // ...
    }
}
```

## Integração Contínua

A integração contínua automatiza a execução de testes a cada alteração no código, garantindo feedback rápido.

### Pipeline de CI/CD

```
Commit → Build → Testes Unitários → Testes de Integração → Análise de Código → Build de Artefatos → Deploy em QA → Testes E2E → Deploy em Homologação → Testes de Performance → Deploy em Produção → Testes de Smoke
```

### Ferramentas

- **CI/CD**: Jenkins, GitHub Actions, GitLab CI
- **Análise de Código**: SonarQube, Codacy
- **Gestão de Artefatos**: Nexus, Artifactory
- **Orquestração de Testes**: TestNG, JUnit Platform

### Exemplo de Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Set up JDK 11
        uses: actions/setup-java@v2
        with:
          java-version: '11'
          distribution: 'adopt'

      - name: Build with Maven
        run: mvn -B package --file pom.xml

      - name: Run Tests
        run: mvn -B test

      - name: SonarQube Analysis
        run: mvn sonar:sonar -Dsonar.projectKey=celebra-capital -Dsonar.host.url=${{ secrets.SONAR_URL }} -Dsonar.login=${{ secrets.SONAR_TOKEN }}

      - name: Build and push Docker image
        if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
        uses: docker/build-push-action@v2
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKER_REGISTRY }}/celebra-api:${{ github.ref == 'refs/heads/main' && 'latest' || 'develop' }}

      - name: Deploy to QA
        if: github.ref == 'refs/heads/develop'
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.QA_HOST }}
          username: ${{ secrets.QA_USERNAME }}
          key: ${{ secrets.QA_SSH_KEY }}
          script: |
            cd /opt/celebra
            docker-compose pull
            docker-compose up -d

      - name: Run E2E Tests
        if: github.ref == 'refs/heads/develop'
        run: npx cypress run --config baseUrl=https://api-qa.celebracapital.com.br
```

## Monitoramento e Métricas

O monitoramento contínuo dos testes fornece insights sobre a qualidade do software ao longo do tempo.

### Métricas de Qualidade

- **Taxa de Sucesso**: % de testes que passam
- **Cobertura de Código**: % de código coberto por testes
- **Dívida Técnica**: Estimativa de problemas de qualidade
- **Tempo de Ciclo**: Tempo desde o commit até o deploy
- **MTTR**: Tempo médio para resolver testes quebrados

### Dashboards e Relatórios

- **Dashboard de Qualidade**: Métricas consolidadas
- **Relatórios de Regressão**: Comparação entre builds
- **Alertas de Quebra**: Notificações em tempo real
- **Tendências**: Evolução das métricas ao longo do tempo

### Exemplo de Dashboard (DataDog)

![Exemplo Dashboard](https://assets.datadog.com/img/blog/engineering/quality-ci-cd-at-scale/dashboard.jpg)

O dashboard inclui:

- Taxa de sucesso dos testes por tipo
- Tempo de execução da pipeline
- Cobertura de código por serviço
- Tendências de qualidade ao longo do tempo
- Alertas e incidentes ativos

---

_Este documento é atualizado regularmente. Última atualização: Julho 2023._

Para sugestões ou dúvidas sobre a estratégia de testes, entre em contato com qualidade@celebracapital.com.br.
