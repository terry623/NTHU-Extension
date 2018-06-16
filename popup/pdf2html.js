// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
// var url;

// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window["pdfjs-dist/build/pdf"];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://mozilla.github.io/pdf.js/build/pdf.worker.js";

var pdfDoc = null,
  pageNum = 1,
  pageRendering = false,
  pageNumPending = null,
  scale = 1.05,
  canvas,
  ctx;

function renderPage(num) {
  pageRendering = true;
  // Using promise to fetch the page
  pdfDoc.getPage(num).then(page => {
    let viewport = page.getViewport(scale);
    if (viewport.width > viewport.height) {
      scale = 0.69;
      viewport = page.getViewport(scale);
    }
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    // canvas.height = 707.844;
    // canvas.width = 623.391;

    // Render PDF page into canvas context
    let renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    let renderTask = page.render(renderContext);

    // Wait for rendering to finish
    renderTask.promise.then(() => {
      $("#pdf_render").show();
      pageRendering = false;
      if (pageNumPending !== null) {
        // New page rendering is pending
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });

  // Update page counters
  document.getElementById("page_num").textContent = num;
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
  if (pageRendering) pageNumPending = num;
  else renderPage(num);
}

/**
 * Displays previous page.
 */
function onPrevPage() {
  if (pageNum <= 1) return;

  pageNum--;
  queueRenderPage(pageNum);
}

/**
 * Displays next page.
 */
function onNextPage() {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
}

function transform(url) {
  /**
   * Asynchronously downloads PDF.
   */
  canvas = document.getElementById("the-canvas");
  ctx = canvas.getContext("2d");

  (pdfDoc = null),
    (pageNum = 1),
    (pageRendering = false),
    (pageNumPending = null),
    (scale = 1.05),
    document.getElementById("prev").addEventListener("click", onPrevPage);
  document.getElementById("next").addEventListener("click", onNextPage);

  pdfjsLib.getDocument(url).then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById("page_count").textContent = pdfDoc.numPages;

    // Initial/first page rendering
    renderPage(pageNum);
  });
}

export { transform };
