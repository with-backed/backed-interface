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

function section(
  heading,
  explanation,
  [activityContent, communityContent, contributorContent],
) {
  return `
<div className={styles.section}>
  <h2>${heading}</h2>
  <p className={styles.explanation}>${explanation}</p>
  <div className={styles.xp}>
    <XPFieldset kind="activity">
      ${activityContent?.innerHTML}
    </XPFieldset>
    <XPFieldset kind="contributor">
      ${contributorContent?.innerHTML}
    </XPFieldset>
    <XPFieldset kind="community">
      ${communityContent?.innerHTML}
    </XPFieldset>
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
          const heading = s.querySelector('h3').innerHTML;
          const explanation = s.querySelector('p').innerHTML;
          const contentSections = s.querySelectorAll('.content');
          pageContent.push(section(heading, explanation, contentSections));
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
