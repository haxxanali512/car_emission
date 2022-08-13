class Decline{
  constructor(){
    $(".restart-btn").click(function(){
      if (window.location.search) {
        var params = window.location.search
        window.location = `/${params}`
      }
      else{
       window.location = '/'
      }
    })
  }
}
export default new Decline();
