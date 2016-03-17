var MS = MS || {
    POC: {
        Canvas: {
            CanvasHelper: function (parentElementId, file) {
                var _canvas = document.createElement("canvas");
                _canvas.style.margin="0px auto";
                _canvas.style.display="block";
                   

                var _currentImage = new Image();
                var _parent = document.getElementById(parentElementId);
                _parent.appendChild(_canvas);

                var _isMouseDown = false;
                var _hasSelection = false;
                var _x1 = 0;
                var _y1 = 0;
                var _x2 = -1;
                var _y2 = -1;

                _canvas.onmousedown = function (e) {
                    _x1 = e.offsetX;
                    _y1 = e.offsetY;
                    _x2 = -1;
                    _y2 = -1;
                    _isMouseDown = true;
                };

                _canvas.onmouseup = function (e) {
                    _isMouseDown = false;
                    if (_x2 == -1 && _y2 == -1) {
                        _hasSelection = false;
                        renderImage();
                    }
                };

                _canvas.onmousemove = function (e) {
                    if (!_isMouseDown) return;
                    _hasSelection = true;
                    _x2 = e.offsetX;
                    _y2 = e.offsetY;
                    renderImage();
                };

                // ****** Propriedades ******
                //Zoom
                var _zoom = 1;
                this.GetZoom = function () {
                    return _zoom;
                };
                this.SetZoom = function (value) {
                    _zoom = 1 + (value / 100);
                    _hasSelection = false;
                    renderImage();
                };

                //Rotação
                var _rotation = 0;
                this.GetRotation = function () {
                    return _rotation;
                };
                this.SetRotation = function (value) {
                    _rotation = value * Math.PI/180;
                    renderImage();
                };

                // ****** Funções Privadas ******
                var renderImage = function () {
                    var _imageWidth = _currentImage.width * _zoom;
                    var _imageHeight = _currentImage.height * _zoom;

                    drawSelection(
                        drawImage(_canvas,_imageWidth,_imageHeight)
                    );

                }
                
                var drawImage = function (drawCanvas, imageWidth, imageHeight ){
                    
                    var _context = drawCanvas.getContext('2d');
                   // _context.msImageSmoothingEnabled = true;
                    _context.mozImageSmoothingEnabled = true;
                    _context.imageSmoothingEnabled = true;
                    
                    //TODO: considerar a rotação para redimensionar e reposicionar o canvas para evitar que as bordas sejam cortadas
                    var _angulo = ((_rotation > Math.PI * 0.5 && _rotation < Math.PI * 1) || (_rotation > Math.PI * 1.5 && _rotation < Math.PI * 2)) ? Math.PI - _rotation : _rotation;
                    w = Math.abs(Math.sin(_angulo) * imageHeight + Math.cos(_angulo) * imageWidth);
                    h = Math.abs(Math.sin(_angulo) * imageWidth +  Math.cos(_angulo) * imageHeight);
                    
                    drawCanvas.width = w;
                    drawCanvas.height = h;
                    
                    _context.save();
                    _context.clearRect(0, 0, w, h);
                    _context.translate(w / 2, h / 2);
                    _context.rotate(_rotation);

                    _context.drawImage(_currentImage, imageWidth/-2, imageHeight/-2, imageWidth, imageHeight);
                    _context.restore();
                    return _context; 
                    
                }
                var drawSelection = function (context) {
                    if (_hasSelection) {
                        context.fillStyle = 'rgba(0,0,0,.25)';
                        context.fillRect(0, 0, Math.min(_x1, _x2), h);
                        context.fillRect(Math.min(_x1, _x2), 0, w - Math.min(_x2, _x1), Math.min(_y1, _y2));
                        context.fillRect(Math.min(_x1, _x2), Math.max(_y1, _y2), w - Math.min(_x2, _x1), h - Math.max(_y1, _y2));
                        context.fillRect(Math.max(_x1, _x2), Math.min(_y1, _y2), w - Math.max(_x2, _x1), Math.abs(_y2 - _y1));
                    }

                }
                

                // ****** Métodos ******
                this.LoadImage = function (file, callback) {
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        _currentImage.onload = function () {
                            _zoom=1;
                            _rotation=0;
                            renderImage();
                            if (callback != null) callback();
                        };
                        _currentImage.src = reader.result;
                    };
                    reader.readAsDataURL(file);
                }
                
                this.RenderImage = function(){
                    renderImage();
                }
            }
        }
    }
};