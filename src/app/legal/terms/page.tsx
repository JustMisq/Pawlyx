export default function TermsPage() {
  return (
    <article className="bg-white rounded-lg p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Termos de Utilização</h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Última atualização:</strong> 5 de fevereiro de 2026<br/>
          Estes termos de utilização regem o acesso e a utilização da plataforma Pawlyx. 
          Ao utilizar a Pawlyx, aceita estes termos.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Definições</h2>
        
        <div className="space-y-2 text-gray-700">
          <p><strong>"Serviço":</strong> A plataforma Pawlyx e as suas funcionalidades</p>
          <p><strong>"Utilizador":</strong> Você, a pessoa singular que utiliza o Serviço</p>
          <p><strong>"Conteúdo":</strong> Todos os dados, informações introduzidos pelo Utilizador</p>
          <p><strong>"Pawlyx Portugal":</strong> A entidade que explora a plataforma</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Acesso e conta de utilizador</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">2.1 Criar uma conta</h3>
        <p className="text-gray-700 mb-3">
          Para utilizar a Pawlyx, deve:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>Ter pelo menos 18 anos de idade</li>
          <li>Fornecer informações exatas e completas</li>
          <li>Aceitar estes termos</li>
          <li>Estar autorizado por lei a utilizar o Serviço</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">2.2 Responsabilidade da sua conta</h3>
        <p className="text-gray-700">
          É responsável pela confidencialidade da sua palavra-passe e por toda a atividade realizada na sua conta. 
          Aceita notificar-nos imediatamente de qualquer acesso não autorizado.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">2.3 Rescisão de conta</h3>
        <p className="text-gray-700">
          Pode rescindir a sua conta a qualquer momento. A sua subscrição manter-se-á ativa até ao final do período de faturação.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Subscrição e pagamento</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">3.1 Os planos</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-gray-700 mb-4">
          <p><strong>Plano Mensal:</strong> 15€ sem IVA / 18,45€ com IVA (+ 23% IVA)</p>
          <p><strong>Plano Anual:</strong> 150€ sem IVA / 184,50€ com IVA (+ 23% IVA)</p>
          <p className="text-sm"><strong>Nota:</strong> Preços líquidos apresentados para profissionais sem IVA. Consumidores finais pagam com IVA.</p>
          <p className="text-sm">Os preços podem ser alterados com 30 dias de aviso prévio.</p>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">3.2 Renovação automática</h3>
        <p className="text-gray-700 mb-3">
          A sua subscrição renova-se automaticamente no final de cada período. 
          Pode cancelar a qualquer momento através da sua conta.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">3.3 Pagamento</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>Os pagamentos são efetuados através da Stripe de forma segura</li>
          <li>Conservamos os seus dados de pagamento em conformidade com as normas PCI-DSS</li>
          <li>As faturas são geradas automaticamente após cada pagamento</li>
          <li>As faturas são conservadas 6 anos segundo o direito fiscal português</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">3.4 Direito de retratação</h3>
        <p className="text-gray-700 mb-4">
          Em conformidade com o Código do Consumidor português, tem o direito de se retratar no prazo de 14 dias após a sua compra, 
          sem ter de justificar a sua decisão. <strong>Este direito aplica-se apenas a particulares (consumidores finais)</strong>.
        </p>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4 text-sm text-gray-700">
          <p><strong>⚠️ Para profissionais:</strong> Os tosquiadores que utilizam a Pawlyx para a sua atividade profissional não beneficiam do direito de retratação. 
          Aplicam-se as condições comerciais padrão.</p>
        </div>
        <p className="text-gray-700">Contacte contact@pawlyx.com para exercer este direito (apenas particulares).</p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">3.5 Reembolsos</h3>
        <p className="text-gray-700">
          Os reembolsos são tratados conforme as condições do Código do Consumidor. 
          Após cancelamento durante o período de retratação, o reembolso é efetuado no prazo de 14 dias.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Restrições e proibições</h2>
        
        <p className="text-gray-700 mb-4">Aceita não:</p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Utilizar o Serviço de forma ilegal ou contrária à lei portuguesa</li>
          <li>Partilhar a sua conta com terceiros</li>
          <li>Aceder aos dados de forma não autorizada (hacking, engenharia reversa)</li>
          <li>Difundir conteúdo ofensivo, discriminatório ou contrário à ética</li>
          <li>Utilizar o Serviço de forma excessiva ou abusiva</li>
          <li>Transferir a sua conta sem consentimento escrito</li>
          <li>Contornar as limitações técnicas do Serviço</li>
          <li>Explorar vulnerabilidades (divulgar responsavelmente a security@pawlyx.com)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Propriedade do conteúdo</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">5.1 Conteúdo Pawlyx</h3>
        <p className="text-gray-700 mb-4">
          Todos os logótipos, textos, interfaces, gráficos e códigos da Pawlyx são propriedade exclusiva da Pawlyx Portugal 
          ou dos seus parceiros autorizados. Não tem o direito de os reproduzir ou modificar.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">5.2 O seu conteúdo</h3>
        <p className="text-gray-700 mb-4">
          Mantém todos os direitos sobre o conteúdo que cria (clientes, animais, fotos, etc.). 
          Ao utilizar a Pawlyx, concede-nos uma licença para armazenar e tratar os seus dados conforme esta política.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">5.3 Dados de clientes</h3>
        <p className="text-gray-700">
          Se utiliza a Pawlyx para gerir os dados de clientes, é responsável pelo tratamento desses dados 
          em conformidade com a LPDP e o RGPD. A Pawlyx é o seu subcontratante.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitação de responsabilidade</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">6.1 Declaração de não-garantia</h3>
        <p className="text-gray-700 mb-4">
          O Serviço é fornecido "tal como está", sem garantia de qualquer tipo. Não garantimos:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>Que o Serviço funcionará sem interrupção</li>
          <li>Que o Serviço não conterá erros</li>
          <li>Que os dados estarão sempre disponíveis</li>
          <li>Que as falhas de internet do utilizador não afetarão o acesso ao Serviço</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">6.2 Qualidade da ligação à internet</h3>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4 text-gray-700">
          <p className="mb-2">
            <strong>O utilizador é responsável por:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>A qualidade da sua ligação à internet</li>
            <li>A manutenção do seu equipamento informático</li>
            <li>A segurança das suas credenciais</li>
            <li>A conformidade do seu sistema operativo</li>
          </ul>
          <p className="mt-3 text-sm">
            A Pawlyx não pode ser responsabilizada por falhas de internet, problemas de conectividade ou equipamentos do utilizador.
          </p>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">6.3 Limitações de danos</h3>
        <p className="text-gray-700 mb-4">
          Exceto se proibido por lei, a Pawlyx Portugal não será responsável por:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Danos indiretos, incidentais ou consequentes</li>
          <li>Perdas de lucros ou receitas</li>
          <li>Perdas de dados devidas às suas ações</li>
          <li>Danos causados por terceiros ou contratempos externos</li>
        </ul>

        <p className="text-gray-700 mt-4">
          A nossa responsabilidade está limitada ao montante do seu último pagamento efetivo à Pawlyx.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Força Maior</h2>
        
        <p className="text-gray-700 mb-4">
          A Pawlyx não será responsável por qualquer incumprimento ou atraso na execução das suas obrigações se tal resultar de um evento fora do seu controlo, incluindo:
        </p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>Catástrofes naturais (sismos, inundações, tempestades)</li>
          <li>Crises sanitárias (pandemias, epidemias)</li>
          <li>Conflitos armados ou ataques terroristas</li>
          <li>Decisões governamentais ou restrições legais</li>
          <li>Falhas de infraestrutura fora do nosso controlo (ISP, prestadores externos)</li>
          <li>Ataques cibernéticos massivos indefénsáveis</li>
        </ul>
        
        <p className="text-gray-700">
          Em caso de força maior, a Pawlyx fará esforços razoáveis para minimizar o impacto e notificará os utilizadores.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Direito de utilização do Serviço</h2>
        
        <p className="text-gray-700 mb-4">A Pawlyx reserva-se o direito de:</p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Suspender ou terminar o seu acesso em caso de violação destes termos</li>
          <li>Modificar o Serviço (com aviso prévio de 30 dias se for significativo)</li>
          <li>Ajustar a tarifação (com 30 dias de aviso prévio)</li>
          <li>Interromper o Serviço temporariamente para manutenção</li>
          <li>Recusar o acesso a determinados utilizadores</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Proteção do consumidor</h2>
        
        <p className="text-gray-700 mb-4">
          Estes termos são regidos pelo <strong>Código do Consumidor português</strong> e pelas leis de proteção dos consumidores.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">9.1 Direitos do consumidor</h3>
        <p className="text-gray-700">
          Se é consumidor, <strong>beneficia de direitos irrenunciáveis</strong>, nomeadamente:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>Direito de retratação (14 dias)</li>
          <li>Proteção contra cláusulas abusivas</li>
          <li>Direito à informação clara</li>
          <li>Direito à resolução de litígios</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">9.2 Resolução de litígios</h3>
        <p className="text-gray-700 mb-3">
          Em caso de litígio, convidamo-lo a contactar-nos para encontrar uma solução amigável.
        </p>

        <div className="bg-blue-50 p-4 rounded-lg text-gray-700">
          <p><strong>Email:</strong> contact@pawlyx.com</p>
          <p className="mt-2">
            Se o litígio persistir, pode recorrer às jurisdições competentes em Portugal ou utilizar a 
            plataforma de resolução de litígios online da UE: https://ec.europa.eu/consumers/odr
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Conformidade legal</h2>
        
        <p className="text-gray-700">
          Estes termos de utilização estão em conformidade com:
        </p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Código do Consumidor (Proteção do Consumidor)</li>
          <li>Lei de Proteção de Dados Pessoais (LPDP)</li>
          <li>RGPD (Regulamento UE 2016/679)</li>
          <li>Lei das Telecomunicações Eletrónicas (Diretiva Cookies UE)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Alterações aos termos</h2>
        
        <p className="text-gray-700">
          A Pawlyx pode alterar estes termos a qualquer momento. As alterações significativas serão anunciadas 
          com um mínimo de 30 dias de aviso prévio por email. A sua utilização contínua do Serviço significa a sua aceitação.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Lei aplicável e jurisdição</h2>
        
        <p className="text-gray-700 mb-4">
          Estes termos de utilização são regidos pela <strong>lei portuguesa</strong>.
        </p>

        <p className="text-gray-700">
          Qualquer litígio decorrente ou relacionado com estes termos será submetido à jurisdição competente em Portugal.
        </p>

        <div className="bg-yellow-50 p-4 rounded-lg mt-4 text-gray-700 border border-yellow-200">
          <p className="text-sm">
            <strong>Exceção:</strong> Se é consumidor em Portugal, pode recorrer ao tribunal cível 
            ou à jurisdição competente segundo o direito português.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contacto</h2>
        
        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-gray-700">
          <p><strong>Questões sobre estes termos?</strong></p>
          <p>Email: contact@pawlyx.com</p>
          <p>Suporte: support@pawlyx.com</p>
          <p className="text-sm mt-4">Responderemos ao seu pedido no prazo de 10 dias úteis.</p>
        </div>
      </section>

      <section className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          <strong>Última atualização:</strong> 5 de fevereiro de 2026<br/>
          <strong>Entrada em vigor:</strong> 5 de fevereiro de 2026
        </p>
      </section>
    </article>
  )
}
