PROVIDER_FIELDS = ['provider', 'username', 'password']
@__defineGetter__ "googleContacts", -> googleContacts

# Load the contacts from localStorage
loadContacts = ->
  try
    contacts = JSON.parse(localStorage.contacts) if localStorage.contacts
    $("#recipients").tokenInput(contacts, { hintText: 'Enter recipients' })
  catch e
    console.error("Error reading contacts: #{e}")
    false

addContact = (name, id) ->
  contacts = JSON.parse(localStorage.contacts)
  contacts.push { name: name, id: id }
  console.debug("Added contact #{name}: #{id} (#{contacts.size} total)")
  localStorage.contacts = JSON.stringify(contacts)

# Start loading Google contacts from the web into localStorage
googleContacts = null
loadGoogleContacts = ->
  scope = 'https://www.google.com/m8/feeds'
  google.accounts.user.login(scope) if google.accounts.user.checkLogin(scope) is ""
  service = new google.gdata.contacts.ContactsService("smesser-0.0.2")
  feed = 'https://www.google.com/m8/feeds/contacts/default/full'
  query = new google.gdata.contacts.ContactQuery(feed)
  #query.setMaxResults(10)
  localStorage.contacts = JSON.stringify([])
  service.getContactFeed(query, handleGoogleContactsFeed, handleGoogleContactsError)

handleGoogleContactsFeed = (result) ->
  for entry in result.feed.entry
    title = entry.getTitle().getText()
    for phoneNumber in entry.getPhoneNumbers()
      number = phoneNumber.getValue()
      name = "#{title} (#{number})"
      id = number
      addContact(name, number)

handleGoogleContactsError = (error) ->
  console.debug("handleGoogleContactsError...")
  alert("There was an error getting the Google contacts!")
  console.error(error)

addGoogleContact = (entry) ->
  console.log(entry.getTitle().getText())
  console.log(n.getValue()) for n in entry.getPhoneNumbers()

# Ensure that the settings are sane
checkSettings = ->
  if PROVIDER_FIELDS.every((x) -> (v = $("##{x}").val()) and v isnt "")
    $("#save-settings").attr("disabled", false)
    $("#message-form").attr("disabled", false)
    true
  else
    $("#save-settings").attr("disabled", true)
    $("#message-form").attr("disabled", true)
    false

# Save whatever's in the settings, and hide the dialogue
saveSettings = ->
  localStorage[x] = $("##{x}").val() for x in PROVIDER_FIELDS
  $("#provider-settings").modal("hide")

# Send the message!
sendMessage = (e) ->
  e.preventDefault()
  data =
    provider: localStorage.provider
    username: localStorage.username
    password: localStorage.password
    recipients: r.trim() for r in $("#recipients").val().split(",") when r isnt ""
    message: $("#message").val()
  $.post($(this).attr("action"), data)

# Executed when the DOM loads
jQuery ->
  $("##{x}").val(localStorage[x]) for x in PROVIDER_FIELDS
  $("#save-settings").on("click", saveSettings)
  $("#provider-settings").on("change", checkSettings)
  $("#provider-settings").modal("show") unless checkSettings()

  loadContacts()

  $("#message-form").on("submit", sendMessage)


google.load("gdata", "1.x")
google.setOnLoadCallback ->
  console.log("Google is loaded!")
  $("#google-contacts-button").live "click", loadGoogleContacts
