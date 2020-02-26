const defaultConfig = {
  arrowSize: 15,
  arrowStyle: 0,
  shadowStyle: 1,
  minWidth: 50,
  arrowPosition: 50,
  padding: 10,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  backgroundColor: '#fff',
  closeSrc: 'https://maps.gstatic.com/intl/en_us/mapfiles/iw_close.gif',
  disableAutoPan: false,
  disableAnimation: false,
}
const EVENTS = ['mousedown', 'mousemove', 'mouseover', 'mouseout', 'mouseup',
  'mousewheel', 'DOMMouseScroll', 'touchstart', 'touchend', 'touchmove',
  'dblclick', 'contextmenu', 'click'];

export default class InfoBubble {
  constructor(opt_options = {}, maps = null) {
    this.maps = maps;
    if (!this.maps) return new Error('A google maps library is needed');
    this.extend(this, this.maps.OverlayView);
    this.tabs_ = [];
    this.activeTab_ = null;
    this.baseZIndex_ = 100;
    this.isOpen_ = false;
    this.buildDom_();
    this.setValues(Object.assign({}, defaultConfig, opt_options));
  }

  extend(obj1, obj2) {
    return (function (object) {
      for (let property in object.prototype) {
        this[property] = object.prototype[property];
      }
      return this;
    }).apply(obj1, [obj2]);
  }

  buildDom_() {
    let bubble = this.createBubble();
    let tabsContainer = this.createTabContainer();
    let close = this.createClose();
    let contentContainer = this.createContentContainer();
    let { arrow, arrowOuter, arrowInner } = this.createArrow();
    let bubbleShadow = this.createBubbleShadow();
    this.addStylesAndContentBubble({ bubble, bubbleShadow, tabsContainer, close, contentContainer, arrow, arrowOuter, arrowInner });
  }

  addStylesAndContentBubble({ bubble, bubbleShadow, tabsContainer, close, contentContainer, arrow, arrowOuter, arrowInner }) {
    bubble.style['display'] = bubbleShadow.style['display'] = 'none';
    bubble.appendChild(tabsContainer);
    bubble.appendChild(close);
    bubble.appendChild(contentContainer);
    arrow.appendChild(arrowOuter);
    arrow.appendChild(arrowInner);
    bubble.appendChild(arrow);
    this.addStyles();
  }

  addStyles() {
    let stylesheet = document.createElement('style');
    stylesheet.setAttribute('type', 'text/css');
    this.animationName_ = '_ibani_' + Math.round(Math.random() * 10000);
    let css = '.' + this.animationName_ + '{-webkit-animation-name:' +
      this.animationName_ + ';-webkit-animation-duration:0.5s;' +
      '-webkit-animation-iteration-count:1;}' +
      '@-webkit-keyframes ' + this.animationName_ + ' {from {' +
      '-webkit-transform: scale(0)}50% {-webkit-transform: scale(1.2)}90% ' +
      '{-webkit-transform: scale(0.95)}to {-webkit-transform: scale(1)}}';
    stylesheet.textContent = css;
    document.getElementsByTagName('head')[0].appendChild(stylesheet);
  }

  createBubbleShadow() {
    let bubbleShadow = this.bubbleShadow_ = document.createElement('DIV');
    bubbleShadow.style['position'] = 'absolute';
    return bubbleShadow;
  }

  createArrow() {
    let arrow = this.arrow_ = document.createElement('DIV');
    arrow.style['position'] = 'relative';
    let arrowOuter = this.arrowOuter_ = document.createElement('DIV');
    let arrowInner = this.arrowInner_ = document.createElement('DIV');
    let arrowSize = this.getArrowSize_();
    arrowOuter.style['position'] = arrowInner.style['position'] = 'absolute';
    arrowOuter.style['left'] = arrowInner.style['left'] = '50%';
    arrowOuter.style['height'] = arrowInner.style['height'] = '0';
    arrowOuter.style['width'] = arrowInner.style['width'] = '0';
    arrowOuter.style['marginLeft'] = this.px(-arrowSize);
    arrowOuter.style['borderWidth'] = this.px(arrowSize);
    arrowOuter.style['borderBottomWidth'] = 0;
    return { arrow, arrowOuter, arrowInner };
  }

