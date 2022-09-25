interface PinnerConfig {
  refs: PinnerRefs;
  imgSrc: string;
  props: Partial<PinnerProps>;
}

interface PinnerRefs {
  containerRef: HTMLElement;
  pinRef: HTMLElement;
  imgRef: HTMLImageElement;
  inputXRef: HTMLElement;
  inputYRef: HTMLElement;
}

interface PinnerProps {
  clientX: number;
  clientY: number;
  cTop: number;
  cLeft: number;
  cWidth: number;
  cHeight: number;
  diWidth: number;
  diHeight: number;
  nRatio: number;
  cRatio: number;
  x_lb: number;
  x_ub: number;
  y_lb: number;
  y_ub: number;
  cX: number;
  cY: number;
  adjX: number;
  adjY: number;
  diX: number;
  diY: number;
  dropLocation: PinnerDropLocation;
}

type PinnerDropLocation = [number, number];

class Pinner {
  constructor(config: Partial<PinnerConfig>) {
    console.log('Initializing...');
    this.initRefs(config.refs);
    this.initImgSrc(config.imgSrc);
    this.initListeners();
    this.initProps(config.props);
  }
  
  initRefs(refs: Partial<PinnerRefs>) {
    this.containerRef = refs.containerRef;
    this.pinRef = refs.pinRef; //this.containerRef.querySelector("#pin");
    this.imgRef = refs.imgRef; //this.containerRef.querySelector("#img");
    this.inputXRef = refs.inputXRef; //document.querySelector("#inputX");
    this.inputYRef = refs.inputYRef; //document.querySelector("#inputY");
    this.pinItButtonRef = refs.pinItButtonRef;
  }
  
  initImgSrc(src: string) {
    this.imgRef.src = src;
    //this.imgRef.src = "https://storage.googleapis.com/ifca-assets/london.png"; // normal
    //img.src = 'https://storage.googleapis.com/ifca-assets/long.png' // long
    //img.src = 'https://storage.googleapis.com/ifca-assets/tall.png' // tall
  }
  
  initListeners() {
    this.containerRef.addEventListener('click', this.onClick.bind(this));
    this.pinItButtonRef.addEventListener('click', this.pinIt.bind(this));
  }
  
  initProps(props: Partial<PinnerProps>) {
    // read this.onClick for the better explanations behind these props
    
    this.clientX = props.clientX || 0.00; // where the mouse clicks relative to the viewport
    this.clientY = props.clientY || 0.00; // these just need a value to instantiate it as a float for v8 to be more efficient
    
    this.cTop = props.cTop || 0.00; // where the container is relative to the viewport
    this.cLeft = props.cLeft || 0.00;
    this.cWidth = props.cWidth || 0.00;
    this.cHeight = props.cHeight || 0.00;
    
    this.nRatio = props.nRatio || 0.00;
    this.cRatio = props.cRatio || 0.00;
    
    this.diWidth = props.diWidth || 0.00; // di = Displayed Image (pixels as dispayed)
    this.diHeight = props.diHeight || 0.0;
    
    this.x_lb = props.x_lb || 0.0;
    this.x_ub = props.x_ub || 0.0;
    
    this.y_lb = props.y_lb || 0.0;
    this.y_ub = props.y_ub || 0.0;
    
    this.cX = props.cX || 0.00; //clientX - cLeft; // where the pin is relative to its container
    this.cY = props.cY || 0.00; //clientY - cTop; // where the pin is relative to its container
    
    this.adjX = props.adjX || 0.00;
    this.adjY = props.adjY || 0.00;
    
    this.diX = props.diX || 0.00;
    this.diY = props.diY || 0.00;
    
    this.dropLocation = props.dropLocation || [0.00, 0.00];
  }
  
  log() {
    const result = {
      clientX: this.clientX,
      clientY: this.clientY,
      cTop: this.cTop,
      cLeft: this.cLeft,
      cWidth: this.cWidth,
      cHeight: this.cHeight,
      diWidth: this.diWidth,
      diHeight: this.diHeight,
      nRatio: this.nRatio,
      cRatio: this.cRatio,
      x_lb: this.x_lb,
      x_ub: this.x_ub,
      y_lb: this.y_lb,
      y_ub: this.y_ub,
      cX: this.cX,
      cY: this.cY,
      adjX: this.adjX, // adj = adjusted
      adjY: this.adjY,
      diX: this.diX,
      diY: this.diY,
      dropLocation: this.dropLocation,
    };

    console.log(JSON.stringify(result, null, 2));
  }
  
