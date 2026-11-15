# Meuchefbox

# ChefBox — Assinatura de Marmitas Artesanais & Saudáveis 🍲✨

> **Aplicação Web Publicada (Deploy):** [meuchefbox.lovable.app](https://meuchefbox.lovable.app) 
> **Repositório (Github):** [meuchefbox](https://github.com/solangemartins/meuchefbox/)) 
> **Estudante / Desenvolvedora:** Solange de Souza Martins  
> **Desafio DIO:** Bootcamp Santander 2026 — *MeuNegócio.AI: Construindo um Produto Digital com Agentes de IA e Lovable*  

---

## 🧭 1. A Dor Escolhida e Por Que Ela Vale um Negócio

### A Dor Real do Mercado
Muitas pessoas e profissionais com rotinas corridas (home office ou presencial) enfrentam um dilema diário na alimentação:
- Não têm tempo ou habilidade para cozinhar todos os dias;
- Gastam fortunas com pedidos avulsos em aplicativos de delivery tradicionais (iFood), que frequentemente entregam comidas ultraprocessadas, pesadas ou com atraso;
- Sentem falta de **comida caseira de verdade**, fresca e com tempero familiar;
- Do outro lado, cozinheiras autônomas e artesanais talentosas não conseguem ter renda recorrente nem sabem como montar planos de assinatura pela internet.

### A Oportunidade de Negócio
O **ChefBox** surge como um marketplace de assinatura semanal que conecta essa demanda reprimida a cozinheiras parceiras selecionadas da região, oferecendo previsibilidade financeira para quem cozinha e praticidade saudável para quem consome.

---

## 📊 2. Tamanho de Mercado e Business Model Canvas

### Estimativa de Mercado (TAM, SAM e SOM)
- **TAM (Total Addressable Market):** Mercado brasileiro de refeições prontas, alimentação fora do lar e marmitas saudáveis, estimado em mais de R$ 90 bilhões/ano.
- **SAM (Serviceable Available Market):** População economicamente ativa de centros urbanos que consome delivery e marmitas fit/caseiras regularmente em dias de semana (~R$ 12 bilhões/ano).
- **SOM (Serviceable Obtainable Market):** Nicho inicial de profissionais ocupados, praticantes de atividade física e famílias locais atendidos pelas primeiras cozinheiras parceiras da cidade (~R$ 150 mil/ano no primeiro ano de validação).

### Business Model Canvas (Resumo Estruturado)

| Bloco do Canvas | Descrição no ChefBox |
| :--- | :--- |
| **Proposta de Valor** | Comida caseira e saudável na geladeira toda semana, sem fogão sujo, com planos flexíveis e sabor artesanal. |
| **Segmento de Clientes** | Profissionais em home office, solteiros, pessoas com foco em saúde (fit/low carb) e famílias ocupadas. |
| **Canais** | Landing Page responsiva no Lovable, contato direto via WhatsApp e boca a boca regional. |
| **Relacionamento com Clientes** | Atendimento acolhedor, consultivo e humanizado via WhatsApp para confirmação e suporte. |
| **Fontes de Receita** | Assinatura semanal/mensal de marmitas (margem de intermediação entre o valor pago pelo cliente e o repasse à cozinheira). |
| **Recursos-Chave** | Plataforma web (Lovable Cloud / Supabase), rede de cozinheiras artesanais parceiras e canal oficial de WhatsApp. |
| **Atividades-Chave** | Captação de clientes, curadoria de parceiras, gestão de pedidos no painel e controle de entregas/retiradas. |
| **Parcerias Principais** | Cozinheiras locais especializadas (Linha Caseira e Linha Fit) e entregadores/motoboys particulares. |
| **Estrutura de Custos** | Repasse das refeições às cozinheiras, taxa de entrega/motoboy e custos de ferramentas digitais. |

---

## 🎯 3. A Tese que o MVP Testa e o Que Ficou Manual de Propósito

### A Tese Validada
> *"Pessoas ocupadas preferem assinar um plano semanal com cardápio flexível (Caseiro vs. Fit) e atendimento ágil via WhatsApp do que cozinhar ou pedir fast-food avulso todo dia."*

### O Que Foi Automatizado pelo MVP no Lovable:
- Landing Page de alta conversão com visual apetitoso e responsivo (mobile-first);
- Formulário interativo *"Monte seu Box"* com cálculo de valores automático, escolha de linha (Caseira ou Fit), quantidade (5 ou 10 marmitas), restrições alimentares e modalidade (Entrega ou Retirada);
- Gravação segura e íntegra dos pedidos no banco de dados (`public.pedidos`);
- Redirecionamento automático com mensagem estruturada pronta para o WhatsApp;
- Painel Administrativo com métricas financeiras, gestão de status do pedido e cadastro de parceiras;
- Área dedicada para a cozinheira acompanhar a produção da semana dos pedidos aprovados;
- Histórico central de logs e eventos em `public.notificacoes_log`.

### O Que Ficou Manual de Propósito (Conceito Real de MVP):
1. **Fechamento de Venda e Meio de Pagamento:** O fechamento e envio do link de PIX acontecem diretamente na conversa do WhatsApp, permitindo tirar dúvidas de entrega e acolher o cliente antes de cobrar.
2. **Notificações Externas (E-mail e WhatsApp automático):** Conforme diagnosticado na auditoria técnica, as notificações para cliente e cozinheira são registradas internamente no banco (`status = 'simulado'`). O contato ativo externo permanece manual pela administradora, evitando complexidade prematura de APIs antes da validação da tração comercial.
3. **Validação de Frete e Endereço:** A confirmação do raio de entrega e da taxa do motoboy é combinada diretamente pela administração no WhatsApp, preservando a privacidade das residências das cozinheiras parceiras no modo retirada.

---

## 🤖 4. O Mega Prompt e as Correções Aplicadas

### O Mega Prompt Inicial Utilizado
O projeto foi inicializado no Lovable a partir de uma especificação completa de regras de negócio, paleta de cores (`#16A34A`, `#F97316`) e arquitetura relacional de dados:

<details>
<summary>👉 Clique para expandir o Mega Prompt Inicial</summary>

```markdown
Crie uma aplicação web completa e profissional chamada ChefBox: uma plataforma de assinatura semanal de marmitas caseiras e saudáveis que conecta clientes a cozinheiras artesanais parceiras locais (com opções Caseira Tradicional e Fit/Funcional).

A aplicação deve ser moderna, responsiva (mobile-first), com interface limpa, de alta conversão, e incluir painel de administração completo, visão da cozinheira parceira e suporte a notificações e WhatsApp.

- Cores: Verde Oliva (#16A34A), Laranja Quente (#F97316), Fundo (#F8FAFC) e Slate (#1E293B).
- Telas: Landing Page, Formulário "Monte seu Box", Checkout Simulado, Painel da Administradora (Métricas, Pedidos, Cozinheiras) e Visão da Cozinheira.
- Banco de dados: tabelas de pedidos, cozinheiras e notificacoes_log.
```

</details>

### Correções e Ajustes Realizados após Testes:
- **Desacoplamento de Domínio no Resend:** Optou-se por operar em modo de simulação interna no banco de dados (`status: simulado`) para garantir a estabilidade do fluxo de pedidos sem depender da compra de domínio próprio para DNS.
- **Configuração do Canal Oficial do WhatsApp:** Ajuste no redirecionamento do navegador para o link oficial (`wa.me/5511971420446`) contendo a mensagem pré-formatada com o resumo do plano montado pelo cliente.
- **Auditoria do Ciclo de Vida do Pedido (10/10):** Validação ponta a ponta dos status (`aguardando_aprovacao` ➔ `aprovado` ➔ `em_preparo` ➔ `saiu_entrega` / `pronto_retirada` ➔ `concluido`).

---

## 📸 5. Demonstração e Telas da Aplicação

### 1. Landing Page do Cliente & Seção de Planos
<img width="594" height="415" alt="home chefbox, parte de cima" src="https://github.com/user-attachments/assets/9878589d-a3ac-4185-97f1-c2a2f1fa56ac" />
 

### 2. Formulário Interativo "Monte seu Box"
<img width="571" height="407" alt="planos chfbox pedidos" src="https://github.com/user-attachments/assets/633eff6e-c581-4fa7-85a5-c87cb4d3c77a" />


### 3. Painel Administrativo & Métricas

<img width="677" height="371" alt="todos os pedidos chefbox" src="https://github.com/user-attachments/assets/6b9e1ef2-38be-49ae-b2cb-7826343c187f" />


### 4. Visão da Cozinheira Parceira
<img width="462" height="392" alt="área da cozinheira" src="https://github.com/user-attachments/assets/7a7711b2-ac37-436d-81e9-73698c9ec497" />



---

## 🚀 6. Melhorias Planejadas (Evolução Pós-MVP)

- [ ] **Cálculo Automático de Frete por CEP:** Integração com API de CEP (ViaCEP) e cálculo de raio de entrega para automatizar a taxa do motoboy.
- [ ] **Geolocalização Aproximada de Retirada:** Exibição do bairro e mapa aproximado do ponto de retirada sem expor o endereço residencial da cozinheira antes da confirmação.
- [ ] **Disparo Real de E-mails via Resend:** Implementação do utilitário com `RESEND_API_KEY` para envio assíncrono de e-mails transacionais para cliente e administração.
- [ ] **Chatbot WhatsApp via n8n / Meta API:** Automatização do disparo de avisos de *"Pedido a Caminho"* e *"Pronto para Retirada"* diretamente no WhatsApp do cliente.

---

## 🛠️ Tecnologias Utilizadas

- **Lovable** (Plataforma de Vibe Coding, geração de código e deploy)
- **React, Vite e Tailwind CSS** (Frontend e Design System moderno)
- **Supabase / Lovable Cloud** (PostgreSQL, persistência de pedidos e logs)
- **Shadcn/UI & Lucide Icons** (Componentes visuais e ícones)
- **WhatsApp Web API** (Canal de conversão e atendimento humano)
- **GitHub** (Versionamento de código e documentação)

---

## 👩‍💻 Autora

**Solange Martins**  
Projeto desenvolvido como entrega final do desafio da DIO — Trilha Santander 2026.

