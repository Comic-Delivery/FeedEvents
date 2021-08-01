import Parser from "rss-parser";
import Cron from "cron-converter";
import EventEmitter from "events"

exports  = FeedEvents;
declare function FeedEvents(URL: string, configuration:FeedEvents.Configuration, latest?:Parser.Item):Promise<FeedEvents.FeedHandler>;

declare namespace FeedEvents {
    class FeedHandler extends EventEmitter {
        parser:Parser;
        URL:string;
        schedule:Cron.Seeker;
        latest:Parser.Item;
        constructor(parser:Parser, URL:string, schedule:Cron.Seeker, latest:Parser.Item)
        fetchFeed():Promise<void>;
        start():Promise<void>;
        stop():void;
        loop():Promise<void>;
        next():Number;
    }
    
    interface Configuration extends Parser.ParserOptions<string, string> {
        schedule: string
    }
}

