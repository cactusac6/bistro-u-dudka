# Bistro u Dudka — vlastní landing page

Jedna stránka v HTML/CSS/JS, žádný framework, žádný build. Funguje sama o sobě.

## Co je hotové

- Vylepšený design v duchu původní stránky (warm street-food vibe — paprika, šafrán, čokoládově černá, krémová)
- Responsivní (mobil + tablet + desktop)
- Sticky navigace s rozmazáním pozadí
- Hero s animovaným nálepkovým štítkem "Do 30 minut"
- Běžící ticker se sloganem
- Karty s otevírací dobou / adresou / rozvozem
- Sekce rozvozu s výraznými cenami a banneru "Zdarma nad 400 Kč"
- Galerie s hover zoom efektem
- Embed Google mapy s adresou
- Recenze CTA (odkaz na Google recenze)
- Sticky CTA tlačítko "Objednat teď" na mobilu
- Reveal animace při scrollování
- SEO meta tagy + Open Graph

Všechna tlačítka "Objednat" odkazují na **shop.bistroududka.cz** — Shoptet shop pořád dělá to, co umí (košík, platby, sklad).

## Nasazení na Netlify (zdarma, 2 minuty)

1. Jdi na https://app.netlify.com/drop
2. Přetáhni složku `bistro-u-dudka` do okna (nebo jen `index.html`)
3. Hotovo — dostaneš URL typu `random-name.netlify.app`
4. V Netlify nastavení → Domain management → Add custom domain → `bistroududka.cz`
5. Změníš DNS u registrátora domény (Netlify ti řekne přesně jak)

Stejný postup funguje pro **Vercel** (vercel.com) — taky drag&drop.

## Co ještě vyladit (TODO)

1. **Fotky** — teď jsou napojené přímo z BrandCrowd CDN (`bc-user-uploads.brandcrowd.com`). Doporučuju je stáhnout, uložit do složky `images/` a v HTML přepsat cesty. Bude to rychlejší a nezávislé na externí službě.
2. **Telefon** — současná stránka ho nikde nemá, ale lidi ho budou hledat. Přidej do sekce Kontakt.
3. **Logo** — místo textového "Bistro u Dudka" v navigaci se hodí SVG/PNG logo (pokud nějaké máš).
4. **Sociální sítě** — odkazy na FB/IG vedou na hlavní domény. Až dáš správné, přepiš v `<footer>`.
5. **Open Graph obrázek** — přidat `<meta property="og:image" content="..." />` pro hezké náhledy při sdílení.
6. **Analytics** — případně Google Analytics nebo Plausible.

## Editace ve VS Code

- Otevři `index.html`
- Všechny styly jsou v `<style>` na začátku — nahoře jsou **proměnné** (`--paprika`, `--saffron`, fonty...), stačí měnit tam
- Texty jsou v `<body>`, hledej podle obsahu
- Live Preview: nainstaluj rozšíření **"Live Server"** od Ritwicka Dey → pravým klikem na `index.html` → "Open with Live Server"

## Co bych doporučil dál

Pokud to chceš profesionálně škálovat:
- Přidat druhou stránku s plným menu (mimo Shoptet) pro lepší SEO
- Strukturovaná data pro Google (Restaurant schema.org) — pomůže s viditelností ve vyhledávání
- Vlastní doménový mail (`info@bistroududka.cz`)

Napiš, kdyby cokoliv nešlo nebo bys chtěl něco doladit.
