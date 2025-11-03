tableau.extensions.initializeAsync().then(() => {
  console.log("Scroll Sync Extension initialized");

  // wait for Tableau to finish rendering
  setTimeout(() => {
    const SHEET1_NAME = "SP-table-month";
    const SHEET2_NAME = "Supply Plan Grand Total (Monthwise)";

    const findWorksheetDiv = (name) => {
      const frames = document.querySelectorAll("iframe");
      for (let frame of frames) {
        if (frame.title.includes(name)) {
          return frame.contentDocument.querySelector("div.tabCanvas");
        }
      }
      return null;
    };

    const sheet1Div = findWorksheetDiv(SHEET1_NAME);
    const sheet2Div = findWorksheetDiv(SHEET2_NAME);

    if (!sheet1Div || !sheet2Div) {
      console.error("Worksheet divs not found—check sheet names or wait for rendering.");
      return;
    }

    console.log("Worksheet divs found, enabling sync.");
    let syncing = false;

    const syncScroll = (source, target) => {
      if (syncing) return;
      syncing = true;
      target.scrollLeft = source.scrollLeft;
      setTimeout(() => (syncing = false), 10);
    };

    sheet1Div.addEventListener("scroll", () => syncScroll(sheet1Div, sheet2Div));
    sheet2Div.addEventListener("scroll", () => syncScroll(sheet2Div, sheet1Div));
  }, 2000);
});
