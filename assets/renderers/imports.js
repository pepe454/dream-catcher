const path = require('path')
const glob = require('glob')
const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)

async function getAppContent(filepath) {
  let response = await readFile(filepath, 'utf-8');
  let html = new DOMParser().parseFromString(response, 'text/html')
  return html.querySelector('.app-content');
}

// Require each html section included in ./sections/
async function loadSections () {
  const files = glob.sync(path.join(__dirname, '../../', 'sections/**/*.html'))
  files.forEach(async (file) => { 
    let appContent = await getAppContent(file)
    document.querySelector('.section-content').appendChild(appContent)
  })
}

loadSections()