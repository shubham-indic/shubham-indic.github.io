'use strict';

(function() {
  tableau.extensions.initializeAsync().then(function() {
    console.log("Scroll Sync Extension Initialized");

    // Names of the Tableau worksheets
    const sheet1Name = "SP-table-month";
    const sheet2Name = "Supply Plan Grand Total (Monthwise)";

    const dashboard = tableau.extensions.dashboardContent.dashboard;
    const sheet1 = dashboard.worksheets.find(ws => ws.name === sheet1Name);
    const sheet2 = dashboard.worksheets.find(ws => ws.name === sheet2Name);

    if (!sheet1 || !sheet2) {
      document.querySelector('.status').innerText =
        "Error: One or both worksheets not found. Please check names in Tableau.";
      return;
    }

    // Function to wait for Tableau to render both worksheets inside iframes
    function waitForIframes() {
      const iframes = document.querySelectorAll('iframe');
      if (iframes.length < 2) {
        console.log("Waiting for Tableau to render worksheets...");
        setTimeout(waitForIframes, 1000);
        return;
      }

      let iframe1, iframe2;

      // Find the correct iframes by matching worksheet names
      iframes.forEach(frame => {
        const doc = frame.contentDocument || frame.contentWindow.document;
        if (doc && doc.body && doc.body.innerText.includes(sheet1Name)) iframe1 = frame;
        if (doc && doc.body && doc.body.innerText.includes(sheet2Name)) iframe2 = frame;
      });

      if (!iframe1 || !iframe2) {
        console.log("Waiting for worksheet frames...");
        setTimeout(waitForIframes, 1000);
        return;
      }

      syncScrollBetween(iframe1, iframe2);
    }

    // Function to sync horizontal scrolls
    function syncScrollBetween(frame1, frame2) {
      const doc1 = frame1.contentDocument || frame1.contentWindow.document;
      const doc2 = frame2.contentDocument || frame2.contentWindow.document;

      let scrolling = false;

      const onScroll = (sourceDoc, targetDoc) => {
        if (scrolling) return;
        scrolling = true;
        const sourceScroll = sourceDoc.querySelector('.tab-scrollable');
        const targetScroll = targetDoc.querySelector('.tab-scrollable');

        if (sourceScroll && targetScroll) {
          targetScroll.scrollLeft = sourceScroll.scrollLeft;
        }
        setTimeout(() => (scrolling = false), 50);
      };

      const s1 = doc1.querySelector('.tab-scrollable');
      const s2 = doc2.querySelector('.tab-scrollable');

      if (s1 && s2) {
        s1.addEventListener('scroll', () => onScroll(doc1, doc2));
        s2.addEventListener('scroll', () => onScroll(doc2, doc1));
        document.querySelector('.status').innerText = "Scroll Sync Active ✅";
      } else {
        console.log("Scrollable elements not found, retrying...");
        setTimeout(() => syncScrollBetween(frame1, frame2), 1000);
      }
    }

    waitForIframes();
  });
})();
