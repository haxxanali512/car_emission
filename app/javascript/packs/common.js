import 'parsleyjs/dist/parsley.min.js';
import 'bootstrap/dist/js/bootstrap.js'

class Common {
  constructor() {
    var CI = this;
    this.formValidation = {}
    this.validate();
    this.currentTab = 0;
    this.details = {};
    this.url = ''
    CI.sold = ''
    CI.bought = ''
    CI.rejected = false
    CI.accepted = true
  }

  getFormDetails(form){
    var data = $(form)[0].dataset.details
    this.details = JSON.parse(data)
  }

  popupTerms(){
    $( ".close" ).click(function() {
      $('.modal').hide();
    });
  }

  getCarData(reg_num){
    var page_name = window.location.pathname
    var params = window.location.search.replace('?','&')
    window.location = `/emission-form?reg_num=${reg_num}&page_name=${page_name}${params}`
  }

  validate(){
    this.formValidation = $('#car-emission-form').parsley({
      trigger: "focusout",
      errorClass: 'error',
      successClass: 'valid',
      errorsWrapper: '<div class="parsley-error-list"></div>',
      errorTemplate: '<label class="error"></label>',
      errorsContainer (field) {
        if(field.$element.hasClass('approve')){
          return $('.error-checkbox')
        }
        if(field.$element.hasClass('owner-period')){
          return $('.owner-error-box')
        }
        if(field.$element.hasClass('error-on-button')){
          return $(field.element.closest(".step").querySelector(".error-box"))
        }
        return field.$element.parent()
      },
    })
    this.validateEmail()
    this.validateApiPostcode()
    this.validatePhone()
  }

  validateEmail(){
    var CI = this
    window.Parsley.addValidator('validemail', {
      validateString: function(value){
        var xhr = $.ajax('https://go.webformsubmit.com/dukeleads/restapi/v1.2/validate/email?key=50f64816a3eda24ab9ecf6c265cae858&value='+$('.email').val())
        return xhr.then(function(json) {
          if (json.status == "Valid") {
            CI.isEmail = true
            return true
          }else if(json.status == "Invalid"){
            return $.Deferred().reject("Please Enter Valid Email Address");
          }else{
            CI.isEmail = true
            return true
          }
        }).catch(function(e) {
          if (e == "Please Enter Valid Email Address") {
            return $.Deferred().reject("Please Enter Valid Email Address")
          }else{
            CI.isEmail = true
            return true
          }
        });
      },
      messages: {
         en: 'Please Enter Valid Email Address',
      }
    });
  }

  validatePhone(){
    var CI = this
    window.Parsley.addValidator('validphone', {
      validateString: function(value){
        var xhr = $.ajax('https://go.webformsubmit.com/dukeleads/restapi/v1.2/validate/mobile?key=50f64816a3eda24ab9ecf6c265cae858&value='+$('.phone').val())
        return xhr.then(function(json) {
          var skipresponse = ["EC_ABSENT_SUBSCRIBER", "EC_ABSENT_SUBSCRIBER_SM", "EC_CALL_BARRED", "EC_SYSTEM_FAILURE","EC_SM_DF_memoryCapacityExceeded", "EC_NO_RESPONSE", "EC_NNR_noTranslationForThisSpecificAddress", "EC_NNR_MTPfailure", "EC_NNR_networkCongestion"]
          if (skipresponse.includes(json.response) && json.status == "Valid" ) {
            CI.isPhone = true
            $(".global-phone-success").addClass("d-inline-block")
            return true
          }
          else if (json.status == "Valid") {
            $(".global-phone-success").addClass("d-inline-block")
            CI.isPhone = true
            return true
          }else if(json.status == "Invalid"){
            $(".global-phone-success").removeClass("d-inline-block")
            return $.Deferred().reject(`Please Enter Valid Phone Number`);
          }else if(json.status == "Error"){
            return $.Deferred().reject(`Please Enter Valid Phone Number`);
          }else{
            CI.isPhone = true
            return true
          }
        }).catch(function(e) {
          if (e == `Please Enter Valid Phone Number`) {
            return $.Deferred().reject(`Please Enter Valid Phone Number`)
          }else{
            CI.isPhone = true
            $(".global-phone-success").addClass("d-inline-block")
            return true
          }
        });
      },
      messages: {
         en: `Please Enter Valid Phone Number` ,
      }
    });
  }

