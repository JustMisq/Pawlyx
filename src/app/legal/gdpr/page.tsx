export default function GDPRPage() {
  return (
    <article className="bg-white rounded-lg p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">RGPD e LPDP - Proteção de Dados Pessoais</h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Última atualização:</strong> 5 de fevereiro de 2026<br/>
          A Pawlyx respeita o <strong>Regulamento Geral sobre a Proteção de Dados (RGPD)</strong> da União Europeia 
          e a <strong>Lei da Proteção de Dados Pessoais (LPDP)</strong> portuguesa.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Quem somos?</h2>
        
        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-gray-700">
          <p><strong>Responsável pelo tratamento:</strong> Pawlyx Portugal, Lda.</p>
          <p><strong>Encarregado de Proteção de Dados (DPO):</strong> dpo@pawlyx.com</p>
          <p><strong>Autoridade de controlo competente:</strong> CNPD (Comissão Nacional de Proteção de Dados) - Portugal</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Enquadramento jurídico</h2>
        
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">🇪🇺 RGPD - Regulamento (UE) 2016/679</h3>
            <p className="text-sm text-gray-700">Aplicável a todos os tratamentos de dados pessoais na UE</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">🇵🇹 Lei da Proteção de Dados Pessoais (LPDP) - Lei 58/2019</h3>
            <p className="text-sm text-gray-700">Transposição da LPDP para a legislação portuguesa</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">💳 Normas de Pagamento - PCI-DSS</h3>
            <p className="text-sm text-gray-700">Segurança dos dados bancários gerida pela Stripe</p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">📋 Código do Consumidor</h3>
            <p className="text-sm text-gray-700">Proteção dos direitos dos consumidores em Portugal</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Os seus direitos segundo o RGPD e a LPDP</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tem 7 direitos fundamentais:</h3>

        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">1️⃣ Direito de acesso (Artigo 15 RGPD / Artigo 13 LPDP)</h4>
            <p className="text-gray-700 text-sm">
              <strong>O quê:</strong> Tem o direito de saber que dados temos sobre si<br/>
              <strong>Como:</strong> Aceda à sua conta ou contacte dpo@pawlyx.com<br/>
              <strong>Prazo:</strong> Responderemos no prazo de 30 dias<br/>
              <strong>Custo:</strong> Gratuito (exceto pedidos excessivos)
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">2️⃣ Direito de retificação (Artigo 16 RGPD / Artigo 14 LPDP)</h4>
            <p className="text-gray-700 text-sm">
              <strong>O quê:</strong> Corrigir dados inexatos ou incompletos<br/>
              <strong>Como:</strong> Modifique o seu perfil diretamente ou solicite a dpo@pawlyx.com<br/>
              <strong>Prazo:</strong> Imediato na sua conta, 30 dias para pedido por escrito<br/>
              <strong>Custo:</strong> Gratuito
            </p>
          </div>

          <div className="border-l-4 border-red-500 pl-4 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">3️⃣ Direito ao apagamento / Eliminação (Artigo 17 RGPD / Artigo 15 LPDP)</h4>
            <p className="text-gray-700 text-sm">
              <strong>O quê:</strong> Solicitar a eliminação dos seus dados<br/>
              <strong>Como:</strong> Utilize "Eliminar a minha conta" em Definições ou contacte dpo@pawlyx.com<br/>
              <strong>Exceções:</strong> Dados de faturação (conservados 6 anos por obrigação legal)<br/>
              <strong>Prazo:</strong> 30 dias<br/>
              <strong>Custo:</strong> Gratuito
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">4️⃣ Direito à limitação do tratamento (Artigo 18 RGPD / Artigo 16 LPDP)</h4>
            <p className="text-gray-700 text-sm">
              <strong>O quê:</strong> Parar o tratamento dos seus dados (exceto obrigações legais)<br/>
              <strong>Como:</strong> Contacte dpo@pawlyx.com<br/>
              <strong>Resultado:</strong> Os seus dados serão armazenados mas não utilizados<br/>
              <strong>Prazo:</strong> 30 dias
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">5️⃣ Direito à portabilidade (Artigo 20 RGPD / Artigo 17 LPDP)</h4>
            <p className="text-gray-700 text-sm">
              <strong>O quê:</strong> Receber os seus dados num formato padrão e transferível<br/>
              <strong>Como:</strong> Utilize "Exportar os meus dados" em Definições ou contacte dpo@pawlyx.com<br/>
              <strong>Formato:</strong> JSON e/ou CSV<br/>
              <strong>Prazo:</strong> 30 dias<br/>
              <strong>Custo:</strong> Gratuito
            </p>
          </div>

          <div className="border-l-4 border-orange-500 pl-4 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">6️⃣ Direito de oposição (Artigo 21 RGPD / Artigo 18 LPDP)</h4>
            <p className="text-gray-700 text-sm">
              <strong>O quê:</strong> Opor-se ao tratamento dos seus dados<br/>
              <strong>Casos de utilização:</strong> Marketing, interesse legítimo, definição de perfis<br/>
              <strong>Como:</strong> Cancele a subscrição dos emails ou contacte dpo@pawlyx.com<br/>
              <strong>Período:</strong> A qualquer momento
            </p>
          </div>

          <div className="border-l-4 border-pink-500 pl-4 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">7️⃣ Direito à decisão não automatizada (Artigo 22 RGPD)</h4>
            <p className="text-gray-700 text-sm">
              <strong>O quê:</strong> Não ser sujeito a decisões automatizadas significativas<br/>
              <strong>Exemplo:</strong> Recusa de serviço baseada unicamente num algoritmo<br/>
              <strong>Direito:</strong> Solicitar intervenção humana<br/>
              <strong>Como:</strong> Contacte dpo@pawlyx.com
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Como exercer os seus direitos?</h2>
        
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Opção 1️⃣: Diretamente na sua conta</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Definições → Dados e Privacidade</li>
            <li>Clique em "Exportar os meus dados"</li>
            <li>Ou "Eliminar a minha conta"</li>
          </ul>

          <h3 className="font-semibold text-gray-900 mb-4">Opção 2️⃣: Por email ao DPO</h3>
          <div className="bg-white p-4 rounded border border-blue-200 mb-6">
            <p className="text-gray-700 mb-2"><strong>Endereço:</strong> dpo@pawlyx.com</p>
            <p className="text-gray-700 mb-2"><strong>Assunto:</strong> [Direito RGPD] - [O seu nome] - [Natureza do pedido]</p>
            <p className="text-gray-700 text-sm"><strong>Exemplo:</strong> "[Direito de acesso] - João Silva - Pedido de cópia dos dados"</p>
          </div>

          <h3 className="font-semibold text-gray-900 mb-4">O que precisamos de si</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>O seu nome completo</li>
            <li>O seu email associado à conta</li>
            <li>Natureza precisa do seu pedido</li>
            <li>Uma cópia de identificação (para verificação, facultativo mas recomendado)</li>
          </ul>
        </div>

        <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-700">
            <strong>Prazo legal:</strong> Devemos responder no prazo de <strong>30 dias</strong> a qualquer pedido RGPD/LPDP. 
            Este prazo pode ser prolongado por 60 dias se o pedido for complexo.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Se é um responsável pelo tratamento (Profissional)</h2>
        
        <p className="text-gray-700 mb-4">
          Se gere os dados dos seus clientes através da Pawlyx, é o <strong>responsável pelo tratamento</strong> 
          e a Pawlyx é o seu <strong>subcontratante</strong>.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">As suas obrigações:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>📋 Informar os seus clientes de que trata os seus dados</li>
          <li>✅ Obter o seu consentimento (se aplicável)</li>
          <li>🔒 Tomar as medidas de segurança adequadas</li>
          <li>📝 Documentar os seus tratamentos (Registo de tratamento)</li>
          <li>⚠️ Notificar as violações de dados no prazo de 72 horas à CNPD</li>
        </ul>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-700">
            <strong>Acordo de subcontratação:</strong> A Pawlyx tem implementado um acordo de tratamento de dados 
            (Data Processing Agreement) em conformidade com o Artigo 28 do RGPD.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Segurança e Medidas Técnicas</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Medidas de segurança implementadas:</h3>
        
        <div className="space-y-3">
          <div className="flex gap-3">
            <span className="text-2xl">🔐</span>
            <div>
              <p className="font-semibold text-gray-900">Encriptação SSL/TLS</p>
              <p className="text-sm text-gray-700">Todos os dados em trânsito são encriptados (HTTPS)</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">🗝️</span>
            <div>
              <p className="font-semibold text-gray-900">Hashing de palavras-passe</p>
              <p className="text-sm text-gray-700">bcryptjs com 10 rounds - as palavras-passe nunca são armazenadas em texto simples</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">☁️</span>
            <div>
              <p className="font-semibold text-gray-900">Infraestrutura Cloud segura</p>
              <p className="text-sm text-gray-700">Baseada na União Europeia, conforme à diretiva DNSH</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="font-semibold text-gray-900">Firewall e Deteção de intrusões</p>
              <p className="text-sm text-gray-700">Monitorização 24/7 de tentativas de acesso não autorizado</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">💾</span>
            <div>
              <p className="font-semibold text-gray-900">Cópias de segurança regulares</p>
              <p className="text-sm text-gray-700">Cópias de segurança encriptadas testadas regularmente</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-gray-900">Auditorias de segurança</p>
              <p className="text-sm text-gray-700">Auditorias externas anuais e testes de penetração</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Violações de dados e notificação</h2>
        
        <p className="text-gray-700 mb-4">
          Em caso de violação de dados pessoais, a Pawlyx notificará as autoridades competentes e os utilizadores afetados 
          sem demora injustificada e, o mais tardar, <strong>72 horas após a descoberta</strong> (Artigo 33 RGPD).
        </p>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-gray-700 mb-3">
            <strong>Como reportar uma violação?</strong>
          </p>
          <p className="text-gray-700">Email: security@pawlyx.com (confidencial)</p>
          <p className="text-gray-700">ou DPO: dpo@pawlyx.com</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Transferências de dados para fora da UE</h2>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-gray-700 mb-2">
            ✅ <strong>Todos os dados permanecem na União Europeia</strong>
          </p>
          <p className="text-gray-700 text-sm">
            A Pawlyx não transfere os seus dados para fora da UE. A nossa infraestrutura está baseada em Portugal ou noutros Estados-Membros.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Autoridades de controlo</h2>
        
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">CNPD (Comissão Nacional de Proteção de Dados) - Portugal</h3>
            <p className="text-gray-700 text-sm">
              <strong>Site:</strong> https://www.cnpd.pt<br/>
              <strong>Email:</strong> geral@cnpd.pt<br/>
              <strong>Telefone:</strong> +351 213 928 400<br/>
              <strong>Morada:</strong> Rua de São Bento, 148 - 3.º, 1200-821 Lisboa
            </p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900">Plataforma de resolução de litígios online da UE</h3>
            <p className="text-gray-700 text-sm">
              <strong>Site:</strong> https://ec.europa.eu/consumers/odr<br/>
              <strong>Utilização:</strong> Para litígios de consumo transfronteiriços
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. FAQ RGPD/LPDP</h2>
        
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">❓ Durante quanto tempo conservam os meus dados?</h4>
            <p className="text-gray-700 text-sm">
              <strong>Dados ativos:</strong> Enquanto a sua conta estiver ativa<br/>
              <strong>Após eliminação da conta:</strong> 30 dias (exceto dados de faturação)<br/>
              <strong>Faturas:</strong> 6 anos (obrigação legal portuguesa)
            </p>
          </div>

          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">❓ Partilham os meus dados com terceiros?</h4>
            <p className="text-gray-700 text-sm">
              Apenas quando necessário: Stripe (pagamentos), serviços de email, infraestrutura cloud. 
              Nunca para marketing ou revenda.
            </p>
          </div>

          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">❓ O que é um "responsável pelo tratamento"?</h4>
            <p className="text-gray-700 text-sm">
              A pessoa/entidade que decide como e porquê tratar dados. 
              Se gere clientes através da Pawlyx, é o responsável pelo tratamento dos seus dados.
            </p>
          </div>

          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">❓ Como posso determinar se um pedido RGPD é válido?</h4>
            <p className="text-gray-700 text-sm">
              Se diz respeito aos seus direitos fundamentais à proteção de dados e se é feito pessoalmente, 
              é válido. Aceitamos todos os pedidos legítimos.
            </p>
          </div>

          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">❓ O que fazer se tiver uma reclamação RGPD?</h4>
            <p className="text-gray-700 text-sm">
              1. Contacte-nos primeiro: dpo@pawlyx.com<br/>
              2. Se não resolvido, contacte a CNPD: https://www.cnpd.pt/queixa
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Denúncia de violações</h2>
        
        <p className="text-gray-700 mb-4">
          Pode reportar uma violação presumida do RGPD/LPDP à CNPD (Comissão Nacional de Proteção de Dados):
        </p>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200 space-y-2 text-gray-700">
          <p><strong>📧 Email:</strong> queixa@cnpd.pt</p>
          <p><strong>🌐 Formulário online:</strong> https://www.cnpd.pt/queixa</p>
          <p><strong>📱 AppSGC:</strong> Aplicação para submeter reclamações</p>
          <p className="text-sm mt-3">Não é obrigatório contactar a Pawlyx primeiro, pode contactar diretamente a autoridade.</p>
        </div>
      </section>

      <section className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">📞 Ainda tem questões?</h3>
        <p className="text-gray-700 text-sm">
          <strong>DPO:</strong> dpo@pawlyx.com<br/>
          <strong>Suporte:</strong> support@pawlyx.com<br/>
          <strong>Autoridade:</strong> CNPD - https://www.cnpd.pt
        </p>
      </section>

      <section className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          <strong>Última atualização:</strong> 5 de fevereiro de 2026<br/>
          <strong>Próxima revisão:</strong> fevereiro de 2027 ou na sequência de alteração de lei
        </p>
      </section>
    </article>
  )
}
