require 'sinatra'
require 'smesser'

get '/' do
  erb :index
end

post '/message.json' do
   # Missing parameters - don't even try to send.
  return 400 if [:provider, :username, :password, :recipients, :message].any? { |x| !params[x] }
  p = Smesser::providers[params[:provider]]
  return 501 unless p
  p = p.new(params[:username], params[:password])
  return 401 unless p.login
  recipients = params[:recipients].is_a?(Array) ? params[:recipients] : [params[:recipients]]
  return 406 unless r = p.send(params[:message], *recipients)
  201
end
