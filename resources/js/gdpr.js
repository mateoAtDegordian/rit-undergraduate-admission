$(document).ready(function() {
  const $banner = $('.footer_gdpr');
  const $triangle = $('.triangle-bottomleft');

  const readCookie = (name) => {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  };

  const parseConsent = (value) => {
    if (!value) return null;
    const parts = value.split('&');
    const data = {};
    parts.forEach((part) => {
      const [key, rawValue] = part.split('=');
      if (!key) return;
      data[key] = rawValue === 'true';
    });
    return data;
  };

  const resolveCookieDomain = () => {
    const host = window.location.hostname;
    if (!host) return '';
    if (host === 'rit.edu' || host.endsWith('.rit.edu')) {
      return '.rit.edu';
    }
    return '';
  };

  const buildCookie = (value) => {
    const segments = [
      'gdpr_val=' + encodeURIComponent(value),
      'Max-Age=' + (60 * 60 * 24 * 365),
      'Path=/',
      'SameSite=Lax',
    ];
    const domain = resolveCookieDomain();
    if (domain) {
      segments.push('Domain=' + domain);
    }
    if (window.location.protocol === 'https:') {
      segments.push('Secure');
    }
    return segments.join('; ');
  };

  const setConsentCookie = (value) => {
    document.cookie = "gdpr_val=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.cookie = buildCookie(value);
  };

  const syncHiddenValues = () => {
    $('#necessaryval').val($('#necessary').prop('checked'));
    $('#statisticval').val($('#statistic').prop('checked'));
    $('#marketingval').val($('#marketing').prop('checked'));
  };

  const applyConsentToUI = (consent) => {
    if (consent) {
      $banner.hide();
      $triangle.show();
    } else {
      $banner.show();
      $triangle.hide();
    }
  };

  $('#necessary').change(function() {
    $('#necessaryval').val($(this).prop('checked'));
  });
  $('#statistic').change(function() {
    $('#statisticval').val($(this).prop('checked'));
  });
  $('#marketing').change(function() {
    $('#marketingval').val($(this).prop('checked'));
  });

  $('.panel2').hide();
  $('#selectcookie_btn').click(function() {
    $('.panel1,.panel2').slideToggle("slow");
  });

  const storedConsent = parseConsent(readCookie('gdpr_val'));
  if (storedConsent) {
    if (storedConsent.statistic === false) {
      $('#statistic').prop('checked', false);
    }
    if (storedConsent.marketing === false) {
      $('#marketing').prop('checked', false);
    }
    syncHiddenValues();
  }
  applyConsentToUI(storedConsent);

  $('.allCookeSubmit').on('click', function() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'statistic_consent_given',
      'cookies_statistic': 'consent_given',
    });

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'marketing_consent_given',
      'cookies_marketing': 'consent_given',
    });

    setConsentCookie('necessary=true&preference=true&statistic=true&marketing=true&all=true');
    applyConsentToUI(true);
    $("#blockScrn").remove();
  });

  $('.cookeSelectSubmit').on('click', function() {
    syncHiddenValues();

    if ($('#statistic').is(':checked')) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'statistic_consent_given',
        'cookies_statistic': 'consent_given',
      });
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'statistic_consent_revoked',
        'cookies_statistic': 'consent_revoked',
      });
    }

    if ($('#marketing').is(':checked')) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'marketing_consent_given',
        'cookies_marketing': 'consent_given',
      });
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'marketing_consent_revoked',
        'cookies_marketing': 'consent_revoked',
      });
    }

    const cookievalue = 'necessary=' + $('#necessaryval').val()
      + '&preference=' + $('#preferenceval').val()
      + '&statistic=' + $('#statisticval').val()
      + '&marketing=' + $('#marketingval').val()
      + '&all=' + $('#allval').val();

    setConsentCookie(cookievalue);
    applyConsentToUI(true);

    const isCroatiaDomain = window.location.hostname === 'www.croatia.rit.edu' || window.location.hostname === 'croatia.rit.edu';
    if (isCroatiaDomain) {
      $.ajax({
        type: 'POST',
        url: "https://www.croatia.rit.edu/gdpr/gdpr_controller.php",
        data: 'gdpr=true&necessary=' + $('#necessaryval').val() + '&preference=' + $('#preferenceval').val() + '&statistic=' + $('#statisticval').val() + '&marketing=' + $('#marketingval').val() + '&all=' + $('#allval').val(),
        success: function(data) {
          $('#gdpr_script').html(data);
          $("#blockScrn").remove();
        }
      });
    } else {
      $("#blockScrn").remove();
    }
  });

  $triangle.on('click', function() {
    $triangle.hide();
    $banner.show();
    $('.panel2').hide();
    $('.panel1').show();
  });

  $.fn.scrollView = function() {
    return this.each(function() {
      $('html, body').animate({
        scrollTop: $(this).offset().top - 15
      }, 800);
    });
  };
});
