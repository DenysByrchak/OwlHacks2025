export function loadHead() {
  // Only attach Bootstrap JS; all CSS is linked statically in <head>.
  const bs = document.createElement("script");
  bs.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js";
  bs.defer = true;
  document.head.appendChild(bs);
}
