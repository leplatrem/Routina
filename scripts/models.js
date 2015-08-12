import moment from "moment";


export class Routine {

  /**
   * A periodic task that is automatically rescheduled
   * when checked.
   * @param  {String} label  The task label.
   * @return {Object} period An object with two properties
                             ``value`` and ``unit``.
   */
  constructor (label, period) {
    this.label = label;
    this.period = period;
    this.occurences = [];
  }

  /**
   * Status constants.
   */
  static get status() {
    return {
      OK: "ok",
      WARNING: "warning",
      OVERDUE: "overdue",
      CRITICAL: "critical",
    };
  }

  /**
   * Period unit constants.
   */
  static get units() {
    return ["seconds", "minutes", "hours", "days", "months", "years"];
  }

  /**
   * Serialize object with occurences as ISO strings.
   * @return {Object} flat mapping.
   */
  serialize() {
    const serialized = Object.assign({}, this);
    serialized.occurences = serialized.occurences.map(d => d.toISOString());
    return serialized;
  }

  /**
   * Deserialize mapping into a Routine object.
   * @param  {Object} flat mapping.
   * @return {Routine} instantiated object.
   */
  static deserialize(serialized) {
    const routine = new Routine();
    Object.assign(routine, serialized);
    routine.occurences = routine.occurences.map(d => new Date(d));
    return routine;
  }

  get _period () {
    return moment.duration(this.period.value, this.period.unit);
  }

  /**
   * Returns the current status, critical for largely missed
   * occurence, warning if close, ok if far.
   */
  get status() {
    let period = this._period.as('seconds');
    let threshold = period * 0.1;

    if (this.timeleft < -period) {
      return Routine.status.CRITICAL;
    }
    if (this.timeleft < -threshold) {
      return Routine.status.OVERDUE;
    }
    if (this.timeleft < threshold) {
      return Routine.status.WARNING;
    }
    return Routine.status.OK;
  }

  /**
   * Returns the number of seconds since last occurence.
   * @return {Integer}
   */
  get elapsed () {
    return moment()
      .diff(moment(this.last), 'seconds');
  }

  /**
   * Returns the number of seconds until next occurence.
   * @return {Integer}
   */
  get timeleft () {
    return moment(this.next)
      .diff(moment(), 'seconds');
  }

  /**
   * Returns the last occurence.
   * @return {Date}
   */
  get last() {
    return this.occurences[this.occurences.length - 1];
  }

  /**
   * Returns the next occurence.
   * @return {Date}
   */
  get next() {
    return moment(this.last)
      .add(this._period)
      .toDate();
  }

  /**
   * Mark the routine as done, and reschedule the next one.
   */
  check() {
    this.occurences.push(new Date());
  }
}
