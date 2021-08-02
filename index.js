const EventEmitter = require('events');
const RSSParser = require('rss-parser');
const Cron = require('cron-converter');

class FeedHandler extends EventEmitter {
  constructor(parser, URL, scheduler, latest = {}) {
    super();
    this.parser = parser;
    this.URL = URL;
    this.scheduler = scheduler;
    this.latest = latest;
  }

  async fetchFeed() {
    let feed = await this.parser.parseURL(this.URL);
    this.emit("feed", feed);
    let recentItems = [];
    for (let item of feed.items) {
      if (item.title == this.latest.title) break;
      recentItems.unshift(item);
    }
    
    this.latest = feed.items[0];
    for (let item of recentItems) {
      this.emit("item", item)
    }
  }

  start() {
    return this.loop();
  }

  stop() {
    clearTimeout(this.timeout);
  }

  async loop() {
    this.fetchFeed().then(() => {
      this.timeout = setTimeout(this.loop.bind(this), this.next());
    });
  }

  /**
   * @returns {Number} Millisecond til next fetch
   */
  next() {
    let now = new Date();
    return this.scheduler.schedule(now).next().diff(now);
  }
}

/**
 * Create a FeedHandler instance
 * @param {string} URL 
 * @param {Object} configuration 
 * @param {Object} latest 
 * @returns {Promise<FeedHandler>}
 */
async function FeedEvents(URL, schedule, configuration, latest) {
  let parser = new RSSParser(configuration);
  
  // Test URL
  await (new RSSParser({ timeout: 1000 })).parseURL(URL);

  let scheduler = (new Cron()).fromString(schedule);
  return new FeedHandler(parser, URL, scheduler, latest);
}

module.exports = { FeedEvents }