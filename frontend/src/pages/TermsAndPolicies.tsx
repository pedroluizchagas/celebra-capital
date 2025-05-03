import React from 'react'
import { Link } from 'react-router-dom'

const TermsAndPolicies: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">
        Termos de Uso e Políticas de Privacidade
      </h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">
          Termos de Uso
        </h2>

        <div className="space-y-4 text-gray-700">
          <p>
            Bem-vindo à Plataforma de Pré-Análise de Crédito da Celebra Capital.
            Ao utilizar nossos serviços, você concorda com os termos e condições
            descritos abaixo.
          </p>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            1. Aceitação dos Termos
          </h3>
          <p>
            Ao acessar ou utilizar nossa plataforma, você reconhece que leu,
            entendeu e concorda em cumprir estes Termos de Uso e todas as leis e
            regulamentos aplicáveis. Se você não concordar com estes termos, não
            utilize nossos serviços.
          </p>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            2. Descrição dos Serviços
          </h3>
          <p>
            A Plataforma de Pré-Análise de Crédito da Celebra Capital oferece
            serviços de análise preliminar de crédito para servidores públicos,
            aposentados e pensionistas. Os serviços incluem:
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>Coleta de informações pessoais e financeiras para análise</li>
            <li>Upload de documentos necessários para verificação</li>
            <li>Assinatura digital de documentos e contratos</li>
            <li>Comunicação sobre o status da sua solicitação</li>
          </ul>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            3. Elegibilidade
          </h3>
          <p>Para utilizar nossos serviços, você deve:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Ser maior de 18 anos</li>
            <li>Ser servidor público, aposentado ou pensionista</li>
            <li>Possuir documentação válida e completa</li>
            <li>Ter capacidade legal para celebrar contratos</li>
          </ul>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            4. Uso da Plataforma
          </h3>
          <p>Ao utilizar nossa plataforma, você concorda em:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Fornecer informações verdadeiras, precisas e completas</li>
            <li>Manter a confidencialidade de suas credenciais de acesso</li>
            <li>Não utilizar a plataforma para fins fraudulentos ou ilegais</li>
            <li>Não tentar acessar áreas restritas da plataforma</li>
          </ul>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            5. Propriedade Intelectual
          </h3>
          <p>
            Todo o conteúdo disponibilizado na plataforma, incluindo textos,
            gráficos, logotipos, ícones, imagens, clipes de áudio, downloads
            digitais e softwares, é de propriedade da Celebra Capital ou de seus
            fornecedores e está protegido por leis de propriedade intelectual.
          </p>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            6. Limitação de Responsabilidade
          </h3>
          <p>A Celebra Capital não se responsabiliza por:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Interrupções no funcionamento da plataforma</li>
            <li>
              Danos causados por vírus, malware ou outros elementos nocivos
            </li>
            <li>Informações incorretas fornecidas pelos usuários</li>
            <li>
              Decisões tomadas pelo usuário com base nas informações
              disponibilizadas na plataforma
            </li>
          </ul>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            7. Modificações nos Termos
          </h3>
          <p>
            A Celebra Capital se reserva o direito de modificar estes termos a
            qualquer momento. As alterações entrarão em vigor imediatamente após
            sua publicação na plataforma. O uso continuado dos serviços após
            tais modificações constitui sua aceitação dos novos termos.
          </p>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            8. Lei Aplicável
          </h3>
          <p>
            Estes termos são regidos pelas leis da República Federativa do
            Brasil. Qualquer disputa relacionada a estes termos será submetida à
            jurisdição exclusiva dos tribunais da cidade de São Paulo, SP.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">
          Política de Privacidade
        </h2>

        <div className="space-y-4 text-gray-700">
          <p>
            A Celebra Capital está comprometida com a proteção de seus dados
            pessoais. Esta Política de Privacidade descreve como coletamos,
            usamos, compartilhamos e protegemos suas informações pessoais.
          </p>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            1. Informações Coletadas
          </h3>
          <p>Coletamos as seguintes categorias de informações:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>
              <strong>Informações pessoais:</strong> nome, CPF, RG, data de
              nascimento, endereço, email, telefone
            </li>
            <li>
              <strong>Informações financeiras:</strong> renda, empregador,
              histórico de crédito, dados bancários
            </li>
            <li>
              <strong>Documentos:</strong> comprovantes de identidade, renda e
              residência
            </li>
            <li>
              <strong>Dados de uso:</strong> informações sobre como você utiliza
              nossa plataforma
            </li>
          </ul>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            2. Base Legal para Processamento
          </h3>
          <p>
            Processamos seus dados pessoais com base nas seguintes
            justificativas legais:
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>
              Execução de contrato ou procedimentos preliminares relacionados a
              contrato
            </li>
            <li>Cumprimento de obrigações legais</li>
            <li>Consentimento do titular dos dados</li>
            <li>Legítimo interesse, quando aplicável</li>
          </ul>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            3. Finalidades do Tratamento
          </h3>
          <p>Utilizamos suas informações para:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Realizar a análise de crédito preliminar</li>
            <li>Verificar sua identidade e elegibilidade</li>
            <li>Entrar em contato sobre sua solicitação</li>
            <li>Cumprir obrigações legais e regulatórias</li>
            <li>Melhorar nossos serviços e experiência do usuário</li>
            <li>Prevenir fraudes e atividades ilícitas</li>
          </ul>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            4. Compartilhamento de Dados
          </h3>
          <p>Podemos compartilhar suas informações com:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>
              Prestadores de serviços que nos auxiliam em nossas operações
            </li>
            <li>
              Instituições financeiras parceiras para processamento de
              empréstimos
            </li>
            <li>
              Órgãos reguladores e autoridades governamentais, quando exigido
              por lei
            </li>
            <li>
              Bureaus de crédito para verificação de dados e histórico de
              crédito
            </li>
          </ul>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            5. Armazenamento e Segurança
          </h3>
          <p>
            Implementamos medidas técnicas e organizacionais apropriadas para
            proteger seus dados pessoais contra acesso não autorizado,
            alteração, divulgação ou destruição não autorizada. Seus dados são
            armazenados em servidores seguros localizados no Brasil.
          </p>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            6. Seus Direitos
          </h3>
          <p>
            De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os
            seguintes direitos:
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>Confirmação da existência de tratamento de seus dados</li>
            <li>Acesso aos seus dados</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados</li>
            <li>
              Anonimização, bloqueio ou eliminação de dados desnecessários ou
              excessivos
            </li>
            <li>Portabilidade dos dados</li>
            <li>Eliminação dos dados tratados com seu consentimento</li>
            <li>
              Informação sobre entidades com as quais seus dados foram
              compartilhados
            </li>
            <li>Revogação do consentimento</li>
          </ul>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            7. Período de Retenção
          </h3>
          <p>
            Mantemos seus dados pessoais pelo tempo necessário para cumprir as
            finalidades para as quais foram coletados, incluindo o cumprimento
            de obrigações legais, contratuais, de prestação de contas ou
            requisição de autoridades competentes.
          </p>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            8. Cookies e Tecnologias Semelhantes
          </h3>
          <p>
            Utilizamos cookies e tecnologias semelhantes para melhorar sua
            experiência em nossa plataforma, entender como você a utiliza e
            personalizar nosso conteúdo. Você pode gerenciar suas preferências
            de cookies através das configurações do seu navegador.
          </p>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            9. Contato com o Encarregado de Proteção de Dados
          </h3>
          <p>
            Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento
            de seus dados pessoais, entre em contato com nosso Encarregado de
            Proteção de Dados pelo e-mail: dpo@celebracapital.com.br
          </p>

          <h3 className="text-xl font-medium text-blue-600 mt-4">
            10. Atualizações desta Política
          </h3>
          <p>
            Esta Política de Privacidade pode ser atualizada periodicamente. A
            versão mais recente estará sempre disponível em nossa plataforma.
            Recomendamos que você a revise regularmente.
          </p>
        </div>
      </div>

      <div className="text-center mt-8 mb-12">
        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
        >
          Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  )
}

export default TermsAndPolicies
