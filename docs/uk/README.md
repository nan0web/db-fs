# @nan0web/db-fs

| [Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Документація                                                                                                                                                | Покриття тестами | Функції                            | Версія Npm |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------- | ---------- |
| 🟢 `97,6%`                                                                            | 🧪 [Англійська 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/db-fs/blob/main/README.md) <br> [Українська 🇺🇦](https://github.com/nan0web/db-fs/blob/main/docs/uk/README.md) | 🟡 `87,1%`       | ✅ d.ts 📜 system.md 🕹️ playground | —          |

Постачальник бази даних для nan•web з node:fs.
Дозволяє асинхронно зберігати, завантажувати, записувати та сканувати файли,
ідеально підходить для легковагового інструментарію монорепозиторію.

## Встановлення

Як встановити через npm?

```bash
npm install @nan0web/db-fs
```

Як встановити через pnpm?

```bash
pnpm add @nan0web/db-fs
```

Як встановити через yarn?

```bash
yarn add @nan0web/db-fs
```

## Швидкий старт

Як зберегти та завантажити JSON файл?

```js
import DBFS from '@nan0web/db-fs'
const db = new DBFS({ root: '__test_quick_start__' })
await db.connect()

const data = { name: 'Test', value: 42 }
await db.saveDocument('test.json', data)
const loaded = await db.loadDocument('test.json')
console.info(loaded) // ← { name: "Test", value: 42 }
```

Як додати вміст до TXT файлу?

```js
import DBFS from '@nan0web/db-fs'
const db = new DBFS({ root: '__test_append__' })
await db.connect()

await db.writeDocument('log.txt', 'Перший рядок\n')
await db.writeDocument('log.txt', 'Другий рядок')
const content = await db.loadDocument('log.txt')
console.info(content) // ← "Перший рядок\nДругий рядок"
```

## Сканування каталогів

### `findStream(uri, { limit = -1, sort = "name", order = "asc", skipStat = false, skipSymbolicLink = true })`

Асинхронне сканування каталогів із налаштовуваними лімітами та сортуванням.

- **Параметри**
  - `uri` (string) – шлях для сканування
  - `options.limit` (number) – максимальна кількість записів (-1 для всіх)
  - `options.sort` (string) – сортувати за "name", "mtime" або "size"
  - `options.order` (string) – порядок сортування "asc" або "desc"
  - `options.skipStat` (boolean) – пропустити статистику файлів для швидшого сканування
  - `options.skipSymbolicLink` (boolean) – ігнорувати символічні посилання

Як просканувати каталог через findStream?

```js
import FS from '@nan0web/db-fs'
const db = new FS()
await db.connect()

const files = []
for await (const entry of db.findStream('src', { limit: 3, sort: 'name', order: 'asc' })) {
  files.push(entry.file.name)
}
console.info(files) // ← ['file-system', 'DBFS.js', 'DBFS.test.js']
```

## Формати файлів

Підтримує автоматичну обробку:

- `.json` – з форматуванням
- `.jsonl` – масив JSON рядків
- `.csv`, `.tsv` – таблиці з роздільниками
- `.txt` – звичайний текст

Як зберегти та завантажити CSV файл?

```js
import DBFS from '@nan0web/db-fs'
const db = new DBFS({ root: '__test_csv__' })
await db.connect()

const data = [
  { Name: 'John', Age: 30 },
  { Name: 'Jane', Age: 25 },
]
await db.saveDocument('people.csv', data)
const loaded = await db.loadDocument('people.csv')
console.info(loaded) // ← [ { Name: "John", Age: 30 }, { Name: "Jane", Age: 25 } ]
```

## Пісочниця

Спробуйте приклади безпечно через CLI пісочницю:

Як запустити CLI пісочницю?

```bash
git clone https://github.com/nan0web/db-fs.git
cd db-fs
npm install
npm run playground
```

## Посилання на API

### `saveDocument(uri, data)`

Зберігає дані у файл із автоматичним форматуванням.

- **Параметри**
  - `uri` (string) – шлях файлу
  - `data` (any) – дані для збереження, форматуються за розширенням

- **Повертає**
  - Promise<boolean> – статус успішності

Як протестувати API saveDocument?

```js
import DBFS from '@nan0web/db-fs'
const db = new DBFS({ root: '__test_save_api__' })
await db.connect()

const result = await db.saveDocument('test.json', { a: 1 })
console.info(result) // ← true
```

### `loadDocument(uri, defaultValue?)`

Завантажує вміст файлу, розпарсений за розширенням.

- **Параметри**
  - `uri` (string) – шлях файлу
  - `defaultValue` (any) – резервне значення, якщо файл не знайдено

- **Повертає**
  - Promise<any> – розпарсені дані або значення за замовчуванням

Як протестувати API loadDocument?

```js
import DBFS from '@nan0web/db-fs'
const db = new DBFS({ root: '__test_load_api__' })
await db.connect()

const empty = await db.loadDocument('missing.json', {})
console.info(empty) // ← {}

await db.saveDocument('data.json', { b: 2 })
const loaded = await db.loadDocument('data.json')
console.info(loaded) // ← { b: 2 }
```

### `writeDocument(uri, chunk)`

Додає неформатований рядок до файлу.

- **Параметри**
  - `uri` (string) – шлях файлу
  - `chunk` (string) – текст для додавання

- **Повертає**
  - Promise<boolean> – статус успішності

Як протестувати API writeDocument?

```js
import DBFS from '@nan0web/db-fs'
const db = new DBFS({ root: '__test_write_api__' })
await db.connect()

await db.writeDocument('log.txt', 'початок\n')
await db.writeDocument('log.txt', 'готово')
const result = await db.loadDocument('log.txt')
console.info(result) // ← "початок\ngотово"
```

### `dropDocument(uri)`

Видаляє файл або каталог.

- **Параметри**
  - `uri` (string) – шлях для видалення

- **Повертає**
  - Promise<boolean> – статус успішності

- **Викидає**
  - Error якщо порушення доступу або каталог не порожній

Як протестувати API dropDocument?

```js
import DBFS from '@nan0web/db-fs'
const db = new DBFS({ root: '__test_drop_api__' })
await db.connect()

await db.saveDocument('temp.txt', 'Видалити мене')
const existsBefore = await db.loadDocument('temp.txt')
console.info(existsBefore) // ← "Видалити мене"

await db.dropDocument('temp.txt')
const missingAfter = await db.loadDocument('temp.txt', null)
console.info(missingAfter) // ← null
```

## Java•Script

Повністю типізований TypeScript declaration файлами та JSdoc:

Скільки d.ts файлів його покривають?

## Участь

Як взяти участь? – [дивіться CONTRIBUTING.md](./CONTRIBUTING.md)

## Ліцензія

Як ліцензувати? – дивіться [LICENSE](./LICENSE)
