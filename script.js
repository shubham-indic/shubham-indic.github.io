'use strict';

(function() {
  tableau.extensions.initializeAsync().then(() => {
    console.log("Scroll Sync Extension initialized ✅");

    const sheet1Name = "SP-table-month";
    const sheet2Name = "Supply Plan Grand Total (Monthwise)";
    const dashboard = tableau.extensions.dashboardContent.dashboard;

    const sheet1 = dashboard.worksheets.find(ws => ws.name === sheet1Name);
    const sheet2 = dashboard.worksheets.find(ws => ws.name === sheet2Name);

    if (!sheet1 || !sheet2) {
      document.querySelector('.status').innerText =
        "❌ Error: One or both worksheet names not found. Check your sheet names.";
      return;
    }

    // Poll the DOM until Tableau renders both worksheet views
    function waitForScrollRegions() {
      // Tableau renders worksheet views in nested iframes; pick scrollable divs
      const scrollDivs = Array.from(
        parent.document.querySelectorAll('.tab-worksheet-view, .tabCanvasScrollingRegion, .tab-content')
      ).filter(div => div.scrollWidth > div.clientWidth);

      if (scrollDivs.length < 2) {
        console.log("⏳ Waiting for Tableau scrollable regions...");
        setTimeout(waitForScrollRegions, 1000);
        return;
      }

      // You can adjust indexes if Tableau adds other scrollables above
      const scroll1 = scrollDivs[0];
      const scroll2 = scrollDivs[1];

      syncScroll(scroll1, scroll2);
    }

    function syncScroll(div1, div2) {
      let syncing = false;

      const onScroll = (source, target) => {
        if (syncing) return;
        syncing = true;
        target.scrollLeft = source.scrollLeft; // horizontal
        target.scrollTop = source.scrollTop;   // vertical (optional)
        setTimeout(() => (syncing = false), 20);
      };

      div1.addEventListener('scroll', () => onScroll(div1, div2));
      div2.addEventListener('scroll', () => onScroll(div2, div1));

      document.querySelector('.status').innerText = "✅ Scroll Sync Active (Horizontal + Vertical)";
      console.log("Scroll sync connected between both sheets.");
    }

    waitForScrollRegions();
  });
})();