  createContentContainer() {
    let contentContainer = this.contentContainer_ = document.createElement('DIV');
    contentContainer.style['overflowX'] = 'auto';
    contentContainer.style['overflowY'] = 'auto';
    contentContainer.style['cursor'] = 'default';
    contentContainer.style['clear'] = 'both';
    contentContainer.style['position'] = 'relative';
    let content = this.content_ = document.createElement('DIV');
    contentContainer.appendChild(content);
    return contentContainer;
  }

  createClose() {
    let close = this.close_ = document.createElement('IMG');
    close.style['position'] = 'absolute';
    close.style['border'] = 0;
    close.style['zIndex'] = this.baseZIndex_ + 1;
    close.style['cursor'] = 'pointer';
    close.src = this.get('closeSrc');
    this.maps.event.addDomListener(close, 'click', () => {
      this.close();
      this.maps.event.trigger(this, 'closeclick');
    });
    return close;
  }

  createTabContainer() {
    let tabsContainer = this.tabsContainer_ = document.createElement('DIV');
    tabsContainer.style['position'] = 'relative';
    return tabsContainer;
  }

  createBubble() {
    let bubble = this.bubble_ = document.createElement('DIV');
    bubble.style['position'] = 'absolute';
    bubble.style['zIndex'] = this.baseZIndex_;
    return bubble;
  }

  setBackgroundClassName(className) {
    this.set('backgroundClassName', className);
  }
  backgroundClassName_changed() {
    this.content_.className = this.get('backgroundClassName');
  }
  setTabClassName(className) {
    this.set('tabClassName', className);
  }
  tabClassName_changed() {
    this.updateTabStyles_();
  }

  getArrowStyle_() {
    return parseInt(this.get('arrowStyle'), 10) || 0;
  }
  setArrowStyle(style) {
    this.set('arrowStyle', style);
  }

  arrowStyle_changed() {
    this.arrowSize_changed();
  }

  getArrowSize_() {
    return parseInt(this.get('arrowSize'), 10) || 0;
  }

  setArrowSize(size) {
    this.set('arrowSize', size);
  }

  arrowSize_changed() {
    this.borderWidth_changed();
  }

  setArrowPosition(pos) {
    this.set('arrowPosition', pos);
  }

  getArrowPosition_() {
    return parseInt(this.get('arrowPosition'), 10) || 0;
  }

  arrowPosition_changed() {
    let pos = this.getArrowPosition_();
    this.arrowOuter_.style['left'] = this.arrowInner_.style['left'] = pos + '%';

    this.redraw_();
  }

  setZIndex(zIndex) {
    this.set('zIndex', zIndex);
  }

  getZIndex() {
    return parseInt(this.get('zIndex'), 10) || this.baseZIndex_;
  }

  zIndex_changed() {
    let zIndex = this.getZIndex();
    this.bubble_.style['zIndex'] = this.baseZIndex_ = zIndex;
    this.close_.style['zIndex'] = zIndex + 1;
  }

  setShadowStyle(shadowStyle) {
    this.set('shadowStyle', shadowStyle);
  }

  getShadowStyle_() {
    return parseInt(this.get('shadowStyle'), 10) || 0;
  }


  shadowStyle_changed() {
    let shadowStyle = this.getShadowStyle_(), display = '', shadow = '', backgroundColor = '';
    ({ display, shadow, backgroundColor } = conditionShadowStylesMode(shadowStyle, display, shadow, backgroundColor));
    this.bubbleShadow_.style['boxShadow'] = this.bubbleShadow_.style['webkitBoxShadow'] = this.bubbleShadow_.style['MozBoxShadow'] = shadow;
    this.bubbleShadow_.style['backgroundColor'] = backgroundColor;
    if (this.isOpen_) {
      this.bubbleShadow_.style['display'] = display;
      this.draw();
    }
  }

  showCloseButton() {
    this.set('hideCloseButton', false);
  }

  hideCloseButton() {
    this.set('hideCloseButton', true);
  }

