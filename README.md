# Alyson Tavares — Pilates & Fisioterapia

**Sistema de estudo, raciocínio clínico e criação de conteúdo.**

Sistema de estudo e apoio ao raciocínio clínico em **fisioterapia musculoesquelética** — da avaliação à conduta, com base em diretrizes e artigos de alta qualidade.

Aplicação web estática (HTML/CSS/JS puro, sem dependências) e **instalável como app** (PWA): no celular, abra o link e use "Adicionar à tela inicial"/"Instalar app". Funciona offline nas partes que não dependem de PubMed ou IA. Os dados ficam salvos apenas no aparelho (localStorage e IndexedDB).

### Publicar (GitHub Pages)

1. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Rode o fluxo **Actions → "Publicar no GitHub Pages" → Run workflow** (ou faça um push). O link fica em `https://<usuario>.github.io/<repositorio>/`.

## Módulos

| Módulo | O que faz |
|---|---|
| 📋 **Avaliação completa** | Ficha guiada em 6 etapas (identificação, triagem de red/yellow flags, história da dor, exame físico com testes especiais, desfechos/STarT Back, síntese). A síntese gera automaticamente: hipóteses ranqueadas, fase do reparo tecidual, SINSS, tipo de dor, prognóstico com modificadores do paciente, conduta por fase, diagnóstico pela CIF e plano de reavaliação (MCID). Imprimir/exportar/importar JSON. |
| 🧠 **Raciocínio clínico** | Gerador de hipóteses por região a partir dos achados, mostrando o que favorece, o que contradiz, o que falta perguntar, testes sugeridos (Sn/Sp) e diferenciais. Modelo hipotético-dedutivo, categorias de hipóteses, tipos de dor, SINSS, irritabilidade e vieses cognitivos. |
| 🩹 **Reparo tecidual** | Fases inflamatória, proliferativa e de remodelação (biologia, sinais, objetivos, conduta), tempos de reparo de 8 tecidos e estimador de fase. |
| 📚 **Condições (33)** | Lombar, cervical, ombro, cotovelo, punho, quadril, joelho, tornozelo/pé: resumo, diferenciais, quando encaminhar, testes, prognóstico (fatores favoráveis/desfavoráveis), conduta por fase e o que dizem as evidências. |
| 🔍 **Testes especiais (47)** | Execução, critério de positividade, Sn/Sp, LR+/LR−, fonte e calculadora de probabilidade pós-teste (Bayes). |
| 🧮 **Escalas e prescrição** | Red/yellow flags, STarT Back interativo, PROMs com MCID, Oxford, end-feel, parâmetros de treino resistido, 1RM, regra de monitoramento da dor, critérios e LSI para retorno ao esporte. |
| 🦵 **Anatomia aplicada** | 79 músculos (origem, inserção, inervação, ação/relevância clínica), ossos, nervos periféricos, dermátomos/miótomos/reflexos, artrocinemática e padrões capsulares. |
| 🔬 **Evidências** | O que fazer / não fazer / incerto, guidelines por condição, 11 recomendações (Lin et al. 2020), níveis de evidência e GRADE, leitura crítica, calculadora PEDro, interpretação de IC × MCID e NNT, busca PICO no PubMed com filtros, glossário PT↔EN e fontes confiáveis. |
| 📰 **Artigos (PubMed)** | Busca no PubMed (E-utilities) com filtros de desenho/data e conversão de pergunta clínica em busca; página do artigo com resumo, tradução, **texto completo** (artigos de acesso aberto via Europe PMC), **avaliação de qualidade** (triagem automática PEDro/AMSTAR-2 + avaliação crítica por IA com risco de viés e GRADE), **extração** (PICO, dose FITT, resultados com IC e relevância clínica, o que importa/não importa, glossário), notas e biblioteca exportável (.json/.md). |
| 📸 **Posts para Instagram** | Carrosséis (feed 4:5, quadrado, story) gerados a partir de artigos, condições do sistema ou texto livre; 5 temas, edição de cada slide, exportação em PNG, legenda com contador de caracteres/hashtags. |
| 🎬 **Reels — editor** | Roteiro falado natural a partir de artigo ou condição; editor com linha do tempo; **voz gravada por cena** (regrave só o trecho que errar, com corte automático de silêncio) ou gravação única com teleprompter; **fundo com foto ou vídeo próprio** por cena (com véu para leitura); **trilha musical** com fade e abaixamento automático sob a voz; volumes; legendas sincronizadas; exporta vídeo com áudio (MP4/WebM), .SRT, roteiro e capa. |
| 🎨 **Identidade visual** | Logo oficial, verde da marca (#4A6C5E) e dourado, títulos em Josefin Sans e lema em itálico serifado — no app, nos posts e nos Reels; nome, @, lema e rodapé configuráveis em ⚙️ Configurações. |
| ⚙️ **IA (opcional)** | Tradução, avaliação, extração e textos de posts usam a API da Claude com a chave do próprio usuário (salva só no navegador). Sem chave, tudo funciona com recursos automáticos básicos. |
| 🎓 **Estudo** | Flashcards com repetição espaçada (Leitner), quiz gerado automaticamente e casos clínicos comentados. |

## Estrutura

```
index.html
css/style.css
js/app.js              # roteador, telas e motor de síntese
js/ia.js               # Claude API (SDK oficial via esm.sh) + tela de configuração
js/artigos.js          # PubMed, Europe PMC, avaliação, tradução, extração, biblioteca
js/instagram.js        # gerador de carrosséis em canvas
js/reels.js            # editor de Reels: roteiro, linha do tempo, voz por cena, mídia, música, exportação
js/marca.js            # identidade visual (logo, tema, ornamentos) e instalação do app
sw.js, manifest.webmanifest, icons/  # app instalável e offline
.github/workflows/pages.yml          # publicação no GitHub Pages
js/data/achados.js     # achados clínicos, regiões, red/yellow flags
js/data/condicoes.js   # condições + motor de hipóteses
js/data/testes.js      # testes especiais com acurácia
js/data/tecidos.js     # fases do reparo e tecidos
js/data/anatomia.js    # músculos, ossos, nervos, dermátomos, articulações
js/data/evidencias.js  # guidelines, níveis de evidência, glossário
js/data/clinica.js     # escalas, prescrição, casos clínicos
```

Para adicionar uma condição, inclua um objeto em `CONDICOES` usando chaves existentes de `ACHADOS` e `TESTES`.

## Direitos autorais

A tradução de **texto completo** é feita apenas para artigos em **acesso aberto** (licenças Creative Commons, via Europe PMC); para os demais, só o resumo. Os posts devem resumir com palavras próprias e citar a fonte — não reproduza figuras ou tabelas protegidas.

## Aviso

Ferramenta **educacional** e de apoio ao raciocínio. Não substitui o julgamento clínico nem a avaliação presencial. Valores de acurácia, MCID e prazos de reparo são aproximados e variam entre estudos — consulte sempre as fontes originais citadas. Para uso com pacientes reais, observe a LGPD e as normas do COFFITO sobre prontuário.
