export default class FormSetup {
  constructor() {
    this.submission = {};
    this.category = {};
    this.dates = {};
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
    };
  }

  /**
   *
   * @param {string} name (store category name)
   * @param {string} color (store category color)
   * @param {string} offsetColor (category color rgba 0.5)
   */
  setCategory(name, color) {
    this.category = {
      name: name,
      color: color,
    };
  }

  /**
   *
   * @param {object}
   * : {Dates: [new Date(start), new Date(end)]}
   * : {Dates: [start("YYYY-MM-DD"), end("YYYY-MM-DD")]}
   * : {Minutes: [number, number]}
   */
  setDates(object) {
    this.dates = { object: object };
  }

  getSetup() {
    return {
      submission: this.submission,
      category: this.category,
      dates: this.dates,
    };
  }
}
