(function($){
  function updateProgress(){
    const doc = document.documentElement, body = document.body;
    const scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    const scrollHeight = Math.max(body.scrollHeight, doc.scrollHeight, body.offsetHeight, doc.offsetHeight, body.clientHeight, doc.clientHeight);
    const winHeight = window.innerHeight || doc.clientHeight;
    const max = scrollHeight - winHeight;
    const pct = max>0 ? Math.min(100, Math.round((scrollTop/max)*100)) : 0;
    $('#progressBar').css('width', pct + '%');
    $('#progressBar')[pct>=90 ? 'addClass' : 'removeClass']('glow');
  }
  $(window).on('scroll resize load', updateProgress);
  $(updateProgress);
})(jQuery);