  hideCloseButton_changed() {
    this.close_.style['display'] = this.get('hideCloseButton') ? 'none' : '';
  }

  setBackgroundColor(color) {
    if (color) this.set('backgroundColor', color);
  }

  backgroundColor_changed() {
    let backgroundColor = this.get('backgroundColor');
    this.contentContainer_.style['backgroundColor'] = backgroundColor;
    this.arrowInner_.style['borderColor'] = backgroundColor + ' transparent transparent';
    this.updateTabStyles_();
  }

  setBorderColor(color) {
    if (color) this.set('borderColor', color);
  }

  borderColor_changed() {
    let borderColor = this.get('borderColor'), contentContainer = this.contentContainer_, arrowOuter = this.arrowOuter_;
    contentContainer.style['borderColor'] = borderColor;
    arrowOuter.style['borderColor'] = borderColor + ' transparent transparent';
    contentContainer.style['borderStyle'] = arrowOuter.style['borderStyle'] = this.arrowInner_.style['borderStyle'] = 'solid';
    this.updateTabStyles_();
  }

  setBorderRadius(radius) {
    this.set('borderRadius', radius);
  }

  getBorderRadius_() {
    return parseInt(this.get('borderRadius'), 10) || 0;
  }

  borderRadius_changed() {
    let borderRadius = this.getBorderRadius_(), borderWidth = this.getBorderWidth_();
    this.contentContainer_.style['borderRadius'] = this.contentContainer_.style['MozBorderRadius'] = this.contentContainer_.style['webkitBorderRadius'] =
      this.bubbleShadow_.style['borderRadius'] = this.bubbleShadow_.style['MozBorderRadius'] = this.bubbleShadow_.style['webkitBorderRadius'] =
      this.px(borderRadius);
    this.tabsContainer_.style['paddingLeft'] = this.tabsContainer_.style['paddingRight'] = this.px(borderRadius + borderWidth);
    this.redraw_();
  }

  getBorderWidth_() {
    return parseInt(this.get('borderWidth'), 10) || 0;
  }

  setBorderWidth(width) {
    this.set('borderWidth', width);
  }

  borderWidth_changed() {
    let borderWidth = this.getBorderWidth_();
    this.contentContainer_.style['borderWidth'] = this.px(borderWidth);
    this.tabsContainer_.style['top'] = this.px(borderWidth);
    this.updateArrowStyle_();
    this.updateTabStyles_();
    this.borderRadius_changed();
    this.redraw_();
  }

  updateArrowStyle_() {
    let borderWidth = this.getBorderWidth_(),
      arrowSize = this.getArrowSize_(),
      arrowStyle = this.getArrowStyle_(),
      arrowOuterSizePx = this.px(arrowSize),
      arrowInnerSizePx = this.px(Math.max(0, arrowSize - borderWidth)),
      outer = this.arrowOuter_,
      inner = this.arrowInner_;
    this.arrow_.style['marginTop'] = this.px(-borderWidth);
    outer.style['borderTopWidth'] = arrowOuterSizePx;
    inner.style['borderTopWidth'] = arrowInnerSizePx;
    this.updateArrowStyleByType(arrowStyle, outer, arrowOuterSizePx, inner, arrowInnerSizePx, arrowSize, borderWidth);
    if (borderWidth === 0) outer.style['display'] = 'none';
    else outer.style['display'] = '';
  }

  updateArrowStyleByType(arrowStyle, outer, arrowOuterSizePx, inner, arrowInnerSizePx, arrowSize, borderWidth) {
    if (arrowStyle === 0 || arrowStyle === 1) {
      outer.style['borderLeftWidth'] = arrowOuterSizePx;
      inner.style['borderLeftWidth'] = arrowInnerSizePx;
    } else outer.style['borderLeftWidth'] = inner.style['borderLeftWidth'] = 0;
    if (arrowStyle === 0 || arrowStyle === 2) {
      outer.style['borderRightWidth'] = arrowOuterSizePx;
      inner.style['borderRightWidth'] = arrowInnerSizePx;
    } else outer.style['borderRightWidth'] = inner.style['borderRightWidth'] = 0;
    if (arrowStyle < 2) {
      outer.style['marginLeft'] = this.px(-(arrowSize));
      inner.style['marginLeft'] = this.px(-(arrowSize - borderWidth));
    } else outer.style['marginLeft'] = inner.style['marginLeft'] = 0;
  }

