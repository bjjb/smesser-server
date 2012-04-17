(function() {
  var PROVIDER_FIELDS, addContact, addGoogleContact, checkSettings, googleContacts, handleGoogleContactsError, handleGoogleContactsFeed, loadContacts, loadGoogleContacts, saveSettings, sendMessage;

  PROVIDER_FIELDS = ['provider', 'username', 'password'];

  this.__defineGetter__("googleContacts", function() {
    return googleContacts;
  });

  loadContacts = function() {
    var contacts;
    try {
      if (localStorage.contacts) {
        contacts = JSON.parse(localStorage.contacts);
      }
      return $("#recipients").tokenInput(contacts, {
        hintText: 'Enter recipients'
      });
    } catch (e) {
      console.error("Error reading contacts: " + e);
      return false;
    }
  };

  addContact = function(name, id) {
    var contacts;
    contacts = JSON.parse(localStorage.contacts);
    contacts.push({
      name: name,
      id: id
    });
    console.debug("Added contact " + name + ": " + id + " (" + contacts.size + " total)");
    return localStorage.contacts = JSON.stringify(contacts);
  };

  googleContacts = null;

  loadGoogleContacts = function() {
    var feed, query, scope, service;
    scope = 'https://www.google.com/m8/feeds';
    if (google.accounts.user.checkLogin(scope) === "") {
      google.accounts.user.login(scope);
    }
    service = new google.gdata.contacts.ContactsService("smesser-0.0.2");
    feed = 'https://www.google.com/m8/feeds/contacts/default/full';
    query = new google.gdata.contacts.ContactQuery(feed);
    localStorage.contacts = JSON.stringify([]);
    return service.getContactFeed(query, handleGoogleContactsFeed, handleGoogleContactsError);
  };

  handleGoogleContactsFeed = function(result) {
    var entry, id, name, number, phoneNumber, title, _i, _len, _ref, _results;
    _ref = result.feed.entry;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      entry = _ref[_i];
      title = entry.getTitle().getText();
      _results.push((function() {
        var _j, _len1, _ref1, _results1;
        _ref1 = entry.getPhoneNumbers();
        _results1 = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          phoneNumber = _ref1[_j];
          number = phoneNumber.getValue();
          name = "" + title + " (" + number + ")";
          id = number;
          _results1.push(addContact(name, number));
        }
        return _results1;
      })());
    }
    return _results;
  };

  handleGoogleContactsError = function(error) {
    console.debug("handleGoogleContactsError...");
    alert("There was an error getting the Google contacts!");
    return console.error(error);
  };

  addGoogleContact = function(entry) {
    var n, _i, _len, _ref, _results;
    console.log(entry.getTitle().getText());
    _ref = entry.getPhoneNumbers();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      n = _ref[_i];
      _results.push(console.log(n.getValue()));
    }
    return _results;
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
    var x, _i, _len;
    for (_i = 0, _len = PROVIDER_FIELDS.length; _i < _len; _i++) {
      x = PROVIDER_FIELDS[_i];
      $("#" + x).val(localStorage[x]);
    }
    $("#save-settings").on("click", saveSettings);
    $("#provider-settings").on("change", checkSettings);
    if (!checkSettings()) {
      $("#provider-settings").modal("show");
    }
    loadContacts();
    return $("#message-form").on("submit", sendMessage);
  });

  google.load("gdata", "1.x");

  google.setOnLoadCallback(function() {
    console.log("Google is loaded!");
    return $("#google-contacts-button").live("click", loadGoogleContacts);
  });

}).call(this);
