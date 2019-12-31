(function($) {
  // menu
  const $currentMenu = $('.item.current');
  $currentMenu.get(0).scrollIntoView();

  // mobile-menu
  $('.nav-mobile .btn').click(function() {
    const isActive = $(this).hasClass('active');
    $('.nav-mobile .btn').removeClass('active');
    $('.nav-mobile .list').removeClass('active');
    if (!isActive) {
      $(this).addClass('active');
      $(`.nav-mobile .${$(this).data('type')}-list`).addClass('active');
    }
  })
})($);