const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const baseurl = 'https://www.kitapyurdu.com/index.php?route=product/best_sellers&page=';
const limit = 100;
const totalPageCount = 5; // Toplam sayfa sayısı

const books = [];

async function getBooksFromPage(pageNumber) {
  const url = baseurl + pageNumber + '&list_id=16&filter_in_stock=1&filter_in_stock=1&limit=' + limit;
  
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    $('.product-cr').each((index, element) => {
      const title = $(element).find('.name span').text();
      const author = $(element).find('.author span a').text().trim();
      const price = $(element).find('.price-new .value').text();
      const oldPrice = $(element).find('.price-old .value').text();
      const publisher = $(element).find('.publisher a span').text();
      const productInfo = $(element).find('.product-info').text();
      const imgUrl = $(element).find('.image img').attr('src').replace('/wi:100/', '/wi:500/');

      books.push({
        kitap_adi: title.trim(),
        yazar: author,
        fiyat: price.trim(),
        eski_fiyat: oldPrice.trim(),
        yayinevi: publisher.trim(),
        kitap_hakkinda: productInfo.trim(),
        resim: imgUrl
      });
    });
  } catch (error) {
    console.error('Hata oluştu:', error);
  }
}

async function getAllPages() {
  for (let page = 1; page <= totalPageCount; page++) {
    await getBooksFromPage(page);
  }
}

(async () => {
  await getAllPages();

  const jsonOutput = JSON.stringify(books, null, 2);
  fs.writeFileSync('kitaplar.json', jsonOutput, 'utf8');

  console.log('Veri JSON dosyasına kaydedildi: kitaplar.json');
})();
