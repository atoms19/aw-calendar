// import { state,$el } from "dominity"
// import { events, selectedEvent } from "./main"
// import { ArcElement, BarController, Chart, PieController, PolarAreaController, RadialLinearScale } from "chart.js"

// $el('#exp-btn').on('click',()=>{
//     $el('#exp-edit').elem.classList.toggle('d-none')
// })


// let amount=state(0)
// let info=state(null)
// $el('#spendinp').model(amount)
// $el('#nameinp').model(info)


// $el('#spendform').on('submit',e=>{
//     e.preventDefault()

//     if(!selectedEvent || info.value.trim()=='' || amount.value==0){
//         return
//     }

//     console.log(selectedEvent)
    

//     if(!selectedEvent.transcations){
//         selectedEvent.transcations=[]
//     }

//     selectedEvent.transcations.push({
//         amount:amount.value,
//         info:info.value,
//         categories: Array.from($el('#cat-select').elem.selectedOptions).map(option => option.value),
//     })

//     info.value=''
//     amount.value=0

//     localforage.setItem('events',events.value)

// })




// async function renderChart() {

//     let can= document.getElementById('pie-canvas')
//     can.width=window.innerWidth/2 
//     can.height=window.innerHeight/2
   
// const data = {
//     labels: [
//       'Red',
//       'Green',
//       'Yellow',
//       'Grey',
//       'Blue'
//     ],
//     datasets: [{
//       label: 'My First Dataset',
//       data: [11, 16, 7, 3, 14],
//       backgroundColor: [
//         'rgb(99, 138, 255)',
//         'rgb(75, 192, 124)',
//         'rgb(255, 205, 86)',
//         'rgb(201, 203, 207)',
//         'rgb(235, 102, 54)'
//       ]
//     }]
//   };
 
  
//     Chart.register(PieController);
//     Chart.register(RadialLinearScale)
//     Chart.register(ArcElement)
    
//     new Chart(
//      can,
//       {
//         type: 'pie',
//         data: data,
//         options: {
//             responsive:false,
//             width: 400, // Set the width of the canvas
//             height: 200
//         }
//       }
//     );
//   }

//   //renderChart()