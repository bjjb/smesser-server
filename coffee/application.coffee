PROVIDER_FIELDS = ['provider', 'username', 'password']

# Load the contacts from localStorage
loadContacts = ->
  try
    contacts = JSON.parse(localStorage.contacts) if localStorage.contacts
    if $("#recipients").data("tokenInputObject")
      $("#recipients").tokenInput("clear") 
      $("#recipients").siblings(".token-input-list").remove()
    $("#recipients").tokenInput(contacts, { hintText: 'Enter recipients' })
  catch e
    console.error("Error reading contacts: #{e}")
    false

# Add a contact to localStorage
addContact = (name, number) ->
  contacts = JSON.parse(localStorage.contacts)
  contacts.push { name: name, id: number }
  localStorage.contacts = JSON.stringify(contacts)

# Start loading Google contacts from the web into localStorage
googleContactsService = null
loadGoogleContacts = () ->
  scope = 'https://www.google.com/m8/feeds'
  google.accounts.user.login(scope) if google.accounts.user.checkLogin(scope) is ""
  googleContactsService ?= new google.gdata.contacts.ContactsService("smesser-0.0.2")
  console.debug("Getting the full feed...")
  feedURL = 'https://www.google.com/m8/feeds/contacts/default/full'
  localStorage.contacts = JSON.stringify([])
  processGoogleContactsFeeds(feedURL)

processGoogleContactsFeeds = (feedURL) ->
  query = new google.gdata.contacts.ContactQuery(feedURL)
  googleContactsService.getContactFeed(query, handleGoogleContactsFeed, handleGoogleContactsError)

handleGoogleContactsFeed = (result) ->
  for entry in result.feed.entry
    title = entry.getTitle().getText()
    for phoneNumber in entry.getPhoneNumbers()
      number = phoneNumber.getValue()
      name = "#{title} (#{number})"
      console.debug(" + #{name}")
      addContact(name, number)
  feedURL = result.feed.getNextLink()
  console.debug("Next link: %o", feedURL)
  if feedURL?
    processGoogleContactsFeeds(feedURL.href) # more to come...
  else
    loadContacts() # no more to come - load the contacts

handleGoogleContactsError = (error) ->
  console.debug("handleGoogleContactsError...")
  alert("There was an error getting the Google contacts!")
  console.error(error)

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
  loadContacts()

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
  $("#message-form").on("submit", sendMessage)
  loadContacts()


google.load("gdata", "1.x")
google.setOnLoadCallback ->
  console.log("Google is loaded!")
  $("#google-contacts-button").live "click", loadGoogleContacts
