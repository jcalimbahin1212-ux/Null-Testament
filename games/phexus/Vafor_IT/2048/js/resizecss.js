function applyMediaQueryRulesGlobally() {
    const stylesheets = document.styleSheets;

    for (let i = 0; i < stylesheets.length; i++) {
      const stylesheet = stylesheets[i];

      try {
        for (let j = 0; j < stylesheet.cssRules.length; j++) {
          const rule = stylesheet.cssRules[j];

          if (rule.media && rule.media.mediaText.includes("520px")) {
            for (let k = 0; k < rule.cssRules.length; k++) {
              const mediaRule = rule.cssRules[k];
              const style = document.createElement('style');
              style.innerHTML = mediaRule.cssText;
              document.head.appendChild(style);
            }
          }
        }
      } catch (e) {
        console.warn("Could not access stylesheet:", e);
      }
    }
  }

  applyMediaQueryRulesGlobally();