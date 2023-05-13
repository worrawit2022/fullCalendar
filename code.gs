
/** Full Calendar Webapp + Datatable Dev By Gukkghu 06.05.66 */ 
/** กรุณานำไปใช้งานหรือพัฒนาต่อ */

function doGet(e) {
  return HtmlService.createTemplateFromFile('index').evaluate()
      .setTitle('Calendar')
      .addMetaTag('viewport', 'width=device-width , initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

function include(file){
  return HtmlService.createHtmlOutputFromFile(file).getContent()
}


//** START PROJECT */

 var sheetEvent = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Event2')
 var sheetPassword = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Password')
 var sheetSt = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('statistics')
 let marq = sheetSt.getRange('D2').getValue()

function preSetEventObj2(){

 let events = sheetEvent.getRange(1,1,sheetEvent.getLastRow(),7).getValues()
 events.shift()
 Logger.log(events)
  let Events = []

 if(events.length === 0){
            var objNodata = {}
            objNodata['start'] = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss') // แปลงรูปแบบวันที่ yyyy-MM-dd HH:mm:ss
            Events.push(objNodata)
 }else{
Logger.log(events.length)
          for(var i = 0; i<events.length; i++){
            var record = {}
            var dataRow = events[i]
            let setColor
            switch (dataRow[4]) {
              case "พัฒนาสถานศึกษา":
                setColor = "#E8A0BF";
                break;
              case "พัฒนาครู":
                setColor = "#C9A7EB";
                break;
              default:
                setColor = "#00FFCA";
            }

            record['id'] = dataRow[0]
            record['title'] = dataRow[1]
            record['start'] = Utilities.formatDate(new Date(dataRow[2]), 'GMT+7', 'yyyy-MM-dd HH:mm:ss') // แปลงรูปแบบวันที่ yyyy-MM-dd HH:mm:ss
            record['end'] = Utilities.formatDate(new Date(dataRow[3]), 'GMT+7', 'yyyy-MM-dd HH:mm:ss') // แปลงรูปแบบวันที่ yyyy-MM-dd HH:mm:ss
            record['color'] = setColor
            record['allDay'] = dataRow[5]
            record['url'] = dataRow[6]

            Events.push(record)
          }

    console.log(Events)
    return JSON.stringify(Events) // แปลงจาก object เป็น string
 }

}

function getStatistic(){
 let numbersta = sheetSt.getRange("B2").getValue()
 let numberstb = sheetSt.getRange("B3").getValue()
 let numberstc = sheetSt.getRange("B4").getValue()

 const objStatistic = {}
        objStatistic.numbersta = numbersta
        objStatistic.numberstb = numberstb
        objStatistic.numberstc = numberstc
        Logger.log(objStatistic)

  return objStatistic        

}


function deleteRowSheet(keysRow){
  const dataShow = sheetEvent.getDataRange().getDisplayValues()

  var idCol = dataShow.map(function(r){return r[0];});

     var posIndex = idCol.indexOf(keysRow);
     var rowindex = posIndex === -1 ? 0 : posIndex + 1
    Logger.log(rowindex)

  sheetEvent.deleteRow(rowindex)

  return preSetEventObj2()
}


function addEventToSheets(obj){
  const dateStart = obj.sdate+", "+obj.stime+":00"
  const dateEnd = obj.edate+", "+obj.etime+":00"

  sheetEvent.appendRow(
    [
      obj.idC,
      obj.titleE,
      dateStart,
      dateEnd,
      obj.typeE,
      obj.addDayChk     
    ])

return preSetEventObj2()

}


function sendNotifyEvents(){
  const dataSheet = sheetEvent.getRange(2, 1, sheetEvent.getLastRow()-1, sheetEvent.getLastColumn()).getValues()
  const dateToday = new Date()
  const msgDateToday = convertStrigDate(dateToday)

    let actMSG = ""
    let counter = 0
    let dateAct
    let dayNumber
    const arrDayEmoji = ["❤️","💛","💗","💚","🧡","💙","💜"]
    
    dataSheet.forEach((r,i)=>{ 
        const idAct = r[0]
        const activities = r[1]
        dateAct = new Date(r[2])
        const timeDif = dateAct.getTime() - dateToday.getTime()
        const dayDif = Math.ceil(timeDif / (1000 * 60 * 60 * 24))
        dayNumber = dateAct.getDay()
          let x = 0

  if( dayDif == 0 || dayDif == -0 ){
            counter++
      let clockNumber = dateAct.getHours()
      let arrayEmoji = ["🕛","🕐","🕑","🕒","🕓","🕔","🕕","🕖","🕗","🕘","🕙","🕚","🕛","🕐","🕑","🕒","🕓","🕔","🕕","🕖","🕗","🕘","🕙","🕚","🕛"]

      actMSG += counter + " "+  activities + "\n"+ arrayEmoji[clockNumber] + " `"+Utilities.formatDate(dateAct, 'GMT+7', 'HH:mm')+"`" +  "\n"
  }

    });

  let msgLine = `${arrDayEmoji[dayNumber]} *กิจกรรม* ${arrDayEmoji[dayNumber]}
${msgDateToday}
 *มีกิจกรรมทั้งสิ้น ${counter} รายการ* 
${actMSG}`; 

if(counter === 0){
  msgLine = " *"+msgDateToday + "*\n" + "🏖️ *ไม่มีกิจกรรม* 🏖️"
}
      Logger.log(msgLine)

    sendNotiToLine(msgLine)

}


function convertStrigDate(dateIn){
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const strDate = dateIn.toLocaleString('th-TH',options) 

    return strDate
}


function sendNotiToLine(msgDateToday){
  try {

      const token = "pAnqEwflqCr9O1wIIfmmAOKhSlIeAunw8Mm9owGyvaw"  
      var formData = {
      'message' : msgDateToday,
      }
      var options =
      {
      "method"  : "post",
      "payload" : formData,  
      "headers" : {"Authorization" : "Bearer "+ token}
      };

      let response = UrlFetchApp.fetch("https://notify-api.line.me/api/notify",options);
      
      Logger.log(response.getContentText())

  }catch(err){
      Logger.log("EROR! > " + err)
  }
}

function checkPasswordOnDel(password){
  var users = sheetPassword.getRange(2,1,sheetPassword.getLastRow()-1,2).getDisplayValues()
  Logger.log(users)
  let x = false

    let loggedIn = false;

    for (let i = 0; i < users.length; i++) {
      let user = users[i][1];
      
      if (user === password) {
        loggedIn = true;
        break;
      }
    }
// Logger.log(loggedIn)
    return loggedIn

}


function chkkk(){
  var dateFrom = "02/05/2013";
var dateTo = "02/09/2013";
var dateCheck = "02/10/2013";

var d1 = dateFrom.split("/");
var d2 = dateTo.split("/");
var c = dateCheck.split("/");

var from = new Date(d1[2], parseInt(d1[1])-1, d1[0]);  // -1 because months are from 0 to 11
var to   = new Date(d2[2], parseInt(d2[1])-1, d2[0]);
var check = new Date(c[2], parseInt(c[1])-1, c[0]);

console.log(check > from && check < to)
}


function setTrigger() {

deleteTriggers();  
scheduledTrigger();
}

function scheduledTrigger(){ 
 ScriptApp.newTrigger("sendNotifyEvents")
   .timeBased()
   .atHour(22)
   .nearMinute(15)
   .everyDays(1)
   .create();
}

function deleteTriggers() {
  
var triggers = ScriptApp.getProjectTriggers();
for (var i = 0; i < triggers.length; i++) {
  if (   triggers[i].getHandlerFunction() == "sendNotifyEvents") {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}
}



