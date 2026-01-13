(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var burger = header.querySelector('.dr-header-burger');
  var navList = header.querySelector('.dr-nav-list');
  if (!burger || !navList) return;

  burger.addEventListener('click', function () {
    var isOpen = burger.classList.toggle('dr-is-open');
    if (isOpen) {
      navList.classList.add('dr-is-open');
      burger.setAttribute('aria-expanded', 'true');
    } else {
      navList.classList.remove('dr-is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
})();
