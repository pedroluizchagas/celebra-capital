import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

const TermsOfUse: React.FC = () => {
  useEffect(() => {
    // Atualizar o título da página
    document.title = 'Termos de Uso | Celebra Capital'

    // Atualizar a meta descrição
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Termos de Uso da Celebra Capital - Conheça as regras e condições para utilização da nossa plataforma'
      )
    } else {
      const newMetaDescription = document.createElement('meta')
      newMetaDescription.name = 'description'
      newMetaDescription.content =
        'Termos de Uso da Celebra Capital - Conheça as regras e condições para utilização da nossa plataforma'
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
            data-testid="terms-title"
          >
            Termos de Uso
          </h1>
          <p className="text-gray-600" data-testid="terms-last-updated">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-10">
          <section className="mb-8" data-testid="terms-acceptance">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              1. Aceitação dos Termos
            </h2>
            <p className="mb-4 text-gray-700">
              Bem-vindo à Plataforma de Pré-Análise de Crédito da Celebra
              Capital. Ao acessar ou utilizar nossa plataforma, você reconhece
              que leu, entendeu e concorda em cumprir estes Termos de Uso e
              todas as leis e regulamentos aplicáveis. Se você não concordar com
              estes termos, não utilize nossos serviços.
            </p>
            <p className="mb-4 text-gray-700">
              Estes Termos de Uso constituem um acordo legalmente vinculativo
              entre você (seja pessoa física ou jurídica) e a Celebra Capital,
              referente ao uso da Plataforma de Pré-Análise de Crédito.
            </p>
            <p className="text-gray-700">
              A Celebra Capital reserva-se o direito de modificar estes termos a
              qualquer momento, a seu exclusivo critério. As alterações entrarão
              em vigor imediatamente após sua publicação na plataforma. O uso
              continuado dos serviços após tais modificações constitui sua
              aceitação dos novos termos.
            </p>
          </section>

          <section className="mb-8" data-testid="terms-description">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              2. Descrição dos Serviços
            </h2>
            <p className="mb-4 text-gray-700">
              A Plataforma de Pré-Análise de Crédito da Celebra Capital oferece
              serviços de análise preliminar de crédito para servidores
              públicos, aposentados e pensionistas. Nossos serviços incluem, mas
              não se limitam a:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>
                Coleta e processamento de informações pessoais e financeiras
                para análise
              </li>
              <li>Upload e verificação de documentos necessários</li>
              <li>Assinatura digital de documentos e contratos</li>
              <li>Comunicação sobre o status da solicitação de crédito</li>
              <li>
                Integração com bureaus de crédito e instituições financeiras
                parceiras
              </li>
              <li>Acompanhamento do processo de análise de crédito</li>
            </ul>
            <p className="mt-4 text-gray-700">
              A Celebra Capital atua como intermediária entre você e as
              instituições financeiras. Não somos uma instituição financeira e
              não concedemos empréstimos ou financiamentos diretamente. Nossa
              função é facilitar o processo de análise e aprovação de crédito
              junto às instituições parceiras.
            </p>
          </section>

          <section className="mb-8" data-testid="terms-rules">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              3. Elegibilidade
            </h2>
            <p className="mb-4 text-gray-700">
              Para utilizar nossos serviços, você deve:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Ser maior de 18 anos e possuir capacidade civil plena</li>
              <li>Ser servidor público, aposentado ou pensionista</li>
              <li>
                Possuir documentação válida e completa conforme solicitado
              </li>
              <li>Ter capacidade legal para celebrar contratos</li>
              <li>Possuir CPF válido e regular</li>
              <li>Ter residência fixa no território brasileiro</li>
              <li>
                Possuir conta bancária em seu nome em banco operante no Brasil
              </li>
            </ul>
            <p className="mt-4 text-gray-700">
              A Celebra Capital se reserva o direito de verificar a
              elegibilidade de qualquer usuário e recusar o acesso à plataforma
              ou à prestação dos serviços a qualquer pessoa, a qualquer momento,
              a seu exclusivo critério.
            </p>
          </section>

          <section className="mb-8" data-testid="terms-account">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              4. Cadastro e Conta
            </h2>
            <p className="mb-4 text-gray-700">
              Para utilizar nossa plataforma, é necessário criar uma conta
              fornecendo informações precisas e completas. Você é responsável
              por:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>
                Fornecer informações verdadeiras, precisas, atuais e completas
                sobre si mesmo
              </li>
              <li>
                Manter e atualizar prontamente suas informações para mantê-las
                verdadeiras, precisas, atuais e completas
              </li>
              <li>
                Manter a confidencialidade de suas credenciais de acesso (login
                e senha)
              </li>
              <li>
                Notificar imediatamente a Celebra Capital sobre qualquer uso não
                autorizado de sua conta ou qualquer outra violação de segurança
              </li>
              <li>
                Assumir total responsabilidade por todas as atividades que
                ocorram em sua conta
              </li>
            </ul>
            <p className="mt-4 text-gray-700">
              A Celebra Capital não será responsável por quaisquer perdas ou
              danos decorrentes do seu descumprimento quanto à segurança e
              confidencialidade das suas credenciais de acesso.
            </p>
          </section>

          <section className="mb-8" data-testid="terms-usage">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              5. Uso da Plataforma
            </h2>
            <p className="mb-4 text-gray-700">
              Ao utilizar nossa plataforma, você concorda em:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>
                Utilizar a plataforma apenas para fins legais e de acordo com
                estes Termos de Uso
              </li>
              <li>
                Não utilizar a plataforma para fins fraudulentos ou para
                realizar atividades ilegais
              </li>
              <li>
                Não tentar acessar áreas restritas da plataforma sem autorização
              </li>
              <li>
                Não interferir ou interromper o funcionamento normal da
                plataforma
              </li>
              <li>
                Não tentar enganar ou fornecer informações falsas para obter
                vantagens indevidas
              </li>
              <li>
                Não utilizar a plataforma para disseminar conteúdo ofensivo,
                difamatório, obsceno ou ilegal
              </li>
              <li>
                Não realizar engenharia reversa, descompilar ou tentar obter o
                código fonte da plataforma
              </li>
            </ul>
          </section>

          <section className="mb-8" data-testid="terms-liability">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              6. Responsabilidades
            </h2>
            <div className="mb-4">
              <h3 className="text-xl font-medium text-blue-600 mb-2">
                6.1. Responsabilidades da Celebra Capital
              </h3>
              <p className="mb-4 text-gray-700">
                A Celebra Capital se compromete a:
              </p>
              <ul className="list-disc ml-6 space-y-1 text-gray-700">
                <li>
                  Manter a plataforma funcionando adequadamente, dentro das
                  possibilidades técnicas
                </li>
                <li>
                  Proteger as informações dos usuários conforme nossa Política
                  de Privacidade
                </li>
                <li>
                  Processar as solicitações de análise de crédito com eficiência
                  e transparência
                </li>
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-medium text-blue-600 mb-2">
                6.2. Limitação de Responsabilidade
              </h3>
              <p className="mb-4 text-gray-700">
                A Celebra Capital não se responsabiliza por:
              </p>
              <ul className="list-disc ml-6 space-y-1 text-gray-700">
                <li>Falhas no acesso à internet pelo usuário</li>
                <li>Problemas técnicos em equipamentos ou redes do usuário</li>
                <li>
                  Decisões tomadas pelas instituições financeiras parceiras
                </li>
                <li>
                  Perdas ou danos resultantes de informações incorretas
                  fornecidas pelo usuário
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8" data-testid="terms-modifications">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              7. Modificações dos Termos
            </h2>
            <p className="mb-4 text-gray-700">
              A Celebra Capital poderá modificar estes Termos de Uso a qualquer
              tempo, a seu exclusivo critério, mediante a publicação da versão
              atualizada na plataforma. As modificações entrarão em vigor
              imediatamente após sua publicação.
            </p>
            <p className="mb-4 text-gray-700">
              Recomendamos que você verifique regularmente esta página para se
              manter informado sobre eventuais alterações. O uso continuado da
              plataforma após a publicação de modificações significa que você
              aceita e concorda com as alterações.
            </p>
            <p className="text-gray-700">
              Caso você não concorde com os novos termos, deverá interromper o
              uso da plataforma.
            </p>
          </section>

          <section className="mb-8" data-testid="terms-termination">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              8. Rescisão
            </h2>
            <p className="mb-4 text-gray-700">
              A Celebra Capital se reserva o direito de encerrar, suspender ou
              restringir seu acesso à plataforma, a qualquer momento, sem aviso
              prévio, por violação destes Termos de Uso ou por qualquer outro
              motivo justificável.
            </p>
            <p className="text-gray-700">
              Você também pode encerrar sua relação com a Celebra Capital a
              qualquer momento, deixando de usar a plataforma e solicitando o
              encerramento da sua conta através dos canais de atendimento
              disponíveis.
            </p>
          </section>

          <section className="mb-8" data-testid="terms-law">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              9. Lei Aplicável e Foro
            </h2>
            <p className="mb-4 text-gray-700">
              Estes Termos de Uso são regidos pelas leis da República Federativa
              do Brasil. Qualquer disputa decorrente da utilização dos serviços
              oferecidos pela Celebra Capital será submetida ao foro da comarca
              de São Paulo/SP, com exclusão de qualquer outro, por mais
              privilegiado que seja.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              10. Disposições Gerais
            </h2>
            <p className="mb-4 text-gray-700">
              Se qualquer disposição destes Termos de Uso for considerada
              ilegal, nula ou inexequível, por qualquer razão, tal disposição
              será considerada separável destes Termos de Uso e não afetará a
              validade e a aplicabilidade das disposições restantes.
            </p>
            <p className="text-gray-700">
              A falha da Celebra Capital em fazer cumprir qualquer direito ou
              disposição destes Termos de Uso não constituirá renúncia de tal
              direito ou disposição.
            </p>
          </section>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">
            Dúvidas ou Esclarecimentos
          </h2>
          <p className="mb-4 text-gray-700">
            Se você tiver dúvidas sobre estes Termos de Uso, entre em contato
            conosco através dos seguintes canais:
          </p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li>E-mail: contato@celebracapital.com.br</li>
            <li>Telefone: (11) 3456-7890</li>
            <li>
              Endereço: Av. Paulista, 1000, 10º andar, Bela Vista, São Paulo/SP,
              CEP 01310-100
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            to="/politica-de-privacidade"
            className="text-blue-600 hover:text-blue-800"
            data-testid="privacy-policy-link"
          >
            Ver nossa Política de Privacidade
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TermsOfUse
