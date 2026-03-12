<script>
  function setFavicon(url) {
    let icon = document.querySelector("link[rel='icon']");
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    icon.href = url;
  }

  function applyCloak(preset) {
    switch (preset) {
      case "google":
        document.title = "Google";
        setFavicon("https://www.google.com/favicon.ico");
        break;

      case "classroom":
        document.title = "Classes";
        setFavicon("https://www.gstatic.com/classroom/favicon.png");
        break;

      case "vocab":
        document.title = "Vocabulary.com";
        setFavicon("https://www.vocabulary.com/favicon.ico");
        break;

      case "default":
      default:
        document.title = "T9 OS";
        setFavicon("/favicon.ico"); // your site icon
        break;
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    const preset = localStorage.getItem("cloak_preset") || "default";
    console.log("🎭 Cloak applied:", preset);
    applyCloak(preset);
  });
</script>
