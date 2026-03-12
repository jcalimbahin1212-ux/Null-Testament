document.addEventListener("DOMContentLoaded", () => {
  const adBlockedIDs = ["0702186673","4084803237","0635354315"];
  const myID = localStorage.getItem("numericUserID");

  if (!adBlockedIDs.includes(myID)) {
    (function(s){
      s.dataset.zone='10569238';
      s.src='https://al5sm.com/tag.min.js';
    })(
      [document.documentElement, document.body]
        .filter(Boolean)
        .pop()
        .appendChild(document.createElement('script'))
    );
  }
});
