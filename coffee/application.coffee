PROVIDER_FIELDS = ['provider', 'username', 'password']

# Load the contacts from localStorage
loadContacts = ->
  try
    JSON.parse(localStorage.contacts) if localStorage.contacts
  catch e
    console.error("Error reading contacts: #{e}")
    false

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

  $("#recipients").tokenInput(contacts, { hintText: 'Enter recipients' }) if contacts = loadContacts()

  $("#message-form").on("submit", sendMessage)
