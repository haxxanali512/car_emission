Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  root 'pages#index'
  get '/emission-form', to: 'pages#emission_form'
  get '/home', to: 'pages#home'
  get '/diesel', to: 'pages#diesel'
  get 'car_data', to: 'pages#car_data'
  get '/getcardata', to: 'pages#getcardata'
  get '/success', to: 'pages#success'
  get '/terms', to: 'pages#terms'
  get '/privacy', to: 'pages#privacy'
  get '/cookies', to: 'pages#cookies'
  post 'upload', to: 'pages#upload'
  get '/decline', to: 'pages#decline'
end
