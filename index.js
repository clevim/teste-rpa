const puppeteer = require('puppeteer-extra')
const pluginStealth = require('puppeteer-extra-plugin-stealth')
puppeteer.use(pluginStealth())

async function sleep (seconds) {
  return await new Promise((resolve) => {
    setTimeout(() => resolve({}), seconds * 1000)
  })
}

async function search (frame, cnpj) {
  await sleep(1 + Math.random() * 1)
  await frame.type('input[id=cnpj]', cnpj)
  await sleep(1 + Math.random() * 1)
  await frame.click('button[confirmar]')
}

async function getData (frame) {
  const cnpj = await frame.evaluate(() => {
    const elementFrame = document.querySelector("#conteudo > div:nth-child(0) > div.panel-body > span:nth-child(1)")
    return elementFrame.textContent
  })
  const situacaoSN = ''
  const situacaoSimei = ''

  return {
    cnpj,
    situacaoSN,
    situacaoSimei
  }
}

async function main () {
  const cnpj = '25021140000177'
  const browser = await puppeteer.launch({
    executablePath: '',
    headless: false,
    ignoreHTTPSErrors: true,
    args: [
      '--no-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--start-maximized'
    ]
  })

  const pages = await browser.pages()
  const page = pages[0]
  await page.goto('https://www8.receita.fazenda.gov.br/SimplesNacional/aplicacoes.aspx?id=21')
  await page.waitForSelector('#frame')
  const elementFrame = await page.$('#frame')
  const frame = await elementFrame.contentFrame()
  await search(frame, cnpj)
  const data = await getData(frame)
  console.log(data)
  await browser.close()
}

main()