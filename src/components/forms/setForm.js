export default class FormSetup {
  constructor() {
    this.submission;
    this.category;
    this.position;
    this.dates;
  }

  /**
   * 
   * @param {string} type ("edit" / "create")
   * @param {string} id (entry ID || null)
   * @param {string} title || null
   * @param {string} description || nulll
   */
  setSubmission(type, id, title, description) {
    this.submission = {
      type: type,
      id: id || null,
      title: title || null,
      description: description || null,
    }
    console.log(this.submission)
  }

  /**
   * 
   * @param {string} name (store category name)
   * @param {string} color (store category color)
   * @param {string} offsetColor (category color rgba 0.5)
   */
  setCategory(name, color, offsetColor) {
    this.category = {
      name: name,
      color: color,
      offsetColor: offsetColor,
    }
  }

  /**
   * 
   * @param {number} cell 
   * @param {[number, number]} coordinates (x, y) of grid
   * @param {number} offsetTop (e.pageY - scrollTop of grid)
   */
  setPosition(cell, coordinates, offsetTop) {
    this.position = {
      cell: cell,
      coordinates: coordinates,
      offsetTop: offsetTop,
    }
  }

  /**
   * 
   * @param {object} 
   * : {Dates: [new Date(start), new Date(end)]}
   * : {Dates: [start("YYYY-MM-DD"), end("YYYY-MM-DD")]}
   * : {Minutes: [number, number]}
   */
  setDates(object) {
    this.dates = { object: object }
  }

  getSetup() {
    return {
      submission: this.submission,
      category: this.category,
      position: this.position,
      dates: this.dates,
    }
  }
}