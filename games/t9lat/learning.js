 function openT9() {
      const preset = localStorage.getItem("cloak_preset") || "default";

      let title = "T9 OS";
      let favicon = "favicon.png";

      switch (preset) {
        case "google":
          title = "Google";
          favicon = "https://www.google.com/favicon.ico";
          break;
        case "classroom":
          title = "Google Classroom";
          favicon = "https://www.gstatic.com/classroom/logo_square_rounded.svg";
          break;
        case "vocab":
          title = "Vocabulary.com";
          favicon = "https://www.vocabulary.com/favicon.ico";
          break;
      }

      const iframeUrl = "start.html";

      const win = window.open();

      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <link rel="icon" href="${favicon}" type="image/x-icon">
            <style>
              html, body { margin:0; padding:0; height:100%; overflow:hidden; }
              iframe { position:fixed; top:0; left:0; width:100vw; height:100vh; border:none; }
            </style>
          </head>
          <body>
            <iframe src="${iframeUrl}"></iframe>
          </body>
        </html>
      `);
      win.document.close();
    }