  setPadding(padding) {
    this.set('padding', padding);
  }
  setCloseSrc(src) {
    if (src && this.close_) this.close_.src = src;
  }

  getPadding_() {
    return parseInt(this.get('padding'), 10) || 0;
  }

  padding_changed() {
    let padding = this.getPadding_();
    this.contentContainer_.style['padding'] = this.px(padding);
    this.updateTabStyles_();
    this.redraw_();
  }
  px(num) {
    return num ? `${num}px` : num;
  }

  addEvents_() {
    let bubble = this.bubble_;
    this.listeners_ = []; // eslint-disable-next-line
    for (let i = 0, event; event = EVENTS[i]; i++) {
      this.listeners_.push(
        this.maps.event.addDomListener(bubble, event, (e) => {
          e.cancelBubble = true;
          if (e.stopPropagation) e.stopPropagation();
        })
      );
    }
  }

  onAdd() {
    if (!this.bubble_) this.buildDom_();
    this.addEvents_();
    let panes = this.getPanes();
    if (panes) {
      panes.floatPane.appendChild(this.bubble_);
      panes.floatShadow.appendChild(this.bubbleShadow_);
    }
    this.maps.event.trigger(this, 'domready');
  }

  draw() {
    let projection = this.getProjection();
    if (!projection) return;
    let latLng = (this.get('position'));
    if (!latLng) return this.close();
    let tabHeight = 0;
    if (this.activeTab_) tabHeight = this.activeTab_.offsetHeight;
    let { width, pos, height, arrowSize, anchorHeight, arrowPosition } = this.drawGetVars(projection, latLng);
    if (!width) return;
    let top = pos.y - (height + arrowSize);
    if (anchorHeight) top -= anchorHeight;
    let left = pos.x - (width * arrowPosition);
    this.bubble_.style['top'] = this.px(top);
    this.bubble_.style['left'] = this.px(left);
    width = this.manageBubbleShadowStyle(top, tabHeight, left, width, arrowSize, anchorHeight, pos, arrowPosition);
  }

  drawGetVars(projection, latLng) {
    let anchorHeight = this.getAnchorHeight_();
    let arrowSize = this.getArrowSize_();
    let arrowPosition = this.getArrowPosition_() / 100;
    let pos = projection.fromLatLngToDivPixel(latLng);
    let width = this.contentContainer_.offsetWidth;
    let height = this.bubble_.offsetHeight;
    return { width, pos, height, arrowSize, anchorHeight, arrowPosition };
  }

  manageBubbleShadowStyle(top, tabHeight, left, width, arrowSize, anchorHeight, pos, arrowPosition) {
    let shadowStyle = parseInt(this.get('shadowStyle'), 10);
    switch (shadowStyle) {
      case 1:
        this.bubbleShadow_.style['top'] = this.px(top + tabHeight - 1);
        this.bubbleShadow_.style['left'] = this.px(left);
        this.bubbleShadow_.style['width'] = this.px(width);
        this.bubbleShadow_.style['height'] = this.px(this.contentContainer_.offsetHeight - arrowSize);
        break;
      case 2:
        width = width * 0.8;
        if (anchorHeight) this.bubbleShadow_.style['top'] = this.px(pos.y);
        else this.bubbleShadow_.style['top'] = this.px(pos.y + arrowSize);
        this.bubbleShadow_.style['left'] = this.px(pos.x - width * arrowPosition);
        this.bubbleShadow_.style['width'] = this.px(width);
        this.bubbleShadow_.style['height'] = this.px(2);
        break;
    }
    return width;
  }

