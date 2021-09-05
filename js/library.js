const CNV = {
    context: undefined,
    setContext(context){
        this.context = context;
    },

    line(config){
        !config.color ? config.color = "red" : config
        !config.lineWidth ? config.lineWidth = 5 : config

        this.context.beginPath();
        this.context.moveTo(config.x0, config.y0);
        this.context.lineTo(config.x1, config.y1);
        this.context.lineWidth = config.lineWidth;
        this.context.strokeStyle = config.color;
        this.context.stroke();
    },

    circle(config){
        !config.startAngle ? config.startAngle = 0 : config
        !config.endAngle ? config.endAngle = 2 * Math.PI : config
        !config.radius ? config.radius = 10 : config
        !config.color ? config.color = "red" : config

        this.context.beginPath();
        this.context.fillStyle = config.color;
        this.context.arc(config.x0, config.y0, config.radius, config.startAngle, config.endAngle);
        this.context.fill();
    },

    nearLine(config, callbackSuccess = [], callbackFail = []){
        !config.distance ? config.distance = 1 : config

        if(callbackSuccess){
            if(callbackSuccess instanceof Function){
                callbackSuccess = [callbackSuccess];
            }
        }

        if(callbackFail){
            if(callbackFail instanceof Function){
                callbackFail = [callbackFail];
            }
        }

        const {userX, userY, x1, y1, y2, x2} = config;
        const x0 = userX;
        const y0 = userY ;

        if((x0 > x1 - config.distance) &&  (x0 < x2 + config.distance) || (x0 > x2 - config.distance) &&  (x0 < x1 + config.distance)){
            //ищем расстояние от мышки до прямой
            let len = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            let distance = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - x1 * y2) / len;
            if(distance <= config.distance){

                callbackSuccess.forEach((callback)=>{
                    callback();
                })
                return true;
            } else {
                callbackFail.forEach((callback)=>{
                    callback();
                })
                return false
            }
        }
        return false
    }
}