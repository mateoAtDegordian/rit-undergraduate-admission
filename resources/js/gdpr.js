$(document).ready(function() {
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
  var host = window.location.hostname;
  var isRitDomainHost = /(^|\.)rit\.edu$/i.test(host);
  var isCroatiaRitHost = /(^|\.)croatia\.rit\.edu$/i.test(host);
  var isHttps = window.location.protocol === 'https:';

  function buildCookieAttributes(maxAgeSeconds) {
    var attributes = [];
    attributes.push('Max-Age=' + (typeof maxAgeSeconds === 'number' ? maxAgeSeconds : 0));
    attributes.push('Path=/');
    attributes.push('SameSite=Lax');
    if (isRitDomainHost) {
      attributes.push('Domain=.rit.edu');
    }
    if (isHttps) {
      attributes.push('Secure');
    }
    return attributes.join('; ');
  }

  function writeGdprCookie(value, maxAgeSeconds) {
    document.cookie = 'gdpr_val=' + value + '; ' + buildCookieAttributes(maxAgeSeconds);
  }

  function updateGdprCookie(value) {
    writeGdprCookie('', 0);
    writeGdprCookie(value, COOKIE_MAX_AGE);
  }

  function updateGdprScriptContainer(payload) {
    var gdprScript = $('#gdpr_script');
    if (gdprScript.length) {
      gdprScript.html(payload || '');
    }
  }

  function finalizeConsent(cookieValue, responsePayload) {
    updateGdprCookie(cookieValue);
    updateGdprScriptContainer(responsePayload);
    $('#blockScrn').remove();
  }

  function syncConsent(cookieValue, requestBody) {
    if (isCroatiaRitHost) {
      $.ajax({
        type: 'POST',
        url: 'https://www.croatia.rit.edu/gdpr/gdpr_controller.php',
        data: requestBody,
        success: function(data) {
          finalizeConsent(cookieValue, data);
        },
        error: function(xhr, status, errorThrown) {
          console.warn('GDPR sync failed, persisting locally instead.', status || errorThrown);
          finalizeConsent(cookieValue);
        }
      });
    } else {
      console.warn('Skipping GDPR sync for non-production host:', window.location.origin);
      finalizeConsent(cookieValue);
    }
  }

  function getCookieValue(name) {
    var nameEq = name + '=';
    var parts = document.cookie ? document.cookie.split(';') : [];
    for (var i = 0; i < parts.length; i += 1) {
      var cookie = parts[i].trim();
      if (cookie.indexOf(nameEq) === 0) {
        return decodeURIComponent(cookie.substring(nameEq.length));
      }
    }
    return '';
  }

  function parseConsentMap(serialized) {
    var result = {};
    if (!serialized) {
      return result;
    }
    serialized.split('&').forEach(function(entry) {
      var pair = entry.split('=');
      if (pair[0]) {
        result[pair[0]] = pair[1];
      }
    });
    return result;
  }

  function asBooleanString(value, fallback) {
    if (value === 'true' || value === true) {
      return 'true';
    }
    if (value === 'false' || value === false) {
      return 'false';
    }
    return fallback ? 'true' : 'false';
  }

  function applyStoredConsent(consentMap) {
    var statisticAllowed = asBooleanString(consentMap.statistic, true) === 'true';
    var marketingAllowed = asBooleanString(consentMap.marketing, true) === 'true';
    var preferenceAllowed = asBooleanString(consentMap.preference, true) === 'true';
    var allAllowed = asBooleanString(consentMap.all, statisticAllowed && marketingAllowed) === 'true';

    $('#statistic').prop('checked', statisticAllowed);
    $('#marketing').prop('checked', marketingAllowed);

    $('#necessaryval').val('true');
    $('#preferenceval').val(preferenceAllowed);
    $('#statisticval').val(statisticAllowed);
    $('#marketingval').val(marketingAllowed);
    $('#allval').val(allAllowed);
  }

  function collapseBanner() {
    var banner = $('.footer_gdpr');
    if (!banner.length) {
      return;
    }
    banner.removeClass('new slideInUp').addClass('gdpr_true slideOutDown animated');
    $('.triangle-bottomleft').css('display', 'block').removeClass('slideOutDown').addClass('slideInUp animated');
    $('#blockScrn').remove();
  }

  function initializeConsentFromCookie() {
    var stored = getCookieValue('gdpr_val');
    if (!stored) {
      return;
    }
    var consentMap = parseConsentMap(stored);
    applyStoredConsent(consentMap);
    collapseBanner();
  }

  $('#necessary').change(function() {
      $('#necessaryval').val($(this).prop('checked'))
  })
  $('#statistic').change(function() {
      $('#statisticval').val($(this).prop('checked'))
  })
  $('#marketing').change(function() {
      $('#marketingval').val($(this).prop('checked'))
  })
  $('.panel2').hide();
  $('#selectcookie_btn').click(function() {
      $('.panel1,.panel2').slideToggle("slow");
  });
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

      updateGdprCookie('necessary=true&preference=true&statistic=true&marketing=true&all=true');

      $('.gdpr').addClass("slideOutDown animated");
      $("#blockScrn").remove();
      setTimeout(function() {
          $('.gdpr').addClass(" gdpr_true");
          $('.gdpr').removeClass("new");
          $('.gdpr_true').removeClass(" slideInUp ");
          $('.triangle-bottomleft').css('display', 'block');
          $('.triangle-bottomleft').removeClass("slideOutDown  animated");
          $('.triangle-bottomleft').addClass("slideInUp  animated");
      }, 1000);
      //window.location.reload(true);
  });
  $('.cookeSelectSubmit').on('click', function() {
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

      $('.gdpr').addClass("slideOutDown animated");
      setTimeout(function() {
          $('.gdpr').addClass(" gdpr_true")
          $('.gdpr_true').removeClass(" slideInUp ");
          $('.triangle-bottomleft').css('display', 'block');
          $('.triangle-bottomleft').removeClass("slideOutDown  animated");
          $('.triangle-bottomleft').addClass("slideInUp  animated");
      }, 1000);
        var cookievalue = 'necessary=' + $('#necessaryval').val() + '&preference=' + $('#preferenceval').val() + '&statistic=' + $('#statisticval').val() + '&marketing=' + $('#marketingval').val() + '&all=' + $('#allval').val();
        var requestBody = 'gdpr=true&' + cookievalue;

        syncConsent(cookievalue, requestBody);
  });
  var height = $('.gdpr_true').height();
  $('.gdpr_true').addClass(" slideOutDown ");
  $('.triangle-bottomleft').on('click', function() {
      $('.triangle-bottomleft').removeClass(" slideInUp animated ");
      $('.triangle-bottomleft').addClass(" slideOutDown animated ")
      $('.gdpr_true').addClass(" slideInUp ");
      $('.gdpr_true').removeClass("gdpr_true slideOutDown").addClass("gdpr").animate({
          "bottom": "0px"
      }, "slow");
  });
  $.fn.scrollView = function() {
      return this.each(function() {
          $('html, body').animate({
              scrollTop: $(this).offset().top - 15
          }, 800);
      });
  }
});
    initializeConsentFromCookie();
