const https = require('https');
const { marked } = require('marked');
const { JSDOM } = require('jsdom');

const MARKDOWN_SOURCE =
  'https://raw.githubusercontent.com/with-backed/backed-community-nft-docs/main/README.md';

function main() {
  https
    .get(MARKDOWN_SOURCE, (resp) => {
      let data = '';

      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received.
      resp.on('end', () => {
        const html = marked.parse(data);
        const dom = new JSDOM(html);
        // TODO: would be nice to have a more sophisticated selector
        const divs = dom.window.document.querySelectorAll('div');
        divs.forEach((div) => {
          console.log(div.innerHTML);
        });
        console.log(divs.length);
      });
    })
    .on('error', (err) => {
      console.error('Error: ' + err.message);
    });
}

main();