  onRemove() {
    if (this.bubble_ && this.bubble_.parentNode) this.bubble_.parentNode.removeChild(this.bubble_);
    if (this.bubbleShadow_ && this.bubbleShadow_.parentNode) this.bubbleShadow_.parentNode.removeChild(this.bubbleShadow_); // eslint-disable-next-line
    for (let i = 0, listener; listener = this.listeners_[i]; i++) this.maps.event.removeListener(listener);
  }

  isOpen() {
    return this.isOpen_;
  }

  close() {
    if (this.bubble_) {
      this.bubble_.style['display'] = 'none';
      this.bubble_.className = this.bubble_.className.replace(this.animationName_, '');
    }
    if (this.bubbleShadow_) {
      this.bubbleShadow_.style['display'] = 'none';
      this.bubbleShadow_.className =
        this.bubbleShadow_.className.replace(this.animationName_, '');
    }
    this.isOpen_ = false;
  }

  open(opt_map, opt_anchor) {
    window.setTimeout(() => {
      this.open_(opt_map, opt_anchor);
    }, 0);
  }

  open_(opt_map, opt_anchor) {
    this.updateContent_();
    if (opt_map) this.setMap(opt_map);
    if (opt_anchor) {
      this.set('anchor', opt_anchor);
      this.bindTo('anchorPoint', opt_anchor);
      this.bindTo('position', opt_anchor);
    }
    this.manageAnimationAtOpen();
    this.redraw_();
    this.isOpen_ = true;
    this.managePanAtOpen();
  }

  manageAnimationAtOpen() {
    this.bubble_.style['display'] = this.bubbleShadow_.style['display'] = '';
    let animation = !this.get('disableAnimation');
    if (animation) {
      this.bubble_.className += ' ' + this.animationName_;
      this.bubbleShadow_.className += ' ' + this.animationName_;
    }
  }

  managePanAtOpen() {
    if (!this.get('disableAutoPan')) window.setTimeout(() => { this.panToView(); }, 200);
  }

  setPosition(position) {
    if (position) this.set('position', position);
  }

  getPosition() {
    return /** @type {this.maps.LatLng} */ (this.get('position'));
  }

  position_changed() {
    this.draw();
  }

  panToView() {
    let deltaY = 0, projection = this.getProjection();
    if (!projection || !this.bubble_) return;
    let map = this.get('map');
    let centerPos = projection.fromLatLngToContainerPixel(map.getCenter());
    let pos = projection.fromLatLngToContainerPixel(this.getPosition());
    let spaceTop = centerPos.y - this.bubble_.offsetHeight + this.getAnchorHeight_();
    if (spaceTop < 0) {
      spaceTop *= -1;
      deltaY = (spaceTop + (map.getDiv().offsetHeight - centerPos.y)) / 2;
    }
    pos.y -= deltaY;
    let latLng = projection.fromContainerPixelToLatLng(pos);
    if (map.getCenter() !== latLng) map.panTo(latLng);
  }

  htmlToDocumentFragment_(htmlString) {
    htmlString = htmlString.replace(/^\s*([\S\s]*)\b\s*$/, '$1');
    let tempDiv = document.createElement('DIV');
    tempDiv.innerHTML = htmlString;
    if (tempDiv.childNodes.length === 1) {
      return /** @type {!Node} */ (tempDiv.removeChild(tempDiv.firstChild));
    } else {
      let fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      return fragment;
    }
  }

  removeChildren_(node) {
    if (!node) return;
    let child; // eslint-disable-next-line
    while (child = node.firstChild) {
      node.removeChild(child);
    }
  }

  setContent(content) {
    this.set('content', content);
  }

  getContent() {
    return /** @type {Node|string} */ (this.get('content'));
  }

  updateContent_() {
    if (!this.content_) return;
    this.removeChildren_(this.content_);
    let content = this.getContent();
    if (content) {
      if (typeof content === 'string') {
        content = this.htmlToDocumentFragment_(content);
      }
      this.content_.appendChild(content);
      let that = this;
      let images = this.content_.getElementsByTagName('IMG');
      // eslint-disable-next-line
      for (let i = 0, image; image = images[i]; i++) {
        this.maps.event.addDomListener(image, 'load', function () {
          that.imageLoaded_();
        });
      }
    }
    this.redraw_();
  }