  validateApiPostcode(){
    var CI = this;
    window.Parsley.addValidator('validapipostcode', {
      validateString: function(value){
        return $.ajax({
          url:`https://api.getAddress.io/find/${$(".postcode").val()}?api-key=NjGHtzEyk0eZ1VfXCKpWIw25787&expand=true`,
          success: function(json){
            $(".property-div").show()
            if (json.addresses.length > 0) {
              var result = json.addresses
              var adresses = []
               adresses.push( `
                <option
                disabled=""
                selected=""
                >
                Select Your Property
                </option>
              `)
              for (var i = 0; i < result.length; i++) {
                adresses.push( `
                    <option
                    data-street="${result[i].line_1 || result[i].thoroughfare}"
                    data-city="${result[i].town_or_city}"
                    data-address="${result[i].formatted_address.toString().replaceAll(',', ' ')}"
                    data-province="${result[i].county || result[i].town_or_city}"
                    data-street2="${result[i].line_2}"
                    data-building="${result[i].building_number || result[i].sub_building_number || result[i].building_name || result[i].sub_building_name}"
                    >
                    ${result[i].formatted_address.join(" ").replace(/\s+/g,' ')}
                    </option>
                  `)
                }
                $('#property').html(adresses)
                $(".address-div").remove();
              return true
            }else{
              $(".step").removeClass("in-progress")
              return $.Deferred().reject("Please Enter Valid Postcode");
            }
          },
          error: function(request){
            console.log(request.statusText)
            request.abort();
            if (request.statusText == "timeout") {
              $(".property-div").remove();
            }
          },
          timeout: 5000
        })
      },
      messages: {
         en: 'Please Enter Valid Postcode',
      }
    });
  }

  showTab(n=0) {
    var tabs = $(".step");
    if (!tabs[n]) return;
    this.fixStepIndicator(n)
    tabs[n].style.display = "block";
    $(".step").removeClass("in-progress")
  }

  fixStepIndicator(num) {
    var progress = document.getElementById('progressBar');
    if(num > 0) {
      progress.style.width = ((num+1) *25)+"%";
      $('.progress-percent').text(((num+1)*25) + "%" + " Complete");
      $('.progress-steps').text("Step " + (num + 1) + "/4");
    }
    if( num ==  0){
      $('.progress-steps').text("Step  1/4");
      progress.style.width = (25)+"%";
      $('.progress-percent').text("25% Complete");
    }
  }


  showCircle(){
    $(".step").addClass("in-progress")
  }
  hideCircle(){
    $(".step").removeClass("in-progress")
  }

  backStep(n){
    if (this.currentTab > 0) {
      $('.btn-next').prop('disabled', false);
      var tabs = $(".step");
      tabs[this.currentTab].style.display = "none";
      this.currentTab = this.currentTab + n;
      this.showTab(this.currentTab);
    }
  }

  nextStep(n) {
    var CI = this;
    CI.showCircle();
    $('#car-emission-form').parsley().whenValidate({
      group: 'block-' + this.currentTab
    }).done(() =>{
      var tabs = $(".step");
      if (CI.currentTab + 1 < tabs.length) {
        tabs[CI.currentTab].style.display = "none";
      }
      CI.currentTab = CI.currentTab + n;
      if (CI.currentTab >= tabs.length) {
        if (CI.isPhone == true && CI.isEmail == true){ 
          $('.btn-next').prop('disabled', true);
          CI.postData()
        }else{
          $('#car-emission-form').parsley().validate()
        }
        return true
      }
      CI.showTab(CI.currentTab);
      CI.resizeCanvas();
    })
    CI.hideCircle();
  }

