/* Первая страница сайта: всегда визитка. После входа — переход к урокам (course.html). */
(function () {
  "use strict";
  var M = window.Marathon;
  var root = document.getElementById("app");

  M.setHeader();
  var brand = document.querySelector("[data-home-link]");
  if (brand) brand.setAttribute("href", M.landingLink());
  var bonus = document.querySelector("[data-bonus-link]");
  if (bonus) bonus.remove();

  window.MarathonLanding(root, null, function (courseId) {
    location.href = M.homeLink(courseId);
  });
})();
