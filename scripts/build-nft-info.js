const https = require('https');
const { marked } = require('marked');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const { exec } = require('child_process');

const MARKDOWN_SOURCE =
  'https://raw.githubusercontent.com/with-backed/backed-community-nft-docs/main/README.md';
const IMPORTS = `
import React from 'react';
import { XPFieldset } from './XPFieldset';
import styles from './CommunityInfo.module.css';
`;

const BEGIN = `
export function GeneratedSections() {
  return (
    <>
`;
const END = `
    </>
  )
}
`;

function processFieldset(element) {
  if (element) {
    const heading = element.querySelector('h4');
    heading.remove();
  }
}

function section(
  heading,
  explanation,
  activityContent,
  communityContent,
  contributorContent,
) {
  [activityContent, communityContent, contributorContent].forEach(
    processFieldset,
  );
  return `
<div className={styles.section}>
  <h2>${heading}</h2>
  <p className={styles.explanation}>${explanation}</p>
  <div className={styles.xp}>
  ${
    activityContent
      ? `
  <XPFieldset kind="activity">
      ${activityContent.innerHTML}
    </XPFieldset>
  `
      : ''
  }
  ${
    contributorContent
      ? `
  <XPFieldset kind="contributor">
      ${contributorContent.innerHTML}
    </XPFieldset>
  `
      : ''
  }
  ${
    communityContent
      ? `
  <XPFieldset kind="community">
      ${communityContent.innerHTML}
    </XPFieldset>
  `
      : ''
  }
  </div>
</div>
`;
}

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
        const sections =
          dom.window.document.querySelectorAll('div[id^="section"]');

        const pageContent = [IMPORTS, BEGIN];
        sections.forEach((s) => {
          console.log(s.innerHTML);
          const heading = s.querySelector('h3').innerHTML;
          const explanation = s.querySelector('p').innerHTML;
          const activityContent = s.querySelector('.content-activity');
          const communityContent = s.querySelector('.content-community');
          const contributorContent = s.querySelector('.content-contributor');
          pageContent.push(
            section(
              heading,
              explanation,
              activityContent,
              communityContent,
              contributorContent,
            ),
          );
        });
        pageContent.push(END);
        fs.writeFileSync(
          './components/CommunityInfo/GeneratedSections.tsx',
          pageContent.join(''),
        );
        exec('yarn format', (err) => {
          if (err) {
            console.log(`error: ${err.message}`);
            return;
          }

          console.log('Done.');
        });
      });
    })
    .on('error', (err) => {
      console.error('Error: ' + err.message);
    });
}

main();