  getData() {
    var day = $( "#dayOfBirth option:selected" ).val();
    var month = $( "#monthOfBirth option:selected" ).val();
    var year = $( "#yearOfBirth option:selected" ).val();
    var dateofbirth = day + "/" + month + "/" + year;
    var phone = $(".phone").val() || this.getUrlParameter('phone1') || '';
    phone = phone.split(" ").join("");

    return {
      dob: dateofbirth,
      title: $("input[name='title']:checked").val() || this.getUrlParameter('title') || "Mr",
      sid: this.getUrlParameter('sid') || 1,
      ssid: this.getUrlParameter('ssid') || 1,
      source: this.getUrlParameter('source') || '',
      optindate: this.getFormattedCurrentDate(),
      optinurl: 'https://caremissionclaim.com' + window.location.pathname,
      firstname: $(".first_name").val() || this.getUrlParameter('firstname') || '',
      lastname: $(".last_name").val() || this.getUrlParameter('lastname') || '',
      email: $(".email").val() || this.getUrlParameter('email') || '',
      phone1: $(".phone").val() || this.getUrlParameter('phone1') || '',
      ipaddress: this.details.ipaddress || "",
      street1: this.getUrlParameter('street1') || $(".street1").val() || $(".address").val() || 'unknown',
      building: this.getUrlParameter('houseNumber') || $(".houseNumber").val() || "",
      towncity: this.getUrlParameter('towncity') || $(".towncity").val() || 'unknown',
      full_address: this.getUrlParameter('address') || $(".address").val() || '',
      postcode: this.getUrlParameter('postcode') || $(".postcode").val() || '',
      signature: this.url || "",
      sold: this.sold || this.sold_year ||"",
      bought: this.bought || $( "#vehicle-purchase option:selected" ).val() || "",
      gclid: this.getUrlParameter('gclid') || "",
      financefirm: $( "#purchase-type option:selected" ).val() || "other",
      purchase_method: $("input[name='purchase-detail']:checked").val() || "",
      registration: this.getUrlParameter('reg_num') ||  $(".reg-number").val() || ""
    };
  }

  firePixel(){
    window.dataLayer = window.dataLayer || [];
    dataLayer.push({'event': 'transaction'})
  }

  postData() {
    var CI = this;
    CI.showCircle();
    var blobBin = atob($("#signatureInput").val().split(',')[1]);
    var array = [];
    for(var i = 0; i < blobBin.length; i++) {
        array.push(blobBin.charCodeAt(i));
    }
    var file=new Blob([new Uint8Array(array)], {type: 'image/png'});

    CI.uploadSignature(file, $(".phone").val())
  }

  uploadSignature(file, phone1){
    var CI = this

    var formdata = new FormData();
    formdata.append("url", file);
    formdata.append("name", phone1);

    $.ajax({
      type: "post",
      url: '/upload',
      data: formdata,
       processData: false,
       contentType: false,
      success: function(response) {
        CI.url = response.response.url
        CI.status = response.response.status
        var data = CI.getData();
        if (CI.checkIfRejected() || CI.status == 404) {
          CI.submitLead(data, 'CAR-EMISSION-REJECTE', CI.rejected)
        }
        else{
          CI.submitLead(data, CI.details.camp_id, CI.accepted)
        }
      },
      error: function(request){
      },
    })
  }
  checkIfRejected(){
    var CI = this
    var purchaseDate = CI.bought.split('-')[0]
    var mandatoryRectification = $('.mandatory').val()
    var voluntaryRectification = $('.voluntary').val()
    return ((mandatoryRectification == 'false' && voluntaryRectification == 'false') || (mandatoryRectification == '' && voluntaryRectification == '') || (parseInt(purchaseDate) > 2019))
  }
  submitLead(formData, campid, status){
    var CI = this
    CI.showCircle();
    $.ajax({
      type: "POST",
      url: "https://go.webformsubmit.com/dukeleads/waitsubmit?key=eecf9b6b61edd9e66ca0f7735dfa033a&campid=" + campid,
      data: formData,
      success: function(data) {
        if (status) {
          window.location = '/success?f_name='+ $(".first_name").val() + '&car_name='+ $(".car-name").text();
        }else{
          window.location = '/decline?f_name='+ $(".first_name").val() + '&car_name='+ $(".car-name").text();
        }
      },
      dataType: "json"
    })
    if (status) {
      CI.firePixel();
    }
  }

  getFormattedCurrentDate() {
    var date = new Date();
    var day = this.addZero(date.getDate());
    var monthIndex = this.addZero(date.getMonth() + 1);
    var year = date.getFullYear();
    var min = this.addZero(date.getMinutes());
    var hr = this.addZero(date.getHours());
    var ss = this.addZero(date.getSeconds());

    return day + '/' + monthIndex + '/' + year + ' ' + hr + ':' + min + ':' + ss;
  }

  addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  getSourceFromURL(){
    return this.getUrlParameter('source') || '';
  }

  getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] === sParam) {
          return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
    }
  }
}

export default Common;
