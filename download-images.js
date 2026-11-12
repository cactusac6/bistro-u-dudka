const https = require('https');
const fs = require('fs');
const path = require('path');

const images = [
  // Produktové fotky — Shoptet CDN
  {
    url: 'https://cdn.myshoptet.com/usr/shop.bistroududka.cz/user/shop/big/97_chatgpt-image-may-25--2026--08-36-15-pm.png?6a1496b9',
    file: 'images/menu-kebab-talir.png'
  },
  {
    url: 'https://cdn.myshoptet.com/usr/shop.bistroududka.cz/user/shop/big/103_chatgpt-image-may-25--2026--08-39-58-pm.png?6a1497ab',
    file: 'images/menu-bageta-xxl.png'
  },
  {
    url: 'https://cdn.myshoptet.com/usr/shop.bistroududka.cz/user/shop/big/70_74f861ff-62e8-4b08-8c32-0c943a930249.png?6a149a49',
    file: 'images/menu-durum-nachos.png'
  },
  {
    url: 'https://cdn.myshoptet.com/usr/shop.bistroududka.cz/user/shop/big/67_082c6bf4-3977-41ed-b4b2-c3ae3ed390c9.png?6a160469',
    file: 'images/menu-durum-americky.png'
  },
  {
    url: 'https://cdn.myshoptet.com/usr/shop.bistroududka.cz/user/shop/big/208_002ce310-3d0c-4fe3-90c7-03fc0aff8326.png?6a149ce5',
    file: 'images/menu-falafel-salat.png'
  },
  {
    url: 'https://cdn.myshoptet.com/usr/shop.bistroududka.cz/user/shop/big/205_chatgpt-image-may-25--2026--08-55-01-pm.png?6a149b0d',
    file: 'images/menu-kebab-salat.png'
  },
  // Galerie — BrandCrowd
  {
    url: 'https://bc-user-uploads.brandcrowd.com/public/media-Production/730fd98b-051c-4740-880f-eb3116acbc77/dc5a6ed9-50f6-42a6-b582-af80391d85c3_2x',
    file: 'images/gallery-1.jpg'
  },
  {
    url: 'https://bc-user-uploads.brandcrowd.com/public/media-Production/730fd98b-051c-4740-880f-eb3116acbc77/1b8246c4-e752-4816-90d1-02f130c638e4_2x',
    file: 'images/gallery-2.jpg'
  },
  {
    url: 'https://bc-user-uploads.brandcrowd.com/public/media-Production/730fd98b-051c-4740-880f-eb3116acbc77/57de8776-a690-4e4f-b892-f10c912ec006_2x',
    file: 'images/gallery-3.jpg'
  },
  {
    url: 'https://bc-user-uploads.brandcrowd.com/public/media-Production/730fd98b-051c-4740-880f-eb3116acbc77/6470f4c3-11f3-4055-913d-1882c57aa485_2x',
    file: 'images/gallery-4.jpg'
  },
];

if (!fs.existsSync('images')) fs.mkdirSync('images');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
  for (const img of images) {
    process.stdout.write(`Stahuji ${img.file}... `);
    try {
      await download(img.url, img.file);
      const size = (fs.statSync(img.file).size / 1024).toFixed(0);
      console.log(`✓ (${size} KB)`);
    } catch (e) {
      console.log(`✗ CHYBA: ${e.message}`);
    }
  }
  console.log('\nHotovo! Všechny obrázky jsou v složce images/');
})();
