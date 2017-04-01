import DOM from '../utils/dom';
import Keys from '../utils/keys';
import Slide from '../modules/slide';


const CLASSES = {
  ZOOM: 'grid',
  DIV: 'column',
  WRAP: 'wrap-zoom'
};

const ID = 'webslides-zoomed';

/**
 * Zoom plugin.
 */
export default class Zoom {
  /**
   * @param {WebSlides} wsInstance The WebSlides instance
   * @constructor
   */
  constructor(wsInstance) {
    /**
     * @type {WebSlides}
     * @private
     */
    this.ws_ = wsInstance;

    /**
     * @type {WebSlides}
     * @private
     */
    this.zws_ = {};

    /**
     * @type {boolean}
     * @private
     */
    this.isZoomed_ = false;

    this.preBuildZoom_();
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  /**
   * On key down handler. Will decide if Zoom in or out
   * @param {Event} event Key down event
   */
  onKeyDown( event ) {
    if ( !this.isZoomed_ && Keys.MINUS.includes( event.which ) ) {
      this.zoomIn();
    } else if ( this.isZoomed_ && Keys.PLUS.includes( event.which ) ) {
      this.zoomOut();
    }
  }

  /**
   * Prepare zoom structure, scales the slides and uses a grid layout
   * to show them
   */
  preBuildZoom_() {
    // Clone #webslides element
    this.zws_.el = this.ws_.el.cloneNode();
    this.zws_.el.id = ID;
    this.zws_.el.className = CLASSES.ZOOM;
    // Clone the slides
    this.zws_.slides = [].map.call(this.ws_.slides,
        (slide, i) => {
          const s_ = slide.el.cloneNode(true);
          this.zws_.el.appendChild(s_);
          return new Slide(s_, i);
        });
    DOM.hide(this.zws_.el);
    DOM.after(this.zws_.el, this.ws_.el);

    // Creates the container for each slide
    this.zws_.slides.forEach( elem => {
      const wrap = DOM.wrap(elem.el, 'div');
      wrap.className = CLASSES.WRAP;
      const div = DOM.wrap(wrap, 'div');
      div.className = CLASSES.DIV;

      // Calculates the margins in relation to window width
      const divCSS = window.getComputedStyle(div);
      const marginW = DOM.parseSize(divCSS.paddingLeft)
        + DOM.parseSize(divCSS.paddingRight);
      const marginH = DOM.parseSize(divCSS.paddingTop)
        + DOM.parseSize(divCSS.paddingBottom);

      // Sets element size: window size - relative margins
      const scale = divCSS.width.includes('%') ?
        100 / DOM.parseSize(divCSS.width) :
        window.innerWidth / DOM.parseSize(divCSS.width);
      elem.el.style.width = `${window.innerWidth - marginW * scale}px`;
      elem.el.style.height = `${window.innerHeight - marginH * scale}px`;

      // Because of flexbox, wrap height is required
      const slideCSS = window.getComputedStyle(elem.el);
      wrap.style.height = `${DOM.parseSize(slideCSS.height) / scale}px`;
    });
  }

  /**
   * Zoom In the slider, scales the slides and uses a grid layout to show them
   */
  zoomIn() {
    DOM.hide(this.ws_.el);
    DOM.show(this.zws_.el);
    this.isZoomed_ = true;
  }

  /**
   * Zoom Out the slider, remove scale from the slides
   */
  zoomOut() {
    DOM.hide(this.zws_.el);
    DOM.show(this.ws_.el);
    this.isZoomed_ = false;
  }

}
