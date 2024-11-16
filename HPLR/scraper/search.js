import * as cheerio from 'cheerio'

const baseUrl = 'https://rezka-ua.tv/'
const api = 'engine/ajax/search.php'
const url = new URL(api, baseUrl)

const search = async (query) => {
  const formData = new URLSearchParams();
  formData.append('q', query);
  // formData.append('do', 'search');
  // formData.append('subaction', 'search');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  const data = await response.text();
  return data;
}

const parseResult = (result) => {
  const $ = cheerio.load(result)
  const items = []
  $('ul li').each((i, el) => {
    const title = $(el).find('.enty').text()
    const url = $(el).find('a').attr('href')
    const rating = $(el).find('.rating').text()
    console.log({ title, url, rating })
    items.push({ title, url, rating })
  })
  return items
}

export const getSearchResults = async (query) => {
  try {
    const result = await search(query)
    const items = parseResult(result)
    return items
  } catch (error) {
    console.error('Ошибка при получении данных с сайта:', error);
  }
}

