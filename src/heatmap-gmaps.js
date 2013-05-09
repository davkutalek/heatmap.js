/* 
 * heatmap.js GMaps overlay
 *
 * Copyright (c) 2011, Patrick Wied (http://www.patrick-wied.at)
 * Dual-licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and the Beerware (http://en.wikipedia.org/wiki/Beerware) license.
 */ 

function HeatmapOverlay(map, cfg){
	var me = this;
	
	me.heatmap = null;
	me.conf = cfg;
	me.latlngs = [];
	me.bounds = null;
	me.setMap(map);
  
<<<<<<< HEAD
	google.maps.event.addListener(map, 'idle', function() { me.draw() });
=======
  //google.maps.event.addListener(map, 'idle', function() { me.draw() });
>>>>>>> upstream/master
}

HeatmapOverlay.prototype = new google.maps.OverlayView();

HeatmapOverlay.prototype.onAdd = function(){
	
    var panes = this.getPanes();
    var w = this.getMap().getDiv().clientWidth;
    var h = this.getMap().getDiv().clientHeight;	
	var el = document.createElement("div");
    
    el.style.cssText = "position:absolute;top:0;left:0;width:"+w+"px;height:"+h+"px;";
    	
    this.conf.element = el;
    panes.overlayLayer.appendChild(el);

    this.heatmap = h337.create(this.conf);
}

HeatmapOverlay.prototype.onRemove = function(){
    // Empty for now.
}

HeatmapOverlay.prototype.draw = function(){
    var overlayProjection = this.getProjection();
    var currentBounds = this.map.getBounds();
    if (currentBounds.equals(this.bounds))
    	return;

    this.bounds = currentBounds;
    
    var ne = overlayProjection.fromLatLngToDivPixel(currentBounds.getNorthEast());
    var sw = overlayProjection.fromLatLngToDivPixel(currentBounds.getSouthWest());
    var topY = ne.y;
    var leftX = sw.x
    var h = sw.y - ne.y;
    var w = ne.x - sw.x;
    
    this.conf.element.style.left = leftX + 'px';
    this.conf.element.style.top = topY + 'px';
    this.conf.element.style.width = w + 'px';
    this.conf.element.style.height = h + 'px';
    this.heatmap.store.get("heatmap").resize();
            
    if (this.latlngs.length > 0) {
	   this.heatmap.clear();
    	
        var len = this.latlngs.length;
        var projection = this.getProjection();
        d = {
	        max: this.heatmap.store.max,
	        data: []
	    };
        
        while (len--) {
            var latlng = this.latlngs[len].latlng;
		    if (!currentBounds.contains(latlng)) { continue; }
		    // DivPixel is pixel in overlay pixel coordinates... we need
		    // to transform to screen coordinates so it'll match the canvas
		    // which is continually repositioned to follow the screen.
		    var divPixel = projection.fromLatLngToDivPixel(latlng);
		    var screenPixel = new google.maps.Point(divPixel.x - leftX, divPixel.y - topY);
	
		    var roundedPoint = this.pixelTransform(screenPixel);
		    d.data.push({ 
		        x: roundedPoint.x,
		        y: roundedPoint.y,
		        count: this.latlngs[len].c
		    });
        }
        this.heatmap.store.setDataSet(d);
    }
}

HeatmapOverlay.prototype.setDataSet = function(data){
    var projection = this.getProjection();
    var currentBounds = this.map.getBounds();

    this.bounds = currentBounds;
    
    var ne = projection.fromLatLngToDivPixel(currentBounds.getNorthEast());
    var sw = projection.fromLatLngToDivPixel(currentBounds.getSouthWest());
    var topY = ne.y;
    var leftX = sw.x
    var h = sw.y - ne.y;
    var w = ne.x - sw.x;
    
    var mapdata = {
        max: data.max,
        data: []
    };
    var d = data.data;
    var dlen = d.length;

    me.latlngs = [];
   
    while (dlen--) {	
    	var latlng = new google.maps.LatLng(d[dlen].lat, d[dlen].lng);
    	if (!currentBounds.contains(latlng)) { continue; }
    	
    	var divPixel = projection.fromLatLngToDivPixel(latlng);
		var screenPixel = new google.maps.Point(divPixel.x - leftX, divPixel.y - topY);
		var roundedPoint = this.pixelTransform(screenPixel);
		
    	this.latlngs.push({latlng: latlng, c: d[dlen].count});
    	mapdata.data.push({x: roundedPoint.x, y: roundedPoint.y, count: d[dlen].count});
    }
    me.heatmap.clear();
    me.heatmap.store.setDataSet(mapdata);
}

HeatmapOverlay.prototype.pixelTransform = function(p){
    var w = this.heatmap.get("width");
    var h = this.heatmap.get("height");

    while (p.x < 0)
    	p.x += w;
	
    while (p.x > w)
    	p.x -= w;
		
    while (p.y < 0)
    	p.y += h;

    while (p.y > h)
    	p.y -= h;

    p.x = (p.x >> 0);
    p.y = (p.y >> 0);
	
    return p;
}

HeatmapOverlay.prototype.addDataPoint = function(lat, lng, count){

    var projection = this.getProjection();
    var latlng = new google.maps.LatLng(lat, lng);
    var point = this.pixelTransform(projection.fromLatLngToDivPixel(latlng));
    
    this.heatmap.store.addDataPoint(point.x, point.y, count);
    this.latlngs.push({ latlng: latlng, c: count });
}

HeatmapOverlay.prototype.toggle = function(){
    this.heatmap.toggleDisplay();
}