  setPinLocation(dropLocation: PinnerDropLocation) {
    // first we calculate x_lb
    this.adjX = dropLocation[0] + this.x_lb;
    this.adjY = dropLocation[1] + this.y_lb;
    
  }
  
  // this.setPinLocation([0.90, 0.98])
  
  renderPin() {
    this.pinRef.style.left = this.adjX + 'px';
    this.pinRef.style.top = this.adjY + 'px';
  }
  
  pinIt() {
    console.log('pinning...');
    this.adjX = (this.inputXRef.value * this.diWidth) + this.x_lb;
    this.adjY = (this.inputYRef.value * this.diHeight) + this.y_lb;
    this.renderPin();
  }
  
  onClick(e) {
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    
    const {
      top: cTop,
      left: cLeft,
      width: cWidth,
      height: cHeight
    } = this.containerRef.getBoundingClientRect();

    this.cTop = cTop;
    this.cLeft = cLeft;
    this.cWidth = cWidth;
    this.cHeight = cHeight;

    this.cX = this.clientX - cLeft; // where the pin is relative to its container
    this.cY = this.clientY - cTop;

    // gotta calculate x_lb, x_ub
    // but first we have to calculate their ratios

    this.nRatio = this.imgRef.naturalWidth / this.imgRef.naturalHeight;
    this.cRatio = this.cWidth / this.cHeight;

    // depending on nRatio, we have to either match width or height
    // and use ratios to figure out the corresponding height or width
    // if nRatio is < 1, we match width and if nRatio > 1, we match height
    // if nRatio is 1, we can pick any, so we'll pick width.

    if (this.nRatio < 1) {
      // meaning nWidth < nHeight

      this.diHeight = this.cWidth / this.nRatio;
      this.diWidth = this.nRatio * this.diHeight;
    } else {
      //for nWidth > nHeight and nRatio == 1

      this.diWidth = this.nRatio * this.cHeight;
      this.diHeight = this.diWidth / this.nRatio;
    }

    this.x_lb = (this.cWidth - this.diWidth) / 2; // calculating margin
    this.x_ub = this.x_lb + this.diWidth;

    this.y_lb = (this.cHeight - this.diHeight) / 2;
    this.y_ub = this.y_lb + this.diHeight;

    this.adjX = (() => {
      // x_lb = x_lower_bound
      // x_ub = x_upper_bound
      if (this.cX < this.x_lb) return this.x_lb;
      if (this.cX > this.x_ub) return this.x_ub;
      return this.cX;
    })();

    this.adjY = (() => {
      // likewise
      if (this.cY < this.y_lb) return this.y_lb;
      if (this.cY > this.y_ub) return this.y_ub;
      return this.cY;
    })();

    this.renderPin()
    
    this.diX = this.adjX - this.x_lb;
    this.diY = this.adjY - this.y_lb;
    
    this.dropLocation = [this.diX / this.diWidth, this.diY / this.diHeight];

    this.log();
  }

}

window.pinner = new Pinner({
  refs: {
    containerRef: document.querySelector('#container'),
    pinRef: document.querySelector('#pin'),
    imgRef: document.querySelector('#img'),
    inputXRef: document.querySelector('#inputX'),
    inputYRef: document.querySelector('#inputY'),
    pinItButtonRef: document.querySelector('#pinIt'),
  },
  //imgSrc: 'http://www.lonelyplanet.com/maps/north-america/usa/new-york-city/map_of_new-york-city.jpg',
  imgSrc: 'https://storage.googleapis.com/ifca-assets/london.png', // normal
  //imgSrc: 'https://storage.googleapis.com/ifca-assets/long.png', // long
  //imgSrc: 'https://storage.googleapis.com/ifca-assets/tall.png', // tall
  props: {}
});

console.log(window)