  imageLoaded_() {
    this.redraw_();
    if (!this.get('disableAutoPan') && (this.tabs_.length === 0 || this.activeTab_.index === 0)) this.panToView();
  }

  updateTabStyles_() {
    if (!(this.tabs_ && this.tabs_.length)) return;  // eslint-disable-next-line
    for (let i = 0, tab; tab = this.tabs_[i]; i++) this.setTabStyle_(tab.tab);
    this.activeTab_.style['zIndex'] = this.baseZIndex_;
    this.activeTab_.style['borderBottomWidth'] = 0;
    this.activeTab_.style['paddingBottom'] = this.px(this.getPadding_() / 2 + this.getBorderWidth_());
  }

  setTabStyle_(tab) {
    let borderRadius = this.getBorderRadius_();
    let padding = this.getPadding_();
    let styles = this.getTabStyles(this.get('backgroundColor'), this.getBorderWidth_(), this.get('borderColor'), padding, this.px(-(Math.max(padding, borderRadius))), this.px(borderRadius), tab.index ? this.baseZIndex_ - tab.index : this.baseZIndex_)
    for (let style in styles) tab.style[style] = styles[style];
    tab.className += ' ' + (this.get('tabClassName') || '');
  }

  getTabStyles(backgroundColor, borderWidth, borderColor, padding, marginRight, borderRadiusPx, index) {
    return {
      'cssFloat': 'left',
      'position': 'relative',
      'cursor': 'pointer',
      'backgroundColor': backgroundColor,
      'border': this.px(borderWidth) + ' solid ' + borderColor,
      'padding': this.px(padding / 2) + ' ' + this.px(padding),
      'marginRight': marginRight,
      'whiteSpace': 'nowrap',
      'borderRadiusTopLeft': borderRadiusPx,
      'MozBorderRadiusTopleft': borderRadiusPx,
      'webkitBorderTopLeftRadius': borderRadiusPx,
      'borderRadiusTopRight': borderRadiusPx,
      'MozBorderRadiusTopright': borderRadiusPx,
      'webkitBorderTopRightRadius': borderRadiusPx,
      'zIndex': index,
      'display': 'inline'
    };
  }

  addTabActions_(tab) {
    tab.listener_ = this.maps.event.addDomListener(tab, 'click', () => this.setTabActive_(this));
  }

  setTabActive(index) {
    let tab = this.tabs_[index - 1];
    if (tab) this.setTabActive_(tab.tab);
  }

  setTabActive_(tab) {
    if (!tab) {
      this.setContent('');
      this.updateContent_();
      return;
    }
    let padding = this.getPadding_() / 2;
    let borderWidth = this.getBorderWidth_();
    if (this.activeTab_) this.activeTabStyles(padding, borderWidth);
    tab.style['zIndex'] = this.baseZIndex_;
    tab.style['borderBottomWidth'] = 0;
    tab.style['marginBottomWidth'] = '-10px';
    tab.style['paddingBottom'] = this.px(padding + borderWidth);
    this.setContent(this.tabs_[tab.index].content);
    this.updateContent_();
    this.activeTab_ = tab;
    this.redraw_();
  }

  activeTabStyles(padding, borderWidth) {
    let activeTab = this.activeTab_;
    activeTab.style['zIndex'] = this.baseZIndex_ - activeTab.index;
    activeTab.style['paddingBottom'] = this.px(padding);
    activeTab.style['borderBottomWidth'] = this.px(borderWidth);
  }

  setMaxWidth(width) {
    this.set('maxWidth', width);
  }

  maxWidth_changed() {
    this.redraw_();
  }

  setMaxHeight(height) {
    this.set('maxHeight', height);
  }

  maxHeight_changed() {
    this.redraw_();
  }

  setMinWidth(width) {
    this.set('minWidth', width);
  }

  minWidth_changed() {
    this.redraw_();
  }

  setMinHeight(height) {
    this.set('minHeight', height);
  }

  minHeight_changed() {
    this.redraw_();
  }

