/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var procesarimagen = procesarimagen || {};

procesarimagen.EnviarDatos = (function() {
   var ctx, context;
    var canvas, newCanvas;
    var cw;
    var cx;
    var ch;
    var cy;
    var dibujar = false;
    var factorDeAlisamiento = 5;
    var Trazados = [];
    var puntos = [];

    function init() {
        // init canvas
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
         newCanvas = document.getElementById('canvas2');
        context = newCanvas.getContext('2d');
        
        resetCanvas();
        
        cw = canvas.width = 200,
                cx = cw / 2;
        ch = canvas.height = 200,
                cy = ch / 2;
        ctx.lineJoin = "round";
        // button events
        document.getElementById('bt-save').onmouseup = sendToServer;
        document.getElementById('bt-clear').onmouseup = resetCanvas;


        // canvas events
        canvas.addEventListener('mousedown', function (evt) {
            dibujar = true;
            //ctx.clearRect(0, 0, cw, ch);
            puntos.length = 0;
            ctx.beginPath();

        }, false);

        canvas.addEventListener('mouseup', function (evt) {
            redibujarTrazados();
        }, false);

        canvas.addEventListener("mouseout", function (evt) {
            redibujarTrazados();
        }, false);

        canvas.addEventListener("mousemove", function (evt) {
            if (dibujar) {
                var m = oMousePos(canvas, evt);
                puntos.push(m);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = document.grosor.valorgrosor.selectedIndex + 1;
                ctx.lineTo(m.x, m.y);
                ctx.stroke();
            }
        }, false);
    }


    function reducirArray(n, elArray) {
        var nuevoArray = [];
        nuevoArray[0] = elArray[0];
        for (var i = 0; i < elArray.length; i++) {
            if (i % n == 0) {
                nuevoArray[nuevoArray.length] = elArray[i];
            }
        }
        nuevoArray[nuevoArray.length - 1] = elArray[elArray.length - 1];
        Trazados.push(nuevoArray);
    }

    function calcularPuntoDeControl(ry, a, b) {
        var pc = {}
        pc.x = (ry[a].x + ry[b].x) / 2;
        pc.y = (ry[a].y + ry[b].y) / 2;
        return pc;
    }

    function alisarTrazado(ry) {
        if (ry.length > 1) {
            var ultimoPunto = ry.length - 1;
            ctx.beginPath();
            ctx.moveTo(ry[0].x, ry[0].y);
            for (i = 1; i < ry.length - 2; i++) {
                var pc = calcularPuntoDeControl(ry, i, i + 1);
                ctx.quadraticCurveTo(ry[i].x, ry[i].y, pc.x, pc.y);
            }
            ctx.quadraticCurveTo(ry[ultimoPunto - 1].x, ry[ultimoPunto - 1].y, ry[ultimoPunto].x, ry[ultimoPunto].y);
            ctx.stroke();
        }
    }


    function redibujarTrazados() {
        dibujar = false;
        ctx.clearRect(0, 0, cw, ch);
        reducirArray(factorDeAlisamiento, puntos);
        for (var i = 0; i < Trazados.length; i++)
            alisarTrazado(Trazados[i]);
    }

    function oMousePos(canvas, evt) {
        var ClientRect = canvas.getBoundingClientRect();
        return {//objeto
            x: Math.round(evt.clientX - ClientRect.left),
            y: Math.round(evt.clientY - ClientRect.top)
        }
    }

    function sendToServer() {
        var rgba = '';
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;

        cloneCanvas(imageData);
        //resizeCanvas(50, 50);
        var canMan = new canvasManager();
        canMan.init($('#canvas2')[0]);
        canMan.fixCanvasForPPI(imageData.width, imageData.height);
        // Draw to canvas at full size
        cloneCanvas(imageData);
        // Resize it down to half
        // Comment the following line to see full version
        canMan.resizeCanvas(25, 25);

        var imageData2 = context.getImageData(0, 0, newCanvas.width, newCanvas.height);
        var data2 = imageData2.data;

        var height = imageData2.height;
        var width = imageData2.width;
        var red;

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                red = data2[(y * imageData2.width + x) * 4 + 0];
                rgba = rgba + red + ',';
            }
        }
          //var data = canvas.toDataURL('image/png');
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            // request complete
            if (xhr.readyState == 4) {
                window.open('http://localhost:9999/Cliente/rest/data/'+rgba,'_blank');  
                //alert('Exito');
            }
        }
        xhr.open('GET','http://localhost:9999/Cliente/rest/data/',true);
        //xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(null);  
    }

    function cloneCanvas(oldCanvas) {
        //create a new canvas
        newCanvas = document.getElementById('canvas2');
        context = newCanvas.getContext('2d');
        //set dimensions
        newCanvas.width = oldCanvas.width;
        newCanvas.height = oldCanvas.height;
        //apply the old canvas to the new one
        context.putImageData(oldCanvas, 0, 0);
        //return the new canvas
        return newCanvas;
    }

    function canvasManager() {
        this.element = null;
        this.ctx = null;

        this.init = function (canvasElement) {
            this.element = canvasElement;
            this.ctx = canvasElement.getContext('2d');
        };

        this.createImageData = function () {
            return this.ctx.createImageData(this.element.width, this.element.height);
        };

        this.setPixel = function (imageData, x, y, r, g, b, a) {
            index = (x + y * imageData.width) * 4;
            imageData.data[index + 0] = r;
            imageData.data[index + 1] = g;
            imageData.data[index + 2] = b;
            imageData.data[index + 3] = a;
        };

        this.putImageData = function (imageData, x, y, alias) {
            alias = alias || true;

            this.ctx.webkitImageSmoothingEnabled = alias;
            this.ctx.mozImageSmoothingEnabled = alias;
            this.ctximageSmoothingEnabled = alias;

            //console.log("Copying to canvas " + Date.now());
            this.ctx.putImageData(
                    imageData,
                    x, // at coords 0,0
                    y
                    );
        };

        this.fixCanvasForPPI = function (width, height) {

            width = parseInt(width);
            height = parseInt(height);

            // finally query the various pixel ratios
            var devicePixelRatio = window.devicePixelRatio || 1;
            var backingStoreRatio = this.ctx.webkitBackingStorePixelRatio ||
                    this.ctx.mozBackingStorePixelRatio ||
                    this.ctx.msBackingStorePixelRatio ||
                    this.ctx.oBackingStorePixelRatio ||
                    this.ctx.backingStorePixelRatio || 1;

            var ratio = devicePixelRatio / backingStoreRatio;

            // ensure we have a value set for auto.
            // If auto is set to false then we
            // will simply not upscale the canvas
            // and the default behaviour will be maintained
            if (typeof auto === 'undefined') {
                auto = true;
            }

            // upscale the canvas if the two ratios don't match
            if (auto && devicePixelRatio !== backingStoreRatio) {

                $(this.element).attr({
                    'width': width * ratio,
                    'height': height * ratio
                });

                $(this.element).css({
                    'width': width + 'px',
                    'height': height + 'px'
                });

                // now scale the context to counter
                // the fact that we've manually scaled
                // our canvas element
                this.ctx.scale(ratio, ratio);

            }
            // No weird ppi so just resize canvas to fit the tag
            else
            {
                $(this.element).attr({
                    'width': width,
                    'height': height
                });

                $(this.element).css({
                    'width': width + 'px',
                    'height': height + 'px'
                });
            }
        };

        this.resizeCanvas = function (width, height) {
            oldWidth = this.element.width;
            oldHeight = this.element.height;

            imageData = this.ctx.getImageData(0, 0, oldWidth, oldHeight);

            var newCanvas = $("<canvas>")
                    .attr("width", imageData.width)
                    .attr("height", imageData.height)[0];
            newCanvas.getContext("2d").putImageData(imageData, 0, 0);

            this.fixCanvasForPPI(width, height);

            this.ctx.clearRect(0, 0, width, height);
            this.ctx.drawImage(newCanvas, 0, 0, oldWidth, oldHeight, 0, 0, width, height);
        };
    }



    function resetCanvas() {
        // just repaint canvas black
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.clearRect(0, 0, cw, ch);
        
        context.fillRect(0, 0, 25, 25);
        context.clearRect(0, 0, 25, 25);
        
        Trazados.length = 0;
        
    }

    return {
        'init': init
    };
});


window.onload = function() {
    new procesarimagen.EnviarDatos().init();
};




