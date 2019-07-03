
/**
 * Copyright © 2017 Tino Reichardt (milky at Open-Digital-Signage dot org)
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License Version 2, as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * Based on code by Jean-François Hovinne, http://hovinne.com/
 * Homepage: https://github.com/mcmilk/jquery.getFeed/
 */

jQuery.getFeed = function(options) {
  options = jQuery.extend({
    url: null,
    data: null,
    cache: false,
    success: null,
    global: true
  }, options);

  if (options.url) {
    return $.ajax({
      type: 'GET',
      url: options.url,
      data: options.data,
      cache: options.cache,
      dataType: "xml",
      success: function (xml) {
        var feed = new JFeed(xml);
        if (jQuery.isFunction(options.success)) options.success(feed);
      },
      global: options.global
    });
  }
};

function JFeed(xml) {
  if (xml) this.parse(xml);
};

JFeed.prototype = {
  type: '',
  version: '',
  title: '',
  description: '',
  parse: function (xml) {
    if (jQuery('channel', xml).length == 1) {
      this.type = 'rss';
      var feedClass = new JRss(xml);
    } else if (jQuery('feed', xml).length == 1) {
      this.type = 'atom';
      var feedClass = new JAtom(xml);
    }
    if (feedClass) jQuery.extend(this, feedClass);
  }
};

function JFeedItem() {};

JFeedItem.prototype = {
    title: '',
    description: ''
};

function JAtom(xml) {
  this._parse(xml);
};

JAtom.prototype = {

  _parse: function (xml) {

    var channel = jQuery('feed', xml).eq(0);

    this.version = '1.0';
    this.title = jQuery(channel).find('title:first').text();
    this.description = jQuery(channel).find('subtitle:first').text();

    this.items = new Array();
    var feed = this;
    jQuery('entry', xml).each(function () {
      var item = new JFeedItem();
      item.title = jQuery(this).find('title').eq(0).text();
      item.description = jQuery(this).find('content').eq(0).html();
      if (item.description === undefined) {
        item.description = jQuery(this).find('summary').eq(0).text();
      }
      feed.items.push(item);
    });
  }
};

function JRss(xml) {
  this._parse(xml);
};

JRss.prototype = {
  _parse: function (xml) {
    if (jQuery('rss', xml).length == 0) this.version = '1.0';
    else this.version = jQuery('rss', xml).eq(0).attr('version');

    var channel = jQuery('channel', xml).eq(0);
    this.title = jQuery(channel).find('title:first').text();
    this.description = jQuery(channel).find('description:first').text();

    this.items = new Array();
    var feed = this;

    jQuery('item', xml).each(function () {
      var item = new JFeedItem();
      item._element = this;
      item.title = $('<div/>').html(jQuery(this).find('title').eq(0).text()).text();
      item.description = $('<div/>').html(jQuery(this).find('description').eq(0).text()).text();
      feed.items.push(item);
    });
  }
};