  addTab(label, content) {
    let tab = this.createNewTab(label);
    this.tabs_.push({ label: label, content: content, tab: tab });
    tab.index = this.tabs_.length - 1;
    tab.style['zIndex'] = this.baseZIndex_ - tab.index;
    if (!this.activeTab_) this.setTabActive_(tab);
    tab.className = tab.className + ' ' + this.animationName_;
    this.redraw_();
  }

  createNewTab(label) {
    let tab = document.createElement('DIV');
    tab.innerHTML = label;
    this.setTabStyle_(tab);
    this.addTabActions_(tab);
    this.tabsContainer_.appendChild(tab);
    return tab;
  }

  updateTab(index, opt_label, opt_content) {
    if (!this.tabs_.length || index < 0 || index >= this.tabs_.length) return;
    let tab = this.tabs_[index];
    if (opt_label != undefined) tab.tab.innerHTML = tab.label = opt_label;
    if (opt_content != undefined) tab.content = opt_content;
    if (this.activeTab_ === tab.tab) {
      this.setContent(tab.content);
      this.updateContent_();
    }
    this.redraw_();
  }

  removeTab(index) {
    if (!this.tabs_.length || index < 0 || index >= this.tabs_.length) return;
    let tab = this.tabs_[index];
    tab.tab.parentNode.removeChild(tab.tab);
    this.maps.event.removeListener(tab.tab.listener_);
    this.tabs_.splice(index, 1); // eslint-disable-next-line
    for (let i = 0, t; t = this.tabs_[i]; i++) t.tab.index = i;
    this.removeTabActiveTab(tab, index);
    this.redraw_();
  }

  removeTabActiveTab(tab, index) {
    if (tab.tab === this.activeTab_) {
      if (this.tabs_[index])
        this.activeTab_ = this.tabs_[index].tab;
      else if (this.tabs_[index - 1])
        this.activeTab_ = this.tabs_[index - 1].tab;
      else
        this.activeTab_ = undefined;
      this.setTabActive_(this.activeTab_);
    }
  }

  getElementSize_(element, opt_maxWidth, opt_maxHeight) {
    let sizer = this.createSizer(element);
    let size = new this.maps.Size(sizer.offsetWidth, sizer.offsetHeight);
    if (opt_maxWidth && size.width > opt_maxWidth) {
      sizer.style['width'] = this.px(opt_maxWidth);
      size = new this.maps.Size(sizer.offsetWidth, sizer.offsetHeight);
    }
    if (opt_maxHeight && size.height > opt_maxHeight) {
      sizer.style['height'] = this.px(opt_maxHeight);
      size = new this.maps.Size(sizer.offsetWidth, sizer.offsetHeight);
    }
    document.body.removeChild(sizer);
    return size;
  }

  createSizer(element) {
    let sizer = document.createElement('DIV');
    sizer.style['display'] = 'inline';
    sizer.style['position'] = 'absolute';
    sizer.style['visibility'] = 'hidden';
    if (typeof element === 'string') sizer.innerHTML = element;
    else sizer.appendChild(element.cloneNode(true));
    document.body.appendChild(sizer);
    return sizer;
  }

  redraw_() {
    this.figureOutSize_();
    this.positionCloseButton_();
    this.draw();
  }

  figureOutSize_() {
    let map = this.get('map');
    if (!map) return;
    let { maxWidth, maxHeight, width, height, tabHeight, arrowSize, mapWidth, mapHeight } = this.figureOutInitialSizes(map), tabWidth = 0, contentSize;
    ({ contentSize, width, height } = this.manageSizeOfTabs(maxWidth, maxHeight, contentSize, width, tabWidth, height, tabHeight));
    ({ width, height, arrowSize } = this.manageSizeOfContainer(maxWidth, width, maxHeight, height, tabWidth, arrowSize, mapWidth, mapHeight, tabHeight));
    if (this.tabsContainer_) {
      this.tabHeight_ = tabHeight;
      this.tabsContainer_.style['width'] = this.px(tabWidth);
    }
    this.contentContainer_.style['width'] = this.px(width);
    this.contentContainer_.style['height'] = this.px(height);
  }

