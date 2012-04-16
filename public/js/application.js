(function() {
  var PROVIDER_FIELDS, checkSettings, loadContacts, saveSettings, sendMessage;

  PROVIDER_FIELDS = ['provider', 'username', 'password'];

  loadContacts = function() {
    try {
      if (localStorage.contacts) {
        return JSON.parse(localStorage.contacts);
      }
    } catch (e) {
      console.error("Error reading contacts: " + e);
      return false;
    }
  };

  checkSettings = function() {
    if (PROVIDER_FIELDS.every(function(x) {
      var v;
      return (v = $("#" + x).val()) && v !== "";
    })) {
      $("#save-settings").attr("disabled", false);
      $("#message-form").attr("disabled", false);
      return true;
    } else {
      $("#save-settings").attr("disabled", true);
      $("#message-form").attr("disabled", true);
      return false;
    }
  };

  saveSettings = function() {
    var x, _i, _len;
    for (_i = 0, _len = PROVIDER_FIELDS.length; _i < _len; _i++) {
      x = PROVIDER_FIELDS[_i];
      localStorage[x] = $("#" + x).val();
    }
    return $("#provider-settings").modal("hide");
  };

  sendMessage = function(e) {
    var data, r;
    e.preventDefault();
    data = {
      provider: localStorage.provider,
      username: localStorage.username,
      password: localStorage.password,
      recipients: (function() {
        var _i, _len, _ref, _results;
        _ref = $("#recipients").val().split(",");
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          r = _ref[_i];
          if (r !== "") {
            _results.push(r.trim());
          }
        }
        return _results;
      })(),
      message: $("#message").val()
    };
    return $.post($(this).attr("action"), data);
  };

  jQuery(function() {
    var contacts, x, _i, _len;
    for (_i = 0, _len = PROVIDER_FIELDS.length; _i < _len; _i++) {
      x = PROVIDER_FIELDS[_i];
      $("#" + x).val(localStorage[x]);
    }
    $("#save-settings").on("click", saveSettings);
    $("#provider-settings").on("change", checkSettings);
    if (!checkSettings()) {
      $("#provider-settings").modal("show");
    }
    if (contacts = loadContacts()) {
      $("#recipients").tokenInput(contacts, {
        hintText: 'Enter recipients'
      });
    }
    return $("#message-form").on("submit", sendMessage);
  });

}).call(this);
