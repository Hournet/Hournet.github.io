const puppeteer = require('puppeteer');

async function getMirrorLink(filmUrl, selectedVoiceover) {
  try {
    console.log('Отправляем запрос к странице фильма...');
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(filmUrl);

    // Ждем загрузки контента (может потребоваться настроить в зависимости от конкретного сайта)
    await page.waitForSelector('.mirror');

    console.log('Страница фильма успешно загружена.');

    // Извлекаем содержимое страницы после выполнения JavaScript
    const content = await page.content();
    const $ = cheerio.load(content);

    // Остальной код парсинга
    // ...

    await browser.close();
  } catch (error) {
    console.error('Произошла ошибка:', error.message);
  }
}




// Пример использования
const filmUrl = 'https://rezka.ag/films/drama/54016-oppengeymer-2023.html';
const selectedVoiceover = 'Дубляж';

getMirrorLink(filmUrl, selectedVoiceover);
