# FisioRaciocínio

Sistema de estudo e apoio ao raciocínio clínico em **fisioterapia musculoesquelética** — da avaliação à conduta, com base em diretrizes e artigos de alta qualidade.

Aplicação web estática (HTML/CSS/JS puro, sem dependências): abra `index.html` no navegador ou publique no GitHub Pages. Funciona offline e os dados ficam salvos apenas no navegador (localStorage).

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
| 🎬 **Reels com roteiro** | A partir de um artigo extraído (ou de uma condição), gera roteiro falado natural (fala + texto na tela por cena, tempos calculados pelo seu ritmo de fala, dicas de gravação); vídeo 9:16 animado (tipografia cinética, números em destaque, listas, legendas sincronizadas, zona segura do Instagram); teleprompter para gravar a voz no navegador ou importar áudio e ajustar as cenas ao áudio; exporta vídeo (MP4/WebM), legendas .SRT, roteiro com tempos e capa. |
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
js/reels.js            # roteiro, editor animado, teleprompter e exportação de Reels
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