  manageSizeOfContainer(maxWidth, width, maxHeight, height, tabWidth, arrowSize, mapWidth, mapHeight, tabHeight) {
    if (maxWidth) width = Math.min(width, maxWidth);
    if (maxHeight) height = Math.min(height, maxHeight);
    width = Math.max(width, tabWidth);
    if (width === tabWidth) width = width + 2 * this.getPadding_();
    arrowSize = arrowSize * 2;
    width = Math.max(width, arrowSize);
    if (width > mapWidth) width = mapWidth;
    if (height > mapHeight) height = mapHeight - tabHeight;
    return { width, height, arrowSize };
  }

  manageSizeOfTabs(maxWidth, maxHeight, contentSize, width, tabWidth, height, tabHeight) {
    if (this.tabs_.length) { // eslint-disable-next-line
      for (let i = 0, tab; tab = this.tabs_[i]; i++) {
        let tabSize = this.getElementSize_(tab.tab, maxWidth, maxHeight);
        contentSize = this.getElementSize_(tab.content, maxWidth, maxHeight);
        ({ width, tabWidth, height, tabHeight } = this.figureSizeSingleTab(width, tabSize, tabWidth, height, tabHeight, contentSize));
      }
    } else {
      let content = /** @type {string|Node} */ (this.get('content'));
      if (typeof content === 'string')
        content = this.htmlToDocumentFragment_(content);
      if (content) {
        contentSize = this.getElementSize_(content, maxWidth, maxHeight);
        if (width < contentSize.width)
          width = contentSize.width;
        if (height < contentSize.height)
          height = contentSize.height;
      }
    }
    return { contentSize, width, height };
  }

  figureSizeSingleTab(width, tabSize, tabWidth, height, tabHeight, contentSize) {
    if (width < tabSize.width) width = tabSize.width;
    tabWidth += tabSize.width;
    if (height < tabSize.height) height = tabSize.height;
    if (tabSize.height > tabHeight) tabHeight = tabSize.height;
    if (width < contentSize.width) width = contentSize.width;
    if (height < contentSize.height) height = contentSize.height;
    return { width, tabWidth, height, tabHeight };
  }

  figureOutInitialSizes(map) {
    let arrowSize = this.getArrowSize_(), mapDiv = map.getDiv(), gutter = arrowSize * 2;
    let mapWidth = mapDiv.offsetWidth - gutter;
    let mapHeight = mapDiv.offsetHeight - gutter - this.getAnchorHeight_();
    return {
      maxWidth: Math.min(mapWidth, (this.get('maxWidth') || 0)),
      maxHeight: Math.min(mapHeight, (this.get('maxHeight') || 0)),
      width: (this.get('minWidth') || 0),
      height: (this.get('minHeight') || 0),
      tabHeight: 0,
      arrowSize,
      mapWidth,
      mapHeight
    };
  }

  getAnchorHeight_() {
    if (this.get('anchor')) {
      let anchorPoint = /** @type this.maps.Point */(this.get('anchorPoint'));
      if (anchorPoint) return -1 * anchorPoint.y;
    }
    return 0;
  }

  anchorPoint_changed() {
    this.draw();
  }

  positionCloseButton_() {
    let bw = this.getBorderWidth_(), right = 2, top = 2, c = this.contentContainer_;
    if (this.tabs_.length && this.tabHeight_) top += this.tabHeight_;
    top += bw;
    right += bw;
    if (c && c.clientHeight < c.scrollHeight) right += 15;
    this.close_.style['right'] = this.px(right);
    this.close_.style['top'] = this.px(top);
  }
}

function conditionShadowStylesMode(shadowStyle, display, shadow, backgroundColor) {
  switch (shadowStyle) {
    case 0:
      display = 'none';
      break;
    case 1:
      shadow = '40px 15px 10px rgba(33,33,33,0.3)';
      backgroundColor = 'transparent';
      break;
    case 2:
      shadow = '0 0 2px rgba(33,33,33,0.3)';
      backgroundColor = 'rgba(33,33,33,0.35)';
      break;
  }
  return { display, shadow, backgroundColor };
}

