import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    // Atualizar o título da página
    document.title = 'Política de Privacidade | Celebra Capital'

    // Atualizar a meta descrição
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Política de Privacidade da Celebra Capital - Conheça como protegemos seus dados pessoais'
      )
    } else {
      const newMetaDescription = document.createElement('meta')
      newMetaDescription.name = 'description'
      newMetaDescription.content =
        'Política de Privacidade da Celebra Capital - Conheça como protegemos seus dados pessoais'
      document.head.appendChild(newMetaDescription)
    }

    // Cleanup function
    return () => {
      document.title = 'Celebra Capital'
    }
  }, [])

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link
          to="/"
          className="flex items-center mb-6 text-blue-600 hover:text-blue-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Voltar ao início
        </Link>

        <header className="mb-10">
          <img src="/logo.svg" alt="Celebra Capital" className="h-12 mb-4" />
          <h1
            className="text-3xl font-bold text-blue-800 mb-2"
            data-testid="privacy-title"
          >
            Política de Privacidade
          </h1>
          <p className="text-gray-600" data-testid="privacy-last-updated">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-10">
          <section className="mb-8" data-testid="privacy-intro">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              Introdução
            </h2>
            <p className="mb-4 text-gray-700">
              A Celebra Capital valoriza a privacidade de seus usuários e está
              comprometida com a transparência no tratamento de dados pessoais.
              Esta Política de Privacidade descreve como coletamos, usamos,
              compartilhamos e protegemos suas informações quando você utiliza
              nossa Plataforma de Pré-Análise de Crédito.
            </p>
            <p className="mb-4 text-gray-700">
              Esta política foi elaborada em conformidade com a Lei Federal nº
              13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD) e com
              as demais normas aplicáveis.
            </p>
            <p className="text-gray-700">
              Ao utilizar nossos serviços, você reconhece que leu, entendeu e
              concorda com os termos desta Política de Privacidade.
            </p>
          </section>

          <section className="mb-8" data-testid="privacy-definitions">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              1. Definições
            </h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>
                <strong>Dados Pessoais:</strong> Informações relacionadas a uma
                pessoa natural identificada ou identificável.
              </li>
              <li>
                <strong>Dados Pessoais Sensíveis:</strong> Dados pessoais sobre
                origem racial ou étnica, convicção religiosa, opinião política,
                filiação a sindicato ou a organização de caráter religioso,
                filosófico ou político, dados referentes à saúde ou à vida
                sexual, dados genéticos ou biométricos.
              </li>
              <li>
                <strong>Tratamento:</strong> Toda operação realizada com dados
                pessoais, como coleta, produção, recepção, classificação,
                utilização, acesso, reprodução, transmissão, distribuição,
                processamento, arquivamento, armazenamento, eliminação,
                avaliação, controle, modificação, comunicação, transferência,
                difusão ou extração.
              </li>
              <li>
                <strong>Titular:</strong> Pessoa natural a quem se referem os
                dados pessoais que são objeto de tratamento.
              </li>
              <li>
                <strong>Controlador:</strong> A Celebra Capital, responsável
                pelas decisões referentes ao tratamento de dados pessoais.
              </li>
              <li>
                <strong>Operador:</strong> Parte que realiza o tratamento de
                dados pessoais em nome do controlador.
              </li>
            </ul>
          </section>

          <section className="mb-8" data-testid="data-collection">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              2. Coleta de Dados Pessoais
            </h2>
            <div className="mb-4">
              <h3 className="text-xl font-medium text-blue-600 mb-2">
                2.1. Dados que você nos fornece diretamente
              </h3>
              <p className="mb-2 text-gray-700">
                Coletamos os seguintes dados quando você se cadastra ou utiliza
                nossa plataforma:
              </p>
              <ul className="list-disc ml-6 space-y-1 text-gray-700">
                <li>
                  <strong>Dados de Identificação:</strong> nome completo, CPF,
                  RG, data de nascimento, gênero, estado civil, nacionalidade.
                </li>
                <li>
                  <strong>Dados de Contato:</strong> endereço residencial,
                  e-mail, telefone.
                </li>
                <li>
                  <strong>Dados Profissionais:</strong> ocupação, empregador,
                  cargo, matrícula funcional, tempo de serviço.
                </li>
                <li>
                  <strong>Dados Financeiros:</strong> renda, dados bancários,
                  histórico de crédito, dívidas atuais, comprovantes de renda.
                </li>
                <li>
                  <strong>Documentos:</strong> cópias de documentos de
                  identificação, comprovantes de renda e residência.
                </li>
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-medium text-blue-600 mb-2">
                2.2. Dados coletados automaticamente
              </h3>
              <p className="mb-2 text-gray-700">
                Quando você utiliza nossa plataforma, coletamos automaticamente:
              </p>
              <ul className="list-disc ml-6 space-y-1 text-gray-700">
                <li>
                  <strong>Dados de Uso:</strong> informações sobre como você
                  interage com nossa plataforma, incluindo páginas visitadas,
                  tempo de permanência, ações realizadas.
                </li>
                <li>
                  <strong>Dados de Dispositivo:</strong> tipo de dispositivo,
                  sistema operacional, navegador, endereço IP, identificadores
                  de dispositivo.
                </li>
                <li>
                  <strong>Dados de Localização:</strong> localização geográfica
                  aproximada com base no seu endereço IP.
                </li>
                <li>
                  <strong>Cookies e Tecnologias Semelhantes:</strong> dados
                  coletados através de cookies, web beacons e tecnologias
                  similares.
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8" data-testid="data-usage">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              3. Finalidades do Tratamento
            </h2>
            <p className="mb-4 text-gray-700">
              Tratamos seus dados pessoais para as seguintes finalidades:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>
                <strong>Prestação de Serviços:</strong> para processar sua
                solicitação de análise de crédito, verificar sua elegibilidade,
                calcular limites de crédito, avaliar riscos e tomar decisões
                sobre sua proposta.
              </li>
              <li>
                <strong>Comunicação:</strong> para enviar notificações sobre o
                status da sua solicitação, fornecer suporte ao cliente,
                responder a dúvidas e solicitações.
              </li>
              <li>
                <strong>Prevenção à Fraude:</strong> para verificar sua
                identidade, detectar e prevenir atividades fraudulentas,
                protegendo você e nossa plataforma.
              </li>
              <li>
                <strong>Cumprimento Legal:</strong> para cumprir obrigações
                legais e regulatórias, incluindo leis antimoney laundering, leis
                de proteção ao consumidor e regulamentos do setor financeiro.
              </li>
              <li>
                <strong>Melhoria de Serviços:</strong> para analisar o
                desempenho da plataforma, desenvolver novos produtos e
                funcionalidades, melhorar a experiência do usuário.
              </li>
              <li>
                <strong>Marketing:</strong> para enviar informações sobre
                produtos e serviços que possam ser de seu interesse, desde que
                você tenha consentido com esse tipo de comunicação.
              </li>
            </ul>
          </section>

          <section className="mb-8" data-testid="data-sharing">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              4. Compartilhamento de Dados
            </h2>
            <p className="mb-4 text-gray-700">
              Podemos compartilhar seus dados pessoais com as seguintes
              categorias de destinatários:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>
                <strong>Instituições Financeiras Parceiras:</strong> para
                processar sua solicitação de crédito e oferecer oportunidades de
                financiamento.
              </li>
              <li>
                <strong>Prestadores de Serviços:</strong> empresas que nos
                auxiliam na operação da plataforma, como serviços de hospedagem,
                análise de dados, processamento de pagamentos, atendimento ao
                cliente e prevenção à fraude.
              </li>
              <li>
                <strong>Bureaus de Crédito:</strong> para verificar seu
                histórico de crédito e score como parte do processo de análise.
              </li>
              <li>
                <strong>Autoridades Governamentais:</strong> quando exigido por
                lei, ordem judicial ou regulamentos aplicáveis.
              </li>
            </ul>
            <p className="mt-4 text-gray-700">
              Sempre que compartilhamos seus dados, exigimos que os terceiros
              mantenham a confidencialidade e segurança das informações e as
              utilizem apenas para as finalidades especificadas.
            </p>
          </section>

          <section className="mb-8" data-testid="data-security">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              5. Segurança dos Dados
            </h2>
            <p className="mb-4 text-gray-700">
              A Celebra Capital implementa medidas técnicas e organizacionais
              apropriadas para proteger seus dados pessoais contra acesso não
              autorizado, perda, alteração ou divulgação indevida. Estas medidas
              incluem:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controles de acesso rigorosos</li>
              <li>Monitoramento contínuo de sistemas</li>
              <li>Treinamento regular dos funcionários sobre segurança</li>
              <li>
                Avaliações periódicas de vulnerabilidades e testes de penetração
              </li>
              <li>
                Plano de resposta a incidentes para lidar com possíveis
                violações de dados
              </li>
            </ul>
            <p className="mt-4 text-gray-700">
              No entanto, nenhum sistema é completamente seguro. Embora nos
              esforcemos para proteger seus dados, não podemos garantir a
              segurança absoluta das informações transmitidas ou armazenadas em
              nossos sistemas.
            </p>
          </section>

          <section className="mb-8" data-testid="user-rights">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              6. Seus Direitos
            </h2>
            <p className="mb-4 text-gray-700">
              De acordo com a Lei Geral de Proteção de Dados Pessoais (LGPD),
              você tem os seguintes direitos em relação aos seus dados pessoais:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>
                <strong>Confirmação e Acesso:</strong> direito de confirmar a
                existência de tratamento e acessar seus dados pessoais.
              </li>
              <li>
                <strong>Correção:</strong> direito de solicitar a correção de
                dados incompletos, inexatos ou desatualizados.
              </li>
              <li>
                <strong>Anonimização, Bloqueio ou Eliminação:</strong> direito
                de solicitar a anonimização, bloqueio ou eliminação de dados
                desnecessários, excessivos ou tratados em desconformidade com a
                LGPD.
              </li>
              <li>
                <strong>Portabilidade:</strong> direito de solicitar a
                portabilidade dos dados a outro fornecedor de serviço ou
                produto.
              </li>
              <li>
                <strong>Eliminação:</strong> direito de solicitar a eliminação
                dos dados tratados com o seu consentimento.
              </li>
              <li>
                <strong>Informação:</strong> direito de ser informado sobre as
                entidades públicas e privadas com as quais seus dados foram
                compartilhados.
              </li>
              <li>
                <strong>Revogação do Consentimento:</strong> direito de revogar
                o consentimento a qualquer momento.
              </li>
              <li>
                <strong>Revisão de Decisões Automatizadas:</strong> direito de
                solicitar a revisão de decisões tomadas unicamente com base em
                tratamento automatizado de dados pessoais.
              </li>
            </ul>
            <p className="mt-4 text-gray-700">
              Para exercer esses direitos, entre em contato conosco através dos
              canais indicados no final desta política.
            </p>
          </section>

          <section className="mb-8" data-testid="cookies-policy">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              7. Política de Cookies
            </h2>
            <p className="mb-4 text-gray-700">
              Usamos cookies e tecnologias semelhantes para melhorar sua
              experiência em nossa plataforma. Cookies são pequenos arquivos de
              texto armazenados no seu dispositivo quando você visita um site.
            </p>
            <p className="mb-4 text-gray-700">
              Utilizamos os seguintes tipos de cookies:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>
                <strong>Cookies Necessários:</strong> essenciais para o
                funcionamento básico da plataforma, permitindo recursos como
                navegação e acesso a áreas seguras.
              </li>
              <li>
                <strong>Cookies de Preferências:</strong> permitem que a
                plataforma lembre informações que mudam a forma como ela se
                comporta ou aparece.
              </li>
              <li>
                <strong>Cookies Estatísticos:</strong> ajudam a entender como os
                visitantes interagem com a plataforma, coletando e relatando
                informações anonimamente.
              </li>
              <li>
                <strong>Cookies de Marketing:</strong> usados para rastrear
                visitantes em diferentes sites e coletar informações para
                fornecer anúncios personalizados.
              </li>
            </ul>
            <p className="mt-4 text-gray-700">
              Você pode configurar seu navegador para recusar todos ou alguns
              cookies, ou para alertá-lo quando sites definem ou acessam
              cookies. Observe que, se você desativar ou recusar cookies,
              algumas partes da plataforma podem se tornar inacessíveis ou não
              funcionar adequadamente.
            </p>
          </section>

          <section className="mb-8" data-testid="data-retention">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              8. Retenção de Dados
            </h2>
            <p className="mb-4 text-gray-700">
              Armazenamos seus dados pessoais pelo tempo necessário para cumprir
              as finalidades para as quais foram coletados, incluindo o
              atendimento de obrigações legais, contábeis ou de relatórios.
            </p>
            <p className="mb-4 text-gray-700">
              O período de retenção varia de acordo com o tipo de dado e sua
              finalidade:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>
                Dados relacionados a propostas de crédito: até 5 anos após o
                término da relação contratual ou após a última interação, o que
                for mais longo.
              </li>
              <li>
                Dados de cadastro: enquanto a conta estiver ativa e por até 5
                anos após o seu encerramento.
              </li>
              <li>
                Dados para fins de marketing: até que você solicite sua exclusão
                ou revogue seu consentimento.
              </li>
              <li>
                Logs de acesso: pelo mínimo de 6 meses, conforme exigido pelo
                Marco Civil da Internet.
              </li>
            </ul>
            <p className="mt-4 text-gray-700">
              Após o período de retenção, seus dados serão excluídos ou
              anonimizados, a menos que exista uma base legal para sua
              manutenção.
            </p>
          </section>

          <section className="mb-8" data-testid="international-transfers">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              9. Transferências Internacionais de Dados
            </h2>
            <p className="mb-4 text-gray-700">
              Alguns dos nossos prestadores de serviços e parceiros podem estar
              localizados fora do Brasil. Quando transferimos seus dados para
              outros países, adotamos medidas para garantir que eles recebam um
              nível adequado de proteção, incluindo:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>
                Transferências para países com nível adequado de proteção
                reconhecido pela Autoridade Nacional de Proteção de Dados (ANPD)
              </li>
              <li>
                Uso de cláusulas contratuais específicas aprovadas pela ANPD
              </li>
              <li>
                Obtenção de certificações e garantias de conformidade com normas
                internacionais de proteção de dados
              </li>
            </ul>
            <p className="mt-4 text-gray-700">
              Ao utilizar nossa plataforma, você consente com a transferência de
              seus dados para outros países, desde que observadas as medidas de
              segurança descritas nesta política.
            </p>
          </section>

          <section className="mb-8" data-testid="privacy-changes">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              10. Alterações nesta Política
            </h2>
            <p className="mb-4 text-gray-700">
              Podemos atualizar esta Política de Privacidade periodicamente para
              refletir alterações em nossas práticas de privacidade ou mudanças
              na legislação aplicável. A versão mais recente estará sempre
              disponível em nossa plataforma, com a data da última atualização.
            </p>
            <p className="mb-4 text-gray-700">
              Recomendamos que você revise esta política regularmente para se
              manter informado sobre como protegemos suas informações.
            </p>
            <p className="text-gray-700">
              Em caso de alterações significativas, podemos notificá-lo por
              e-mail ou através de um aviso em destaque na plataforma antes que
              as alterações entrem em vigor.
            </p>
          </section>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">
            Contato do Encarregado de Proteção de Dados (DPO)
          </h2>
          <p className="mb-4 text-gray-700">
            Para exercer seus direitos ou obter mais informações sobre nossas
            práticas de privacidade, entre em contato com nosso Encarregado de
            Proteção de Dados:
          </p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li>Nome: Departamento de Privacidade e Proteção de Dados</li>
            <li>E-mail: dpo@celebracapital.com.br</li>
            <li>Telefone: (11) 3456-7890</li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            to="/termos-de-uso"
            className="text-blue-600 hover:text-blue-800"
            data-testid="terms-of-use-link"
          >
            Ver nossos Termos de Uso
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
