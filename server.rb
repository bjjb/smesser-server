require 'sinatra'
require 'smesser'

get '/' do
  erb :index
end

post '/' do
  Smesser.send_message(params)
  redirect '/'
end
