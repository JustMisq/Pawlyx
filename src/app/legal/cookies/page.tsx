export default function CookiesPage() {
  return (
    <article className="bg-white rounded-lg p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Cookies</h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Última atualização:</strong> 5 de fevereiro de 2026<br/>
          Esta política explica como a Pawlyx utiliza os cookies e outras tecnologias de rastreamento, 
          em conformidade com a Diretiva Cookies da UE e a lei portuguesa.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. O que é um cookie?</h2>
        
        <p className="text-gray-700 mb-4">
          Um cookie é um pequeno ficheiro de texto armazenado no seu dispositivo (computador, telemóvel, tablet) 
          quando visita um site. Permite à Pawlyx:
        </p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Reconhecê-lo na sua próxima visita</li>
          <li>Memorizar as suas preferências</li>
          <li>Melhorar a sua experiência</li>
          <li>Compreender como utiliza o serviço</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Tipos de cookies utilizados</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-4">2.1 Cookies essenciais (Sem consentimento)</h3>
        <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
          <p className="text-gray-700 mb-3">
            <strong>✓ Estes cookies são NECESSÁRIOS para que a Pawlyx funcione</strong>
          </p>
          
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold">NEXT.JS Session (next-auth.session-token)</p>
              <p>Mantém a sua sessão iniciada</p>
              <p className="text-xs text-gray-600">Duração: Até ao fecho do navegador</p>
            </div>

            <div>
              <p className="font-semibold">CSRF Protection (_XSRF-TOKEN)</p>
              <p>Segurança contra ataques CSRF</p>
              <p className="text-xs text-gray-600">Duração: Duração da sessão</p>
            </div>

            <div>
              <p className="font-semibold">Preferências UI (pawlyx-theme, pawlyx-lang)</p>
              <p>Guarda o seu tema (claro/escuro) e língua</p>
              <p className="text-xs text-gray-600">Duração: 1 ano</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-3">
            ℹ️ Estes cookies não necessitam de consentimento segundo a Diretiva Cookies da UE
          </p>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">2.1b Cookies de Segurança Essenciais (Sem consentimento)</h3>
        <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
          <p className="text-gray-700 mb-3">
            <strong>🔐 Estes cookies garantem a segurança do Serviço</strong>
          </p>
          
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Stripe Session (stripe_session_id)</p>
              <p>Segurança dos pagamentos e tokens de autenticação</p>
              <p className="text-xs text-gray-600">Duração: Duração da sessão | Consentimento: ✗ Não necessário (essencial)</p>
            </div>

            <div>
              <p className="font-semibold">Cloudflare Protection (__cfruid, __cf_bm)</p>
              <p>Segurança contra ataques DDoS e deteção de bots</p>
              <p className="text-xs text-gray-600">Duração: Sessão / 30 minutos | Consentimento: ✗ Não necessário (essencial)</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-3">
            ℹ️ Estes cookies de segurança estão isentos de consentimento pelas autoridades de proteção de dados (CNPD, CNIL)
          </p>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">2.2 Cookies analíticos (Consentimento necessário)</h3>
        <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          <p className="text-gray-700 mb-3">
            <strong>❓ Estes cookies ajudam-nos a compreender como utiliza a Pawlyx</strong>
          </p>
          
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Google Analytics (opcional)</p>
              <p>Ver o número de utilizadores, páginas visitadas, duração das visitas</p>
              <p className="text-xs text-gray-600">Duração: 2 anos | Consentimento: ✓ Necessário</p>
            </div>

            <div>
              <p className="font-semibold">Registos de visita (Pawlyx)</p>
              <p>Registo interno das páginas consultadas para melhoria do serviço</p>
              <p className="text-xs text-gray-600">Duração: 90 dias | Consentimento: ✓ Necessário</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-3">
            ℹ️ Pode recusar estes cookies - a Pawlyx funcionará normalmente
          </p>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-4">2.3 Cookies de marketing (Consentimento necessário)</h3>
        <div className="bg-purple-50 p-4 rounded-lg mb-4 border border-purple-200">
          <p className="text-gray-700 mb-3">
            <strong>📢 Estes cookies permitem as comunicações de marketing</strong>
          </p>
          
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Cookies de marketing universais</p>
              <p>Rastreamento de campanhas publicitárias e newsletters</p>
              <p className="text-xs text-gray-600">Duração: 1 ano | Consentimento: ✓ Necessário</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-3">
            ℹ️ Pode cancelar a subscrição dos emails a qualquer momento (link "Cancelar subscrição" no final de cada email)
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Consentimento e escolha</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Como gerir os cookies?</h3>
        
        <div className="space-y-4 mb-4">
          <div className="border-l-4 border-primary pl-4">
            <h4 className="font-semibold text-gray-900 mb-2">🍪 Na primeira visita: Banner de consentimento</h4>
            <p className="text-gray-700 text-sm">
              Um banner será apresentado solicitando o seu consentimento para cookies não essenciais
            </p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h4 className="font-semibold text-gray-900 mb-2">⚙️ Nas Definições: Gerir preferências</h4>
            <p className="text-gray-700 text-sm">
              Definições → Cookies → Escolher quais tipos aceitar
            </p>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <h4 className="font-semibold text-gray-900 mb-2">🌐 No seu navegador: Controlo global</h4>
            <p className="text-gray-700 text-sm">
              Chrome, Firefox, Safari, Edge permitem bloquear todos os cookies
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong>⚠️ Atenção:</strong> Se bloquear todos os cookies essenciais, a Pawlyx não funcionará corretamente.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookies de terceiros (parceiros)</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Prestadores que utilizam cookies:</h3>
        
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-gray-900">💳 Stripe (Pagamentos)</h4>
            <p className="text-gray-700 text-sm mb-2">
              A Stripe coloca cookies para a segurança dos pagamentos e prevenção de fraude
            </p>
            <p className="text-xs text-green-700 font-semibold mb-1">✓ Cookie essencial - Consentimento não necessário</p>
            <p className="text-gray-700 text-xs"><a href="https://stripe.com/cookie-policy" className="text-primary hover:underline">Política de Cookies da Stripe</a></p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold text-gray-900">📊 Google Analytics</h4>
            <p className="text-gray-700 text-sm mb-2">
              Utilizado opcionalmente para análise de visitas (analítica)
            </p>
            <p className="text-xs text-blue-700 font-semibold mb-1">⚠️ Cookie analítico - Consentimento necessário</p>
            <p className="text-gray-700 text-xs"><a href="https://policies.google.com/privacy" className="text-primary hover:underline">Política de Cookies da Google</a></p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-gray-900">🔐 Cloudflare (CDN/Segurança)</h4>
            <p className="text-gray-700 text-sm mb-2">
              Garante a segurança, o desempenho e a proteção contra ataques DDoS
            </p>
            <p className="text-xs text-green-700 font-semibold mb-1">✓ Cookie essencial - Consentimento não necessário</p>
            <p className="text-gray-700 text-xs"><a href="https://www.cloudflare.com/cookie-policy/" className="text-primary hover:underline">Política de Cookies da Cloudflare</a></p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Duração de conservação</h2>
        
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 p-3 text-left font-semibold">Nome do Cookie</th>
              <th className="border border-gray-200 p-3 text-left font-semibold">Tipo</th>
              <th className="border border-gray-200 p-3 text-left font-semibold">Duração</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr>
              <td className="border border-gray-200 p-3">next-auth.session-token</td>
              <td className="border border-gray-200 p-3">Essencial</td>
              <td className="border border-gray-200 p-3">Fim da sessão</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-200 p-3">_XSRF-TOKEN</td>
              <td className="border border-gray-200 p-3">Essencial</td>
              <td className="border border-gray-200 p-3">Fim da sessão</td>
            </tr>
            <tr>
              <td className="border border-gray-200 p-3">pawlyx-theme</td>
              <td className="border border-gray-200 p-3">Preferência</td>
              <td className="border border-gray-200 p-3">1 ano</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-200 p-3">_ga, _gid (Analytics)</td>
              <td className="border border-gray-200 p-3">Analítico</td>
              <td className="border border-gray-200 p-3">2 anos</td>
            </tr>
            <tr>
              <td className="border border-gray-200 p-3">pawlyx-consent</td>
              <td className="border border-gray-200 p-3">Consentimento</td>
              <td className="border border-gray-200 p-3">1 ano</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Os seus direitos relativos aos cookies</h2>
        
        <div className="space-y-3 text-gray-700">
          <p className="flex gap-3">
            <span className="text-xl">🗑️</span>
            <span><strong>Eliminar cookies:</strong> Pode eliminá-los a qualquer momento no seu navegador</span>
          </p>
          
          <p className="flex gap-3">
            <span className="text-xl">🚫</span>
            <span><strong>Bloquear cookies:</strong> Definições do navegador ou banner de consentimento da Pawlyx</span>
          </p>
          
          <p className="flex gap-3">
            <span className="text-xl">🔍</span>
            <span><strong>Ver cookies:</strong> Ferramentas de desenvolvimento do navegador (F12) → Aplicação → Cookies</span>
          </p>
          
          <p className="flex gap-3">
            <span className="text-xl">❌</span>
            <span><strong>Do Not Track:</strong> A Pawlyx respeita o sinal DNT se o ativar</span>
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Como eliminar os cookies?</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Por navegador:</h3>
        
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-gray-900">🔵 Google Chrome</p>
            <ol className="list-decimal list-inside text-sm text-gray-700 mt-2 ml-2">
              <li>Definições → Privacidade e segurança → Cookies</li>
              <li>Selecione os cookies a eliminar</li>
              <li>Clique "Eliminar"</li>
            </ol>
          </div>

          <div>
            <p className="font-semibold text-gray-900">🦊 Mozilla Firefox</p>
            <ol className="list-decimal list-inside text-sm text-gray-700 mt-2 ml-2">
              <li>Definições → Privacidade → Cookies e dados de sites</li>
              <li>Clique "Gerir dados"</li>
              <li>Selecione e elimine</li>
            </ol>
          </div>

          <div>
            <p className="font-semibold text-gray-900">🍎 Safari</p>
            <ol className="list-decimal list-inside text-sm text-gray-700 mt-2 ml-2">
              <li>Safari → Preferências → Privacidade</li>
              <li>Clique "Gerir dados de sites"</li>
              <li>Selecione e elimine</li>
            </ol>
          </div>

          <div>
            <p className="font-semibold text-gray-900">🔷 Microsoft Edge</p>
            <ol className="list-decimal list-inside text-sm text-gray-700 mt-2 ml-2">
              <li>Definições → Privacidade → Cookies</li>
              <li>Gerir os cookies</li>
              <li>Elimine os de pawlyx.com</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Conformidade legal</h2>
        
        <p className="text-gray-700 mb-4">
          A política de Cookies da Pawlyx respeita:
        </p>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>Diretiva Cookies da UE (2002/58/CE)</strong></li>
          <li><strong>Regulamento RGPD (UE 2016/679)</strong></li>
          <li><strong>Lei da Proteção de Dados Pessoais (LPDP) - Lei 58/2019</strong></li>
          <li><strong>Lei das Telecomunicações Eletrónicas (Portugal)</strong></li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Questões sobre cookies?</h2>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2 text-gray-700">
          <p><strong>📧 Contacte:</strong> dpo@pawlyx.com</p>
          <p><strong>💬 Suporte:</strong> support@pawlyx.com</p>
          <p className="text-sm mt-3">
            Responderemos às suas questões sobre cookies e gestão da privacidade no prazo de 10 dias.
          </p>
        </div>
      </section>

      <section className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          <strong>Última atualização:</strong> 5 de fevereiro de 2026<br/>
          <strong>Próxima revisão:</strong> fevereiro de 2027 ou na sequência de alteração tecnológica
        </p>
      </section>
    </article>
  )
}
