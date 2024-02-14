const pretifyShort = (date) => {
    return date.getFullYear() 
        + "-" + ("0" + (date.getMonth() +1)).slice(-2)
        + "-" + ("0" + date.getDate()).slice(-2)            
}

const toGMT1 = (dateStr) => {
    let date = new Date(dateStr)
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);    
}

const toGMT = (dateStr) => {
    if (/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.test(dateStr)){
        let date =
        new Date(
            parseInt(dateStr.slice(0,4)),
            parseInt(dateStr.slice(5,7)) - 1,
            parseInt(dateStr.slice(8,10)),
            parseInt(dateStr.slice(11,13)),
            parseInt(dateStr.slice(14,16)),
            parseInt(dateStr.slice(17,19))
        )
        
        // console.debug("toGMT => ", dateStr, date.getTime())
        return date
        //return  new Date(dateStr + " GMT +0100")
        //return new Date(date.getTime() - date.getTimezoneOffset() * 60000);    
    }
    else {
        console.error("Wrong date string format => " + dateStr)
        throw "Wrong date string format => " + dateStr
    }
    
}

const nowStr = () => {
    return moment().format('YYYY-MM-DD hh:mm:ss')    
}

const pretify = (date) => {    
    let result = date.getFullYear() 
          + "-" + ("0" + (date.getMonth() +1)).slice(-2)
          + "-" + ("0" + date.getDate()).slice(-2)
          + " " + ("0" + (date.getHours()-1)).slice(-2) 
          + ":" + ("0" + date.getMinutes()).slice(-2)
          + ":" + ("0" + date.getSeconds()).slice(-2)                        
    return result
  }

const diffInMinutes = (dateA, dateB) => {
    return Math.floor((dateA.getTime() - dateB.getTime()) / 60000)
}

  const toStr = (date) => {    
    let result = null

    result = date.getFullYear() 
          + "-" + ("0" + (date.getMonth() +1)).slice(-2)
          + "-" + ("0" + date.getDate()).slice(-2)
          + " " + ("0" + (date.getHours())).slice(-2) 
          + ":" + ("0" + date.getMinutes()).slice(-2)
          + ":" + ("0" + date.getSeconds()).slice(-2)            
        
    return result
  }

const isSameDay = (dateA, dateB) => {
    return (dateA.getFullYear() == dateB.getFullYear())
     && (dateA.getMonth() == dateB.getMonth())
     && (dateA.getDate() == dateB.getDate())
}

const fromDateMinutes = (dateStr, minutes) => {
    
    let year = parseInt(dateStr.split('-')[0])
    let month = parseInt(dateStr.split('-')[1])-1
    let day = parseInt(dateStr.split('-')[2]) 
    let hours = Math.floor(minutes / 60)    
    //console.debug("year, month, day, hours, minutes", year, month, day, hours, minutes % 60)
    let date = new Date(year, month, day, hours, minutes % 60)

    /*let date = new Date(dateStr + " GMT +0100")
    date.setTime(date.getTime() + (minutes * 1000 * 60))*/
    /*console.debug("-------------- <fromDateMinutes> ------------------\n"
        + "\tinputs:\n"
        + "\t\tdateStr=" + dateStr + "\n"
        + "\t\tinutes=" + minutes.toString() + "\n"
        + "\toutput:\n"
        + "\t\tdate.getTime()=" + date.getTime().toString() + "\n"
        + "-------------- </fromDateMinutes> ------------------")*/
    return date
}

const newLocalDate = () => {
    let date = new Date()
    //date.setHours(date.getUTCHours() + 1)

    return date
}

const toMinutes = (dateStr) => {                 
    let date = new Date(dateStr)    
    return date.getHours() * 60 + date.getMinutes()
}

const nextDayStr = (dateStr) => {  
    // calculate end of the day 
    let date = new Date(dateStr)
    date.setDate(date.getDate() + 1)                 
    return this.pretifyShort(date)
}

const getFollowingMultiple = (spottedDateStr, originDateStr, delay) => {    
    let spottedMinutes = this.toMinutes(spottedDateStr)
    let originMinutes = this.toMinutes(originDateStr)

    if (spottedMinutes < originMinutes){
        return this.toGMT(originDateStr)
    } else {
        return this.fromDateMinutes(originDateStr, originMinutes + ((Math.floor((spottedMinutes - originMinutes) / delay) + 1) * delay))
    }
}

exports.pretify = pretify
exports.pretifyShort = pretifyShort
exports.fromDateMinutes = fromDateMinutes
exports.isSameDay = isSameDay
exports.toGMT1 = toGMT1
exports.toGMT = toGMT
exports.toMinutes = toMinutes
exports.nextDayStr = nextDayStr
exports.toStr = toStr
exports.nowStr = nowStr
exports.diffInMinutes = diffInMinutes
exports.newLocalDate = newLocalDate
exports.getFollowingMultiple = getFollowingMultiple