$(document).ready(function() {
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

      // Clear any old host-only cookie, then set cross-subdomain cookie
      document.cookie = "gdpr_val=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie =
        "gdpr_val=necessary=true&preference=true&statistic=true&marketing=true&all=true"
        + "; Max-Age=" + (60*60*24*365)   // 1 year
        + "; Path=/"
        + "; Domain=.rit.edu"
        + "; SameSite=Lax"
        + "; Secure";

      $('.gdpr').addClass("slideOutDown animated");
      $("#blockScrn").remove();
      setTimeout(function() {
          $('.gdpr').addClass(" gdpr_true");
          $('.gdpr').removeClass("new");
          $('.gdpr_true').removeClass(" slideInUp ");
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
          $('.triangle-bottomleft').removeClass("slideOutDown  animated");
          $('.triangle-bottomleft').addClass("slideInUp  animated");
      }, 1000);
      $.ajax({
          type: 'POST',
          url: "https://www.croatia.rit.edu/gdpr/gdpr_controller.php",
          data: 'gdpr=true&necessary=' + $('#necessaryval').val() + '&preference=' + $('#preferenceval').val() + '&statistic=' + $('#statisticval').val() + '&marketing=' + $('#marketingval').val() + '&all=' + $('#allval').val(),
          success: function(data) {
              insertCookie();
              $('#gdpr_script').html(data);
              $("#blockScrn").remove();
          }
      });

      function insertCookie() {
          var cookievalue = 'necessary=' + $('#necessaryval').val() + '&preference=' + $('#preferenceval').val() + '&statistic=' + $('#statisticval').val() + '&marketing=' + $('#marketingval').val() + '&all=' + $('#allval').val();

          // Clear old host-only cookie, then set cross-subdomain cookie
          document.cookie = "gdpr_val=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
          document.cookie =
            "gdpr_val=" + cookievalue
            + "; Max-Age=" + (60*60*24*365)
            + "; Path=/"
            + "; Domain=.rit.edu"
            + "; SameSite=Lax"
            + "; Secure";
      }
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
