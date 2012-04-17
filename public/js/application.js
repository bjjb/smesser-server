(function() {
  var PROVIDER_FIELDS, addContact, checkSettings, googleContactsService, handleGoogleContactsError, handleGoogleContactsFeed, loadContacts, loadGoogleContacts, processGoogleContactsFeeds, saveSettings, sendMessage;

  PROVIDER_FIELDS = ['provider', 'username', 'password'];

  loadContacts = function() {
    var contacts;
    try {
      if (localStorage.contacts) {
        contacts = JSON.parse(localStorage.contacts);
      }
      if ($("#recipients").data("tokenInputObject")) {
        $("#recipients").tokenInput("clear");
        $("#recipients").siblings(".token-input-list").remove();
      }
      return $("#recipients").tokenInput(contacts, {
        hintText: 'Enter recipients'
      });
    } catch (e) {
      console.error("Error reading contacts: " + e);
      return false;
    }
  };

  addContact = function(name, number) {
    var contacts;
    contacts = JSON.parse(localStorage.contacts);
    contacts.push({
      name: name,
      id: number
    });
    return localStorage.contacts = JSON.stringify(contacts);
  };

  googleContactsService = null;

  loadGoogleContacts = function() {
    var feedURL, scope;
    scope = 'https://www.google.com/m8/feeds';
    if (google.accounts.user.checkLogin(scope) === "") {
      google.accounts.user.login(scope);
    }
    if (googleContactsService == null) {
      googleContactsService = new google.gdata.contacts.ContactsService("smesser-0.0.2");
    }
    console.debug("Getting the full feed...");
    feedURL = 'https://www.google.com/m8/feeds/contacts/default/full';
    localStorage.contacts = JSON.stringify([]);
    return processGoogleContactsFeeds(feedURL);
  };

  processGoogleContactsFeeds = function(feedURL) {
    var query;
    query = new google.gdata.contacts.ContactQuery(feedURL);
    return googleContactsService.getContactFeed(query, handleGoogleContactsFeed, handleGoogleContactsError);
  };

  handleGoogleContactsFeed = function(result) {
    var entry, feedURL, name, number, phoneNumber, title, _i, _j, _len, _len1, _ref, _ref1;
    _ref = result.feed.entry;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      entry = _ref[_i];
      title = entry.getTitle().getText();
      _ref1 = entry.getPhoneNumbers();
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        phoneNumber = _ref1[_j];
        number = phoneNumber.getValue();
        name = "" + title + " (" + number + ")";
        console.debug(" + " + name);
        addContact(name, number);
      }
    }
    feedURL = result.feed.getNextLink();
    console.debug("Next link: %o", feedURL);
    if (feedURL != null) {
      return processGoogleContactsFeeds(feedURL.href);
    } else {
      return loadContacts();
    }
  };

  handleGoogleContactsError = function(error) {
    console.debug("handleGoogleContactsError...");
    alert("There was an error getting the Google contacts!");
    return console.error(error);
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
    $("#provider-settings").modal("hide");
    return loadContacts();
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
    $("#message-form").on("submit", sendMessage);
    return loadContacts();
  });

  google.load("gdata", "1.x");

  google.setOnLoadCallback(function() {
    console.log("Google is loaded!");
    return $("#google-contacts-button").live("click", loadGoogleContacts);
  });

}).call(this);
