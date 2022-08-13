class PagesController < ApplicationController
  skip_before_action :verify_authenticity_token
	include PagesHelper
  require 'aws-sdk-s3'

	def index	
	end

	def emission_form
		emissionform
    purchase_type

    @car_data = CarRegistrarService.new(params[:reg_num]).get_car_data
    if @car_data.empty?
      @params = request.query_parameters.except("reg_num")
      redirect_to root_path(@params), notice: 'Please Enter Valid Registration Number'
    elsif @car_data[:make].downcase != 'mercedes'
      redirect_to root_path(@params), notice: 'Please Enter Mercedes Registration Number'
    else
      @owners = @car_data[:ownership_period]
    end
	end

  def decline
    @car_name = params[:car_name]
  end

  def home
    
  end

  def diesel
    diesels
  end

  def car_data
    @car_data = CarRegistrarService.new(params[:reg_num]).get_car_data
    if @car_data.empty?
      @params = request.query_parameters.except("reg_num")
      render json: {status: 400}
    elsif @car_data[:make].downcase != 'mercedes'
      render json: {status: 402}
    else
      render json: {response: @car_data}
    end
  end

	def success
	end

	def terms	
	end

	def privacy	
	end

	def cookies
	end

  def upload
    byebug
    bucket_name = ENV['bucket_name']
    object_key = params[:url].tempfile
    region = 'eu-west-2'
    s3_client = Aws::S3::Client.new(
      access_key_id: ENV['access_key_id'],
      secret_access_key: ENV['secret_access_key'],
      region: region
    )

    if object_uploaded?(s3_client, bucket_name, object_key)
      puts "Object '#{object_key}' uploaded to bucket '#{params[:name]}'."
      render json: {response: {url: "#{ENV['bucket_base_url']}/#{params[:name]}.jpeg"}}
    else
      puts "Object '#{object_key}' not uploaded to bucket #{params[:name]}'."
      render json: {response: {url: "Failed to upload URL due to AWS Down", status: 404}}
    end
  end

  def object_uploaded?(s3_client, bucket_name, object_key)
    response = s3_client.put_object(
      bucket: bucket_name,
      key: "#{params[:name]}.jpeg",
      body: object_key,
      content_encoding: 'image/jpeg',
      content_type: "image/jpeg",
      acl: 'public-read',
      content_disposition: "inline"
    )

    if response.etag
      return true
    else
      return false
    end
  rescue StandardError => e
    puts "Error uploading object: #{e.message}"
    return false
  end


end


