export default function PrivacyPage() {
  return (
    <article className="bg-white rounded-lg p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Última atualização:</strong> 5 de fevereiro de 2026<br/>
          Esta política de privacidade explica como a Pawlyx Portugal recolhe, utiliza e protege os seus dados pessoais, 
          em conformidade com a LPDP (Lei da Proteção de Dados Pessoais) e o RGPD.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Responsável pelo tratamento</h2>
        
        <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
          <p><strong>Pawlyx Portugal, Lda.</strong></p>
          <p>Email: dpo@pawlyx.com</p>
          <p>O nosso Encarregado de Proteção de Dados (DPO) está à sua disposição para qualquer questão.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Dados recolhidos</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">2.1 Dados obrigatórios</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>Email e palavra-passe</li>
          <li>Nome e apelido</li>
          <li>Número de telefone (opcional)</li>
          <li>Informações do salão (nome, morada, NIF)</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">2.2 Dados dos clientes</h3>
        <p className="text-gray-700 mb-3">
          Se utilizar a Pawlyx para gerir os seus clientes, será o próprio responsável pelo tratamento de:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Informações dos clientes (nome, telefone, email)</li>
          <li>Informações sobre os animais (nome, espécie, raça, data de nascimento, observações)</li>
          <li>Histórico de marcações e serviços</li>
          <li>Histórico de pagamentos (faturas, montantes)</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">2.3 Dados técnicos</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Endereço IP, tipo de navegador, páginas visitadas</li>
          <li>Cookies e identificadores de sessão</li>
          <li>Registos de ligação e utilização</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Base legal do tratamento</h2>
        
        <div className="space-y-3 text-gray-700">
          <p><strong>✓ Execução do contrato:</strong> Os seus dados são necessários para lhe fornecer acesso à Pawlyx</p>
          <p><strong>✓ Interesse legítimo:</strong> Melhoria do serviço, prevenção de fraude, segurança</p>
          <p><strong>✓ Consentimento:</strong> Para emails de marketing (pode cancelar a subscrição a qualquer momento)</p>
          <p><strong>✓ Obrigação legal:</strong> Conservação dos dados de faturação (6 anos segundo o direito fiscal português)</p>
          <p><strong>✓ Proteção dos interesses vitais:</strong> Segurança da nossa infraestrutura</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Utilização dos dados</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Utilizamos os seus dados para:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>✓ Fornecer e manter o serviço Pawlyx</li>
          <li>✓ Processar pagamentos e gerar faturas</li>
          <li>✓ Comunicar consigo (suporte, atualizações)</li>
          <li>✓ Melhorar a experiência do utilizador e o serviço</li>
          <li>✓ Garantir a segurança e prevenir a fraude</li>
          <li>✓ Cumprir as obrigações legais e fiscais</li>
          <li>✓ Enviar newsletters (com o seu consentimento)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Partilha de dados</h2>
        
        <p className="text-gray-700 mb-4">Os seus dados só são partilhados quando necessário:</p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">5.1 Prestadores de serviços</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li><strong>Stripe:</strong> Para pagamentos (ver política da Stripe)</li>
          <li><strong>Infraestrutura cloud:</strong> Alojamento de dados (baseado na UE)</li>
          <li><strong>Serviços de email:</strong> Envio de comunicações</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">5.2 Obrigações legais</h3>
        <p className="text-gray-700">
          Podemos divulgar os seus dados se exigido por lei ou por uma autoridade competente portuguesa.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">5.3 Sem transferência para fora da UE</h3>
        <p className="text-gray-700">
          Todos os dados permanecem na União Europeia (nomeadamente em Portugal ou noutros Estados-Membros).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Direitos dos utilizadores</h2>
        
        <p className="text-gray-700 mb-4">
          Em conformidade com a LPDP e o RGPD, tem os seguintes direitos:
        </p>

        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">📋 Direito de acesso</h3>
            <p className="text-gray-700">Aceder aos seus dados através da sua conta ou contactando contact@pawlyx.com</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">✏️ Direito de retificação</h3>
            <p className="text-gray-700">Corrigir os seus dados inexatos diretamente no seu perfil</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">🗑️ Direito ao apagamento (eliminação)</h3>
            <p className="text-gray-700">Solicitar a eliminação sob reserva das obrigações legais de conservação</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">🚫 Direito à limitação</h3>
            <p className="text-gray-700">Cessar o tratamento dos seus dados (exceto se legalmente obrigatório)</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">📊 Direito à portabilidade</h3>
            <p className="text-gray-700">Receber os seus dados num formato padrão e transferível</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">🚫 Direito de oposição</h3>
            <p className="text-gray-700">Opor-se ao tratamento por interesse legítimo ou marketing</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">⚖️ Direito à decisão não automatizada</h3>
            <p className="text-gray-700">Não ser sujeito a tratamento automatizado sem intervenção humana</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Duração de conservação dos dados</h2>
        
        <div className="space-y-3 text-gray-700">
          <p><strong>Conta ativa:</strong> Durante a duração da sua subscrição + 30 dias após rescisão</p>
          <p><strong>Faturação/IVA:</strong> 10 anos civis (obrigação legal portuguesa - Art. 123.º n.º 4 CIRC)</p>
          <p><strong>Dados de clientes:</strong> Conforme a sua utilização (pode eliminá-los a qualquer momento)</p>
          <p><strong>Registos técnicos:</strong> 90 dias no máximo</p>
          <p><strong>Cookies:</strong> 1 ano (canceláveis a qualquer momento)</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Segurança dos dados</h2>
        
        <p className="text-gray-700 mb-4">Implementamos as seguintes medidas técnicas:</p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>✓ Encriptação SSL/TLS de todos os dados em trânsito</li>
          <li>✓ Hashing de palavras-passe com bcryptjs</li>
          <li>✓ Infraestrutura cloud segura baseada na UE</li>
          <li>✓ Firewall e deteção de intrusões</li>
          <li>✓ Cópias de segurança regulares e testadas</li>
          <li>✓ Auditoria de segurança regular</li>
        </ul>

        <p className="text-gray-700 mt-4 text-sm bg-yellow-50 p-3 rounded-lg">
          <strong>Nota:</strong> É responsável pela segurança da sua palavra-passe e pelo acesso à sua conta.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies e tecnologias semelhantes</h2>
        
        <p className="text-gray-700 mb-4">Consulte a nossa <a href="/legal/cookies" className="text-primary hover:underline">Política de Cookies</a> completa.</p>
        
        <p className="text-gray-700">
          Utilizamos cookies para a sessão do utilizador, preferências e análise (sempre com consentimento).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Questões ou preocupações?</h2>
        
        <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-gray-700">
          <p><strong>Contacte o nosso DPO (Encarregado de Proteção de Dados):</strong></p>
          <p>Email: dpo@pawlyx.com</p>
          <p><strong>Ou contacte diretamente:</strong></p>
          <p>contact@pawlyx.com</p>
          <p className="mt-4"><strong>Autoridade de controlo portuguesa:</strong></p>
          <p>CNPD (Comissão Nacional de Proteção de Dados)<br/>
          https://www.cnpd.pt<br/>
          +351 213928400</p>
        </div>
      </section>

      <section className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          Esta política de privacidade aplica-se a partir de 5 de fevereiro de 2026 e será atualizada em caso de alteração legal ou modificação das nossas práticas.
        </p>
      </section>
    </article>
  )
}
