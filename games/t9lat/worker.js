export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get("url");

    if (!target) {
      return new Response(
        `<html><body><h1>Math</h1>
        <p>math</p></body></html>`,
        { headers: { "content-type": "text/html" } }
      );
    }

    try {
      // Use streaming fetch for speed
      const response = await fetch(target, {
        headers: { "User-Agent": request.headers.get("User-Agent") || "Mozilla/5.0" },
        redirect: "follow",
      });

      const headers = new Headers(response.headers);
      headers.set("access-control-allow-origin", "*");
      headers.set("access-control-expose-headers", "*");
      headers.set("cache-control", "max-age=3600"); // Cache static assets for 1 hour

      const contentType = headers.get("content-type") || "";

      if (contentType.includes("text/html")) {
        // Only minimally rewrite HTML to fix links
        const reader = response.body.getReader();
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        async function process() {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            let chunk = decoder.decode(value, { stream: true });
            // Rewrite src/href/action to go through proxy
            chunk = chunk.replace(/(src|href|action)=["'](http[s]?:\/\/[^"']+)["']/g,
              (m, attr, link) => `${attr}="${url.origin}?url=${encodeURIComponent(link)}"`);
            await writer.write(encoder.encode(chunk));
          }
          writer.close();
        }

        process();
        return new Response(readable, { status: response.status, headers });
      }

      // Stream other content directly
      return new Response(response.body, { status: response.status, headers });

    } catch (err) {
      return new Response("Proxy Error: " + err.message, { status: 500 });
    }
  }
};
