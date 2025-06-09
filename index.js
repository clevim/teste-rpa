const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(pluginStealth());

async function sleep(seconds) {
  return await new Promise((resolve) => {
    setTimeout(() => resolve({}), seconds * 1000);
  });
}

async function search(frame, cnpj) {
  try {
    await frame.waitForSelector("input[id=Cnpj]", { visible: true });
    await sleep(1 + Math.random() * 1);
    await frame.type("input[id=Cnpj]", cnpj);
    await sleep(1 + Math.random() * 1);
    await frame.click("#consultarForm > button");
  } catch (err) {
    console.error("Erro na função search:", err);
    throw err;
  }
}

async function getData(frame) {
  try {
    await frame.waitForSelector("#conteudo");
    await sleep(1 + Math.random() * 1);
    const cnpj = await frame.evaluate(() => {
      const elementFrame = document.querySelector(
        "#conteudo > div:nth-child(2) > div.panel-body > span:nth-child(1)"
      );
      return elementFrame?.textContent || "";
    });
    const situacaoSN = await frame.evaluate(() => {
      const elementFrame = document.querySelector(
        "#conteudo > div:nth-child(3) > div.panel-body > span:nth-child(1)"
      );
      return elementFrame?.textContent || "";
    });
    const situacaoSimei = await frame.evaluate(() => {
      const elementFrame = document.querySelector(
        "#conteudo > div:nth-child(3) > div.panel-body > span:nth-child(3)"
      );
      return elementFrame?.textContent || "";
    });

    return {
      cnpj,
      situacaoSN,
      situacaoSimei,
    };
  } catch (err) {
    console.error("Erro na função getData", err);
    throw err;
  }
}

async function main() {
  const cnpj = "25021140000177";
  let browser;

  try {
    browser = await puppeteer.launch({
      executablePath: puppeteer.executablePath(),
      headless: false,
      ignoreHTTPSErrors: true,
      args: [
        "--no-sandbox",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--start-maximized",
      ],
    });

    const pages = await browser.pages();
    const page = pages[0];
    await page.goto(
      "https://www8.receita.fazenda.gov.br/SimplesNacional/aplicacoes.aspx?id=21"
    );
    await page.waitForSelector("#frame");
    const elementFrame = await page.$("#frame");
    const frame = await elementFrame.contentFrame();
    await search(frame, cnpj);
    const data = await getData(frame);
    console.log(data);
  } catch (err) {
    console.error("Erro na função main: ", err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
