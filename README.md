# Портфоліо — сайти для бізнесу в Дубні

Статичний сайт без збірки й без зовнішніх бібліотек: чистий HTML, CSS і JS.
Відкривається подвійним кліком локально й працює на GitHub Pages.

## Структура

| Файл | Що це |
|---|---|
| `index.html` | головна: чотири реальні концепти з живим прев'ю, що входять у роботу, процес, заявка |
| `works/mister-burger/` | Містер Бургер — мережа стрітфуду: меню з вкладками, доставка, два заклади |
| `works/anna-vi-beauty/` | Anna Vi beauty — студія краси: прайс, портфоліо, запис |
| `works/avatar/` | Аватар — вело, електро, мото: каталог, сервіс, два магазини |
| `works/melan-dental/` | Стоматологія «Мелан» — з 1994 року: послуги, лікарі, FAQ, запис |
| `works/assets/premium.css` | дизайн-система: 5 тем, темна й світла, сітки, форми, адаптив |
| `works/assets/sprite.js` | 58 SVG-іконок (stroke-based). Емодзі не використовуються |
| `works/assets/site.js` | вкладки з клавіатурою, форми зі статусом, меню, анімації, 3D-нахил |

## Стандарт якості

Сайти зроблені за трьома стандартами (frontend-design, impeccable,
web-design-guidelines) і перевіряються скриптом `scripts/audit_craft.py`:

- **заборонено й видалено:** градиентный текст, плашки-eyebrow над заголовками,
  середні точки, стрілки на кнопках, декоративний blur, вкладені картки, емодзі;
- **є обов'язково:** `::selection`, `caret-color`, `tabular-nums`, `:focus-visible`,
  `color-scheme` на корені, `text-wrap: balance`, `overscroll-behavior`,
  `prefers-reduced-motion`;
- контраст тексту ≥ 4.5:1 на всіх сторінках (фактично 4.69–7.21:1);
- нуль горизонтального скролу на 1440px і 390px.

## Публікація

Репозиторій: `sas228q-maker/portfolio`, гілка `main`.
GitHub Pages збирає сайт автоматично після кожного `git push` (15–30 секунд).

```
git add -A
git commit -m "опис змін"
git push
```

Готовий сайт: https://sas228q-maker.github.io/portfolio/

> Локально git працює лише з налаштованим `core.sshCommand` на системний OpenSSH —
> інакше MSYS-ssh ламається на кириличному шляху `C:\Users\Саня`:
> `git config core.sshCommand "C:/Windows/System32/OpenSSH/ssh.exe -o StrictHostKeyChecking=accept-new"`
