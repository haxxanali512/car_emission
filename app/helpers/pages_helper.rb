module PagesHelper
	def emissionform
		@details = {
	    camp_id: 'CAR-EMISSION-CLAIMS',
	    success_url: '/success',
	    form_name: 'emission-form',
	    optin_url: '/emission-form',
	    sid: nil,
	    ssid: nil,
	    source:nil,
	    ipaddress: request.remote_ip,
	  }.to_json
	end

  def diesels
		@details = {
	    camp_id: 'CAR-EMISSION-CLAIMS',
	    success_url: '/success',
	    form_name: 'diesel',
	    optin_url: '/diesel',
	    sid: nil,
	    ssid: nil,
	    source:nil,
	    ipaddress: request.remote_ip,
	  }.to_json
	end

  def purchase_type
    @purchase_type = [
      "1st Step",
      "AA Car Finance",
      "Admiral",
      "Alphero Financial Services",
      "Bamboo",
      "Bank of Ireland",
      "Barclays",
      "Blackhorse",
      "Blue Motor Finance",
      "BMW Finance",
      "BNP Paribas",
      "ByACar",
      "Car Finance 247",
      "Citroen Finance",
      "Close Motor Finance",
      "Credit Plus",
      "Dacia Finance",
      "Evolution Loans",
      "FCA Automotive Services",
      "FCE Bank",
      "Ford Motor Finance",
      "Get Me Car Finance",
      "Halifax",
      "Honda Financial Services",
      "Hyundai Car Finance",
      "Ikano Bank",
      "Kia Finance",
      "Lendable",
      "Lexus Financial Services",
      "LiveLand",
      "Lombard",
      "Marsh Finance",
      "Mazda Finance",
      "MG Finance",
      "Money way",
      "MoneyBarn",
      "MotoNovo Finance",
      "My Car Credit",
      "Natwest",
      "Nissan Finance",
      "Northridge Finance",
      "Oodle",
      "Paragon Car Finance",
      "PCF bank",
      "Peugeot Finance",
      "PSA Finance",
      "RAC",
      "RCI Financial Services",
      "Renault Finance",
      "Sainsburys",
      "Santander",
      "Seat Finance",
      "Secure Trust Bank",
      "Shawbrook Bank",
      "Suzuki Finance",
      "Toyota Financial Services",
      "Vauxhall Finance",
      "Volvo Car Credit",
      "VWFSZopa,Zopa",
      "Zuto",
      "Other"
    ]
  end
end
