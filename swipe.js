export default class swipeDetector{
    constructor(elem){
        this.elem=elem
        this.elem.addEventListener('touchstart',this.start.bind(this))
        this.elem.addEventListener('touchmove', (e)=>{
            e.preventDefault() 
        }, false)
        this.elem.addEventListener('touchend',this.end.bind(this))
        this.allowedTime=300
        this.threshold=150
        this.restraint=125
         
    }

    start(e){
        this.startX=e.touches[0].clientX
        this.startY=e.touches[0].clientY
        this.startTime=Date.now()
       
    
    }

    end(e){
        this.endX=e.changedTouches[0].clientX
        this.endY=e.changedTouches[0].clientY
        this.endTime=Date.now()
        this.deltaT=this.endTime-this.startTime
        this.deltaX=this.endX-this.startX
        this.deltaY=this.endY-this.startY
        

        

        if( this.deltaT<=this.allowedTime){
            if(Math.abs(this.deltaX)>=this.threshold && Math.abs(this.deltaY)<=this.restraint){ 
                if(this.deltaX>0){
                    this.elem.dispatchEvent(new CustomEvent('swipeleft'))
                }else{
                this.elem.dispatchEvent(new CustomEvent('swiperight'))
                }
            }else if(Math.abs(this.deltaY)>=this.threshold && Math.abs(this.deltaX)<=this.restraint){
                if(this.deltaY>0){
                    this.elem.dispatchEvent(new CustomEvent('swipeup'))
                }else if(this.deltaY<0){
                    this.elem.dispatchEvent(new CustomEvent('swipedown'))
                }
            }  
            }

  
        }
}