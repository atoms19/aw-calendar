async function  getCollegeCalendar(params) {
    let data=await fetch('https://www.mits.etlab.app/student/calendar?month=12&year=2024')
    console.log(data)
    
}
getCollegeCalendar()

