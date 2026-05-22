/**
 * Check CSS Errors Script
 *
 * Script para verificar errores de CSS en el navegador
 *
 * @author AI Pair Platform - Backend Team
 * @version 1.0.0
 */

import puppeteer from "puppeteer";

async function checkCssErrors() {
  // TODO: log '🔍 Checking CSS errors in browser...\n'
  // TODO: log '='.repeat(60)

  let browser;

  try {
    // Iniciar navegador
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Capturar errores de consola
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Capturar errores de red
    const networkErrors = [];
    page.on("response", (response) => {
      if (!response.ok()) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
        });
      }
    });

    // TODO: log '🌐 Loading page...'
    await page.goto("http://localhost:8080", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // TODO: log '✅ Page loaded successfully'

    // Verificar si Tailwind CSS está cargado
    // TODO: log '\n🎨 Checking Tailwind CSS...'
    // TODO: log '='.repeat(30)

    const tailwindLoaded = await page.evaluate(() => {
      // Verificar si las clases de Tailwind están aplicadas
      const testElement = document.createElement("div");
      testElement.className = "bg-red-500 text-white p-4";
      document.body.appendChild(testElement);

      const computedStyle = window.getComputedStyle(testElement);
      const backgroundColor = computedStyle.backgroundColor;

      document.body.removeChild(testElement);

      return {
        hasTailwind: backgroundColor !== "rgba(0, 0, 0, 0)" && backgroundColor !== "transparent",
        backgroundColor: backgroundColor,
      };
    });

    // TODO: log `Tailwind CSS loaded: ${tailwindLoaded.hasTailwind ? '✅' : '❌'}`
    // TODO: log `Background color: ${tailwindLoaded.backgroundColor}`

    // Verificar CSS variables
    // TODO: log '\n🎯 Checking CSS Variables...'
    // TODO: log '='.repeat(30)

    const cssVariables = await page.evaluate(() => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      const variables = [
        "--background",
        "--foreground",
        "--primary",
        "--secondary",
        "--muted",
        "--accent",
        "--destructive",
        "--border",
        "--input",
        "--ring",
      ];

      return variables.map((varName) => ({
        name: varName,
        value: computedStyle.getPropertyValue(varName),
        exists: computedStyle.getPropertyValue(varName) !== "",
      }));
    });

    cssVariables.forEach((variable) => {
      // TODO: log `${variable.exists ? '✅' : '❌'} ${variable.name}: ${variable.value || 'not set'}`
    });

    // Verificar clases específicas
    // TODO: log '\n🔍 Checking specific classes...'
    // TODO: log '='.repeat(30)

    const classChecks = await page.evaluate(() => {
      const checks = [
        { class: "bg-primary", description: "Primary background" },
        { class: "text-foreground", description: "Foreground text" },
        { class: "border-border", description: "Border color" },
        { class: "bg-card", description: "Card background" },
        { class: "text-muted-foreground", description: "Muted text" },
      ];

      return checks.map((check) => {
        const element = document.createElement("div");
        element.className = check.class;
        document.body.appendChild(element);

        const computedStyle = window.getComputedStyle(element);
        const hasStyles =
          computedStyle.backgroundColor !== "rgba(0, 0, 0, 0)" ||
          computedStyle.color !== "rgba(0, 0, 0, 0)" ||
          computedStyle.borderColor !== "rgba(0, 0, 0, 0)";

        document.body.removeChild(element);

        return {
          class: check.class,
          description: check.description,
          working: hasStyles,
        };
      });
    });

    classChecks.forEach((check) => {
      // TODO: log `${check.working ? '✅' : '❌'} ${check.class} (${check.description})`
    });

    // Mostrar errores de consola
    if (consoleErrors.length > 0) {
      // TODO: log '\n❌ Console Errors:'
      // TODO: log '='.repeat(30)
      consoleErrors.forEach((error) => {
        // TODO: log `- ${error}`
      });
    } else {
      // TODO: log '\n✅ No console errors found'
    }

    // Mostrar errores de red
    if (networkErrors.length > 0) {
      // TODO: log '\n❌ Network Errors:'
      // TODO: log '='.repeat(30)
      networkErrors.forEach((error) => {
        // TODO: log `- ${error.url}: ${error.status} ${error.statusText}`
      });
    } else {
      // TODO: log '\n✅ No network errors found'
    }

    // Recomendaciones
    // TODO: log '\n💡 Recommendations:'
    // TODO: log '='.repeat(30)

    if (!tailwindLoaded.hasTailwind) {
      // TODO: log '❌ Tailwind CSS is not loading properly'
      // TODO: log '   - Check PostCSS configuration'
      // TODO: log '   - Verify Tailwind CSS is installed'
      // TODO: log '   - Restart development server'
    }

    const missingVariables = cssVariables.filter((v) => !v.exists);
    if (missingVariables.length > 0) {
      // TODO: log '❌ Missing CSS variables:'
      missingVariables.forEach((v) => {
        // TODO: log `   - ${v.name}`
      });
    }

    const brokenClasses = classChecks.filter((c) => !c.working);
    if (brokenClasses.length > 0) {
      // TODO: log '❌ Broken Tailwind classes:'
      brokenClasses.forEach((c) => {
        // TODO: log `   - ${c.class}`
      });
    }

    if (tailwindLoaded.hasTailwind && missingVariables.length === 0 && brokenClasses.length === 0) {
      // TODO: log '✅ All CSS systems are working correctly!'
    }
  } catch (error) {
    // TODO: log '❌ Error during CSS check:' error.message
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // TODO: log '\n' + '='.repeat(60)
  // TODO: log '🔍 CSS ERROR CHECK COMPLETED'
  // TODO: log '='.repeat(60)
}

checkCssErrors();
