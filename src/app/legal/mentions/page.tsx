export default function MentionsPage() {
  return (
    <article className="bg-white rounded-lg p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Avisos Legais</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Identificação do editor</h2>
        
        <div className="bg-gray-50 p-6 rounded-lg space-y-3 text-gray-700">
          <p><strong>Denominação social:</strong> Pawlyx Portugal, Lda.</p>
          <p><strong>Sede social:</strong> [A completar - Lisboa/Portugal]</p>
          <p className="text-sm text-gray-600">Morada completa necessária aquando do registo da sociedade</p>
          <p><strong>NIF (Número de Identificação Fiscal):</strong> [A completar pelo utilizador aquando da criação da conta]</p>
          <p><strong>Capital social:</strong> [A completar]</p>
          <p><strong>Registo comercial:</strong> [A completar na DGAE - Direção-Geral das Atividades Económicas]</p>
          <p><strong>Diretor da publicação:</strong> [A definir]</p>
          <p><strong>Autoridade fiscal:</strong> Autoridade Tributária e Aduaneira (AT)</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Alojamento e infraestrutura</h2>
        
        <p className="text-gray-700 mb-4">
          Este site é alojado e operado de acordo com as seguintes normas de segurança e conformidade:
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm text-gray-700 space-y-2">
          <p><strong>Alojamento:</strong> AWS EMEA (Amazon Web Services Europe)</p>
          <p><strong>Localização:</strong> Luxemburgo (União Europeia)</p>
          <p><strong>Conformidade:</strong> AWS Data Processing Agreement (DPA) incluído</p>
        </div>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Infraestrutura cloud segura baseada na União Europeia</li>
          <li>Conformidade com o RGPD (Regulamento Geral sobre a Proteção de Dados)</li>
          <li>Conformidade com a LPDP (Lei da Proteção de Dados Pessoais) portuguesa</li>
          <li>Certificados SSL/TLS para encriptação de dados em trânsito</li>
          <li>Cópia de segurança regular dos dados (multi-região UE)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Propriedade intelectual</h2>
        
        <p className="text-gray-700 mb-4">
          Todos os conteúdos, textos, imagens, logótipos e elementos do site Pawlyx são propriedade exclusiva da Pawlyx Portugal ou são utilizados com autorização. 
          A sua reprodução, modificação ou reutilização sem autorização expressa é proibida.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitação de responsabilidade</h2>
        
        <p className="text-gray-700 mb-4">
          A Pawlyx Portugal não poderá ser responsabilizada por:
        </p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Dados incorretos ou imprecisos fornecidos pelo utilizador</li>
          <li>Perdas de dados devidas a falhas informáticas fora do nosso controlo</li>
          <li>Interrupções de serviço causadas por terceiros (fornecedores, operadores de telecomunicações)</li>
          <li>Danos indiretos ou consequentes da utilização do serviço</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Custos do serviço e IVA</h2>
        
        <div className="bg-blue-50 p-6 rounded-lg space-y-3 text-gray-700">
          <p><strong>Preços sem IVA (Profissionais):</strong></p>
          <ul className="list-disc list-inside ml-4 mb-3">
            <li>15€/mês sem IVA (18,45€ com IVA para consumidores)</li>
            <li>150€/ano sem IVA (184,50€ com IVA para consumidores)</li>
          </ul>
          <p><strong>IVA portuguesa:</strong> 23% (taxa normal aplicável aos serviços digitais em Portugal)</p>
          <p><strong>Condições de pagamento:</strong> Após receção da fatura - 30 dias líquidos por defeito</p>
          <p><strong>Direito de cancelamento:</strong> 14 dias apenas para consumidores finais (Código do Consumidor)</p>
          <p><strong>Profissionais:</strong> Sem direito de cancelamento - condições comerciais padrão</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Lei aplicável e jurisdição</h2>
        
        <p className="text-gray-700">
          Estes avisos legais, bem como os termos de utilização e a política de privacidade, 
          são regidos pela lei portuguesa. Qualquer litígio será submetido à jurisdição competente em Portugal.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Conformidade legal</h2>
        
        <p className="text-gray-700 mb-4">A Pawlyx Portugal respeita as seguintes disposições legais:</p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li><strong>Lei de Proteção de Dados Pessoais (LPDP):</strong> Lei 58/2019</li>
          <li><strong>RGPD (Regulamento UE 2016/679):</strong> Aplicável enquanto serviço da UE</li>
          <li><strong>Código do Consumidor:</strong> Direito do consumidor português</li>
          <li><strong>CNPD (Comissão Nacional de Proteção de Dados):</strong> Autoridade de controlo portuguesa</li>
          <li><strong>IVA - Decreto-Lei 21/1998:</strong> Regime de IVA portuguesa</li>
          <li><strong>CIRC (Código do Imposto sobre o Rendimento de Pessoas Coletivas):</strong> Art. 123.º n.º 4</li>
        </ul>

        <p className="text-gray-700 text-sm bg-yellow-50 p-4 rounded-lg mb-4">
          <strong>Nota:</strong> Os utilizadores profissionais (tosquiadores) devem registar a sua atividade junto das autoridades fiscais portuguesas.
          A Pawlyx não se substitui às obrigações legais e fiscais individuais.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Livro de Reclamações Eletrónico</h2>
        
        <p className="text-gray-700 mb-4">
          Em caso de litígio ou reclamação relativa ao serviço prestado, os consumidores em Portugal têm o direito de recorrer ao Livro de Reclamações Eletrónico:
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-gray-700">
            <strong>Livro de Reclamações Eletrónico:</strong> <a href="https://www.livroreclamacoes.pt" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.livroreclamacoes.pt</a>
          </p>
          <p className="text-sm text-gray-600 mt-2">Plataforma oficial de reclamações dos consumidores em Portugal</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contacto e comunicações</h2>
        
        <div className="bg-gray-50 p-6 rounded-lg space-y-3 text-gray-700">
          <p><strong>Email:</strong> contact@pawlyx.com</p>
          <p><strong>Suporte:</strong> support@pawlyx.com</p>
          <p><strong>Reclamações de dados:</strong> dpo@pawlyx.com</p>
          <p><strong>Autoridade de controlo:</strong> CNPD (Comissão Nacional de Proteção de Dados) - https://www.cnpd.pt</p>
        </div>
      </section>

      <section className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Última atualização:</strong> 5 de fevereiro de 2026<br/>
          <strong>Próxima revisão:</strong> fevereiro de 2027 (ou na sequência de alteração legal)
        </p>
      </section>
    </article>
  )
}
