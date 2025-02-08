import ICAL from "ical.js";

export const formatMoney = (amount) => {
    // Ensure input is a string, convert number to string if necessary
    const cleanedAmount = String(amount).replace(/[^0-9.]/g, "");
  
    // Split the amount into integer and decimal parts
    const [integer, decimal] = cleanedAmount.split(".");
  
    // Format the integer part with commas
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
    // Return the formatted value with up to two decimal places
    return decimal !== undefined ? `${formattedInteger}.${decimal.substring(0, 2)}` : formattedInteger;
  };

export const removeFormatting = (formattedValue) => {
    // Remove commas and convert to a number
    const plainValue = formattedValue.replace(/,/g, "");
    return parseFloat(plainValue);
  }

 export function formatDate(dateString) {
    const date = new Date(dateString);
  
    // Use toLocaleDateString with 'en-GB' and replace slashes with dashes
    const formattedDate = date.toLocaleDateString('en-GB').replace(/\//g, '-');
  
    return formattedDate;
  }

  export function parseICS(ics){
      let parsedData=ICAL.parse(ics)
      let component=new ICAL.Component(parsedData)
      
      let vevents=component.getAllSubcomponents("vevent").map((event) => {
        const vevent = new ICAL.Event(event);

        let eventCAN= {
          id: vevent.uid,
          name : vevent.summary,
          note : vevent.description,
          subtasks:[],
          type:'primary',
          location:undefined,
          date: `${vevent.startDate._time.day}-${vevent.startDate._time.month}-${vevent.startDate._time.year}`,
          endDate:undefined,
          rrule:vevent.isRecurring?'FREQ='+Object.keys(vevent.getRecurrenceTypes())[0]:undefined,

        };

        let endDate=`${vevent.endDate._time.day}-${vevent.endDate._time.month}-${vevent.endDate._time.year}`

        if(eventCAN.date!=endDate){
          if(`${parseInt(eventCAN.date.split('-')[0])+1}-${vevent.startDate._time.month}-${vevent.startDate._time.year}`!=endDate){
          eventCAN.endDate=endDate
          }
        }

        return eventCAN
      });

        return vevents
  }