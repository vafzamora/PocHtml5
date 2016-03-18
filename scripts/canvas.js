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
                var _selection; 
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
                    _context.msImageSmoothingEnabled = true;
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
                        _selection = {
                                left:Math.min(_x1,_x2),
                                top:Math.min(_y1,_y2),
                                bottom:Math.max(_y1, _y2),
                                right:Math.max(_x1, _x2),
                                width:Math.abs(_x1-_x2),
                                height:Math.abs(_y1-_y2)
                            }
                        context.fillRect(0, 0, _selection.left, h);
                        context.fillRect(_selection.left, 0, w - _selection.left, _selection.top);
                        context.fillRect(_selection.left, _selection.bottom, w - _selection.left, h - _selection.bottom);
                        context.fillRect(_selection.right, _selection.top, w - _selection.right, _selection.height);
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
                
                this.CropImage = function(){
                    if(_hasSelection){
                        var cropCanvas = Document.createElement("canvas");
                        cropCanvas.width=_selection.width/_zoom;
                        cropCanvas.height=_selection.height/_zoom;
                        
                        cropCanvas.getContext('2d')
                            .drawImage(_selection.left/_zoom,
                                        _selection.top/_zoom,
                                        cropCanvas.width,
                                        cropCanvas.height,
                                        0,
                                        0,
                                        cropCanvas.width,
                                        cropCanvas.height);       
                       window.open(cropCanvas.toDataURL("image/png"));                 
                    }               
                }
                
                this.RenderImage = function(){
                    renderImage();
                }
            }
        }
    }
};