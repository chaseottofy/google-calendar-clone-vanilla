class CatFormHelper {
  constructor(catname, catcolor) {
    this.catname = catname;
    this.catcolor = catcolor;
    this.errMsg = '';
    this.prevColorIdx = catcolor;
    this.originalName = catname;
    this.originalColor = catcolor;
  }

  setName(name) { this.catname = name; }

  setColor(color) { this.catcolor = color; }

  setPrevColor(color) { this.prevColorIdx = color; }

  getName() { return this.catname; }

  getColor() { return this.catcolor; }

  prevColor() { return this.prevColorIdx; }

  setErrMsg(msg) { this.errMsg = msg; }

  getErrMsg() { return this.errMsg; }

  getOriginalName() { return this.originalName; }

  getOriginalColor() { return this.originalColor; }
}

export default CatFormHelper;
