const puppeteer = require('puppeteer');
const http = require('http');
const url = require('url');
const fs = require('fs');

let browser;
let page;

// Вспомогательная функция для задержки
const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

// Функция для запуска браузера и страницы
const initializeBrowser = async () => {
  if (!browser) {
    browser = await puppeteer.launch({ headless: false });
    const pages = await browser.pages();
    page = pages.length ? pages[0] : await browser.newPage();
    await page.goto('https://rezka-ua.tv');
  }
};
 
// Функция для поочередного ввода текста с триггером событий
const typeTextWithEvents = async (selector, newText) => {
    const currentText = await page.$eval(selector, input => input.value);
   
    // await page.setExtraHTTPHeaders({
    //     'Content-Type': 'text/html; charset=utf-8'
    //   });

    // Если введенный текст отличается от текущего, начинаем ввод
    for (let i = currentText.length; i < newText.length; i++) {
      const char = newText[i];
      await page.type(selector, char); // Эмуляция ввода символа
  
      // Событие для обновления UI
      await page.evaluate(selector => {
        const input = document.querySelector(selector);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }, selector);
    }
  
    // Ожидаем перед проверкой результатов
    await delay(700);
    await page.waitForSelector('#search-results', { visible: true, timeout: 1000 });
  };
  
  const deleteTextWithEvents = async (selector) => {
    await page.focus(selector);
  
    // Удаляем весь текст, заменяя содержимое поля пустой строкой
    await page.evaluate(selector => {
      const input = document.querySelector(selector);
      input.value = ''; // Очищаем поле ввода полностью
      input.dispatchEvent(new Event('input', { bubbles: true })); // Генерируем событие 'input'
      input.dispatchEvent(new Event('change', { bubbles: true })); // Генерируем событие 'change'
    }, selector);
  
  
    // Задержка для ожидания реакции страницы
    await delay(700);
    await page.waitForSelector('#search-results', { visible: true, timeout: 1000 });
  };

// Функция для получения результатов поиска
const getSearchResults = async (query) => {
  try {
    await initializeBrowser();

    // Очищаем поле и вводим новый запрос
    await page.evaluate(() => {
      document.querySelector('#search-field').value = '';
    });
    
    // Вводим текст
    await typeTextWithEvents('#search-field', query);

    // Извлекаем результаты фильмов
    const items = await page.evaluate(() => {
      const results = [];
      const elements = document.querySelectorAll('#search-results .b-search__section_list li');

      elements.forEach(element => {
        const link = element.querySelector('a');
        const title = link ? link.querySelector('.enty')?.textContent.trim() : null;
        const url = link ? link.href : null;
        if (title && url) {
          results.push({ title, url });
        }
      });

      return results;
    });

    // Извлекаем ссылку на "Смотреть все результаты"
    const seeAll = await page.$('.b-search__live_all');
    let seeAllData = null;
    if (seeAll) {
      const linkHref = await page.evaluate(el => el.href, seeAll);
      const linkText = await page.evaluate(el => el.textContent.trim(), seeAll);
      seeAllData = { url: linkHref, text: linkText };
    }

    return { items, seeAll: seeAllData };
  } catch (error) {
    console.error('Ошибка при получении данных с сайта:', error);
    throw new Error('Ошибка при получении данных');
  }
};

// Создаем сервер
const server = http.createServer(async (req, res) => {
  const queryObject = url.parse(req.url, true).query;

  if (req.url.startsWith('/search')) {
    const query = queryObject.query || '';

    try {
      const decodedQuery = decodeURIComponent(query); // Декодируем кириллицу в запросе
      const results = await getSearchResults(decodedQuery);

      // Устанавливаем заголовок с правильной кодировкой
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(results));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Произошла ошибка при поиске: ' + error.message);
    }
  } else if (req.url === '/') {
    // Отправляем основной HTML-файл
    fs.readFile('index.html', 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Ошибка при загрузке страницы');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Страница не найдена');
  }
});

// Запускаем сервер на порту 3000
server.listen(3000, async () => {
  await initializeBrowser(); // Инициализируем браузер при запуске сервера
  console.log('Сервер запущен на http://localhost:3000');
});


// Закрываем браузер при завершении работы приложения
process.on('exit', async () => {
  if (browser) {
    await browser.close(); 
  }
});