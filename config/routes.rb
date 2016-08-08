Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  get '/api/table', to: 'api#table'
  get '/api/chart', to: 'api#chart'
end
