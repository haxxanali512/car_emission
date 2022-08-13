class CarRegistrarService
  attr_reader :reg_num

  def initialize(reg_num)
    @reg_num = reg_num.present? ? reg_num.gsub(/\s+/, "") : reg_num
  end

  def get_car_data
    url = "https://uk1.ukvehicledata.co.uk/api/datapackage/VehicleDataWithEmissions?v=2&api_nullitems=1&auth_apikey=87d3f786-ed08-4ab9-bdb6-52fb11e7418e&user_tag=&key_VRM="+reg_num
    uri = URI(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    req = Net::HTTP::Get.new(url)
    res = http.request(req)
    puts "****" * 30
    puts "response #{res.body}"
    puts "****" * 30
    data = JSON.parse(res.body)

    if data["Response"]["StatusCode"] == "Success"
      car_data = build_car_data(data["Response"])
    else
      car_data = {}
    end
  end

  def build_car_data(response)
    mandatoryRectification = ''
    voluntaryRectification =  ''
    ownership = response["DataItems"]["VehicleHistory"]["KeeperChangesList"]
    ownership = ownership&.map{ |owner|
      owner["DateOfTransaction"].split("T").first
    }
    if vehicle_alertList?(response)
      vehiclesAlert = get_vehicle_alert_list(response)
      if vehiclesAlert['AlertClass'] == 'ManufacturerEmissions' and vehiclesAlert['AlertType'] == 'MercedesEmissionsIssue19'
        rectificationData = get_vehicle_alert_details(response)
        mandatoryRectification = rectificationData['VehicleHasMandatoryRectificationNotice']
        voluntaryRectification = rectificationData['VehicleHasVoluntaryServiceRectification']
      end
    end
    {
      make: response["DataItems"]["ClassificationDetails"]["Smmt"]["Make"],
      today_date: DateTime.now.strftime("%Y/%m/%d").gsub('/', '-'),
      fuel_type: response["DataItems"]["SmmtDetails"]["FuelType"],
      first_date: response["DataItems"]["VehicleRegistration"]["DateFirstRegistered"].split("T").first,
      vrm: response["DataItems"]["VehicleRegistration"]["Vrm"],
      color: response["DataItems"]["VehicleRegistration"]["Colour"],
      transmission: response["DataItems"]["VehicleRegistration"]["TransmissionType"],
      car_title: response["DataItems"]["ClassificationDetails"]["Dvla"]["Make"] +response["DataItems"]["ClassificationDetails"]["Dvla"]["Model"],
      ownership_period: ownership,
      mandatoryRectification: mandatoryRectification,
      voluntaryRectification: voluntaryRectification,
    }
  end

  def vehicle_alertList?(response)
    response['DataItems']['UkvdEnhancedData']['VehicleAlerts']['VehicleAlertList'].present? and response['DataItems']['UkvdEnhancedData']['VehicleAlerts']['VehicleAlertList'].length > 0
  end

  def get_vehicle_alert_list(response)
    response['DataItems']['UkvdEnhancedData']['VehicleAlerts']['VehicleAlertList'][0]
  end

  def get_vehicle_alert_details(response)
    response['DataItems']['UkvdEnhancedData']['VehicleAlerts']['VehicleAlertList'][0]['AlertDetails']
  end
end
