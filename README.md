# Castelo Ads — Site

Site da Castelo Ads, agência de tráfego pago para tatuadores e estúdios de tatuagem.
Feito em HTML, CSS e JavaScript puros, sem frameworks e sem etapa de build.

O site abre em **português**, e os botões **BR / EN / ES** no menu trocam o idioma na hora.

## Como publicar

Qualquer hospedagem de site estático serve (GitHub Pages, Netlify, Vercel, Hostinger, cPanel). O arquivo principal é `index.html`.

**GitHub Pages:** Settings → Pages → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.

Para testar no computador: `npx serve` dentro da pasta e abra o endereço mostrado.

## Estrutura

| Arquivo / pasta | O que tem |
|---|---|
| `index.html` | Estrutura da página (textos em português) |
| `js/i18n.js` | Traduções dos três idiomas (`pt`, `en`, `es`) |
| `js/main.js` | Configurações, vídeos, prints, países, formulário |
| `css/style.css` | Cores, fontes, tamanhos e animações |
| `img/`, `flags/`, `fonts/` | Imagens, bandeiras e fontes |

## Configurações (início de `js/main.js`)

- `whatsappNumber`: número que recebe a mensagem, só dígitos (ex.: `5511999999999`). Vazio = abre o WhatsApp sem destinatário.
- `instagramUrl`: link do Instagram no rodapé (vazio = escondido).
- `webhookUrl`: webhook do Make que recebe os cadastros do formulário.
- `videoMode`: `"embed"` (vídeo toca na página) ou `"link"` (abre no Vimeo).
- `defaultLang`: idioma principal (`"pt"`).
- `VIDEOS` / `PRINTS`: depoimentos em vídeo e prints de resultados.

## Idiomas

- A escolha do visitante fica salva no navegador dele.
- Links diretos: `?lang=en` ou `?lang=es` (ex.: `seusite.com/?lang=en`).
- Para mudar um texto, edite a mesma chave em `pt`, `en` e `es` no arquivo `js/i18n.js`.

## Formulário → Make

- A faixa de faturamento chega sempre em português, em qualquer idioma.
- O campo `idioma` (`pt`, `en` ou `es`) mostra qual versão a pessoa usou.
- A mensagem do WhatsApp sai no idioma escolhido pelo visitante.

## Depois de editar CSS ou JS

No `index.html`, os arquivos `css/style.css`, `js/i18n.js` e `js/main.js` têm um número de versão (`?v=...`).
Sempre que alterar um desses arquivos, mude esse número (ex.: `?v=20261107-3`) para que os visitantes recebam a versão nova na hora, em vez da cópia guardada no navegador.
