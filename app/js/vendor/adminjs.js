(function(globals) {
//fgnass.github.com/spin.js#v1.3

/**
 * Copyright (c) 2011-2013 Felix Gnass
 * Licensed under the MIT license
 */
(function(root, factory) {

  /* CommonJS */
  if (typeof exports == 'object')  module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define(factory)

  /* Browser global */
  else root.Spinner = factory()
}
(this, function() {
  "use strict";

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for(n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++)
      parent.appendChild(arguments[i])

    return parent
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = (function() {
    var el = createEl('style', {type : 'text/css'})
    ins(document.getElementsByTagName('head')[0], el)
    return el.sheet || el.styleSheet
  }())

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor(el, prop) {
    var s = el.style
      , pp
      , i

    if(s[prop] !== undefined) return prop
    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop
      if(s[pp] !== undefined) return pp
    }
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop)
      el.style[vendor(el, n)||n] = prop[n]

    return el
  }

  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i=1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def)
        if (obj[n] === undefined) obj[n] = def[n]
    }
    return obj
  }

  /**
   * Returns the absolute page-offset of the given element.
   */
  function pos(el) {
    var o = { x:el.offsetLeft, y:el.offsetTop }
    while((el = el.offsetParent))
      o.x+=el.offsetLeft, o.y+=el.offsetTop

    return o
  }

  // Built-in defaults

  var defaults = {
    lines: 12,            // The number of lines to draw
    length: 7,            // The length of each line
    width: 5,             // The line thickness
    radius: 10,           // The radius of the inner circle
    rotate: 0,            // Rotation offset
    corners: 1,           // Roundness (0..1)
    color: '#000',        // #rgb or #rrggbb
    direction: 1,         // 1: clockwise, -1: counterclockwise
    speed: 1,             // Rounds per second
    trail: 100,           // Afterglow percentage
    opacity: 1/4,         // Opacity of the lines
    fps: 20,              // Frames per second when using setTimeout()
    zIndex: 2e9,          // Use a high z-index by default
    className: 'spinner', // CSS class to assign to the element
    top: 'auto',          // center vertically
    left: 'auto',         // center horizontally
    position: 'relative'  // element position
  }

  /** The constructor */
  function Spinner(o) {
    if (typeof this == 'undefined') return new Spinner(o)
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {

    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function(target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})
        , mid = o.radius+o.length+o.width
        , ep // element position
        , tp // target position

      if (target) {
        target.insertBefore(el, target.firstChild||null)
        tp = pos(target)
        ep = pos(el)
        css(el, {
          left: (o.left == 'auto' ? tp.x-ep.x + (target.offsetWidth >> 1) : parseInt(o.left, 10) + mid) + 'px',
          top: (o.top == 'auto' ? tp.y-ep.y + (target.offsetHeight >> 1) : parseInt(o.top, 10) + mid)  + 'px'
        })
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps/o.speed
          , ostep = (1-o.opacity) / (f*o.trail / 100)
          , astep = f/o.lines

        ;(function anim() {
          i++;
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000/fps))
        })()
      }
      return self
    },

    /**
     * Stops and removes the Spinner.
     */
    stop: function() {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    },

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
    lines: function(el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: (o.length+o.width) + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
          borderRadius: (o.corners * o.width>>1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1+~(o.width/2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}))

        ins(el, ins(seg, fill(o.color, '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    },

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
    opacity: function(el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML() {

    /* Utility function to create a VML tag */
    function vml(tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function(el, o) {
      var r = o.length+o.width
        , s = 2*r

      function grp() {
        return css(
          vml('group', {
            coordsize: s + ' ' + s,
            coordorigin: -r + ' ' + -r
          }),
          { width: s, height: s }
        )
      }

      var margin = -(o.width+o.length)*2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg(i, dx, filter) {
        ins(g,
          ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
            ins(css(vml('roundrect', {arcsize: o.corners}), {
                width: r,
                height: o.width,
                left: o.radius,
                top: -o.width>>1,
                filter: filter
              }),
              vml('fill', {color: o.color, opacity: o.opacity}),
              vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++)
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function(el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i+o < c.childNodes.length) {
        c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

  if (!vendor(probe, 'transform') && probe.adj) initVML()
  else useCssAnimations = vendor(probe, 'animation')

  return Spinner

}));

var define, requireModule;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requireModule = function(name) {
    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    var mod = registry[name];

    if (!mod) {
      throw new Error("Module: '" + name + "' not found.");
    }

    var deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(deps[i]));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;
  };

  define.registry = registry;
  define.seen = seen;
})();

define("resolver",
  [],
  function() {
    "use strict";
  /*
   * This module defines a subclass of Ember.DefaultResolver that adds two
   * important features:
   *
   *  1) The resolver makes the container aware of es6 modules via the AMD
   *     output. The loader's registry is consulted so that classes can be 
   *     resolved directly via the module loader, without needing a manual
   *     `import`.
   *  2) is able provide injections to classes that implement `extend`
   *     (as is typical with Ember).
   */

  function classFactory(klass) {
    return {
      create: function (injections) {
        if (typeof klass.extend === 'function') {
          return klass.extend(injections);  
        } else {
          return klass;
        }
      }
    };
  }

  var underscore = Ember.String.underscore;

  function resolveOther(parsedName) {
    var prefix = this.namespace.modulePrefix;
    Ember.assert('module prefix must be defined', prefix);

    var pluralizedType = parsedName.type + 's';
    var name = parsedName.fullNameWithoutType;

    var moduleName = prefix + '/' +  pluralizedType + '/' + underscore(name);
    var module;

    if (define.registry[moduleName]) {
      module = requireModule(moduleName);

      if (typeof module.create !== 'function') {
        module = classFactory(module);
      }

      if (Ember.ENV.LOG_MODULE_RESOLVER){
        Ember.logger.info('hit', moduleName);
      }

      return module;
    } else  {
      if (Ember.ENV.LOG_MODULE_RESOLVER){
        Ember.logger.info('miss', moduleName);
      }

      return this._super(parsedName);
    }
  }

  // Ember.DefaultResolver docs:
  //   https://github.com/emberjs/ember.js/blob/master/packages/ember-application/lib/system/resolver.js
  var Resolver = Ember.DefaultResolver.extend({
    resolveOther: resolveOther
  });

  return Resolver;
});

// moment.js
// version : 2.1.0
// author : Tim Wood
// license : MIT
// momentjs.com

(function (undefined) {

    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = "2.1.0",
        round = Math.round, i,
        // internal storage for language config files
        languages = {},

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(\d*)?\.?(\d+)\:(\d+)\:(\d+)\.?(\d{3})?/,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/i, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO seperator)
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

        // preliminary iso regex
        // 0000-00-00 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000
        isoRegex = /^\s*\d{4}-\d\d-\d\d((T| )(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,
        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.S', /(T| )\d\d:\d\d:\d\d\.\d{1,3}/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

        // timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        unitAliases = {
            ms : 'millisecond',
            s : 'second',
            m : 'minute',
            h : 'hour',
            d : 'day',
            w : 'week',
            M : 'month',
            y : 'year'
        },

        // format function strings
        formatFunctions = {},

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.lang().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.lang().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.lang().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.lang().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.lang().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            gg   : function () {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg : function () {
                return this.weekYear();
            },
            ggggg : function () {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG   : function () {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG : function () {
                return this.isoWeekYear();
            },
            GGGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e : function () {
                return this.weekday();
            },
            E : function () {
                return this.isoWeekday();
            },
            a    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return ~~(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(~~(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(~~(a / 60), 2) + ":" + leftZeroFill(~~a % 60, 2);
            },
            ZZ   : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(~~(10 * a / 6), 4);
            },
            z : function () {
                return this.zoneAbbr();
            },
            zz : function () {
                return this.zoneName();
            },
            X    : function () {
                return this.unix();
            }
        };

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function (a) {
            return this.lang().ordinal(func.call(this, a), period);
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
        Constructors
    ************************************/

    function Language() {

    }

    // Moment prototype object
    function Moment(config) {
        extend(this, config);
    }

    // Duration Constructor
    function Duration(duration) {
        var years = duration.years || duration.year || duration.y || 0,
            months = duration.months || duration.month || duration.M || 0,
            weeks = duration.weeks || duration.week || duration.w || 0,
            days = duration.days || duration.day || duration.d || 0,
            hours = duration.hours || duration.hour || duration.h || 0,
            minutes = duration.minutes || duration.minute || duration.m || 0,
            seconds = duration.seconds || duration.second || duration.s || 0,
            milliseconds = duration.milliseconds || duration.millisecond || duration.ms || 0;

        // store reference to input for deterministic cloning
        this._input = duration;

        // representation for dateAddRemove
        this._milliseconds = milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = months +
            years * 12;

        this._data = {};

        this._bubble();
    }


    /************************************
        Helpers
    ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (b.hasOwnProperty(i)) {
                a[i] = b[i];
            }
        }
        return a;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength) {
        var output = number + '';
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return output;
    }

    // helper function for _.addTime and _.subtractTime
    function addOrSubtractDurationFromMoment(mom, duration, isAdding, ignoreUpdateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months,
            minutes,
            hours,
            currentDate;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        // store the minutes and hours so we can restore them
        if (days || months) {
            minutes = mom.minute();
            hours = mom.hour();
        }
        if (days) {
            mom.date(mom.date() + days * isAdding);
        }
        if (months) {
            mom.month(mom.month() + months * isAdding);
        }
        if (milliseconds && !ignoreUpdateOffset) {
            moment.updateOffset(mom);
        }
        // restore the minutes and hours after possibly changing dst
        if (days || months) {
            mom.minute(minutes);
            mom.hour(hours);
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if (~~array1[i] !== ~~array2[i]) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function normalizeUnits(units) {
        return units ? unitAliases[units] || units.toLowerCase().replace(/(.)s$/, '$1') : units;
    }


    /************************************
        Languages
    ************************************/


    Language.prototype = {
        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        },

        _months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                if (!this._monthsParse[i]) {
                    mom = moment([2000, i]);
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        weekdaysParse : function (weekdayName) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                if (!this._weekdaysParse[i]) {
                    mom = moment([2000, 1]).day(i);
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },

        _longDateFormat : {
            LT : "h:mm A",
            L : "MM/DD/YYYY",
            LL : "MMMM D YYYY",
            LLL : "MMMM D YYYY LT",
            LLLL : "dddd, MMMM D YYYY LT"
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        isPM : function (input) {
            return ((input + '').toLowerCase()[0] === 'p');
        },

        _meridiemParse : /[ap]\.?m?\.?/i,
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },

        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom) : output;
        },

        _relativeTime : {
            future : "in %s",
            past : "%s ago",
            s : "a few seconds",
            m : "a minute",
            mm : "%d minutes",
            h : "an hour",
            hh : "%d hours",
            d : "a day",
            dd : "%d days",
            M : "a month",
            MM : "%d months",
            y : "a year",
            yy : "%d years"
        },
        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },
        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace("%d", number);
        },
        _ordinal : "%d",

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },
        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    };

    // Loads a language definition into the `languages` cache.  The function
    // takes a key and optionally values.  If not in the browser and no values
    // are provided, it will load the language file module.  As a convenience,
    // this function also returns the language values.
    function loadLang(key, values) {
        values.abbr = key;
        if (!languages[key]) {
            languages[key] = new Language();
        }
        languages[key].set(values);
        return languages[key];
    }

    // Determines which language definition to use and returns it.
    //
    // With no parameters, it will return the global language.  If you
    // pass in a language key, such as 'en', it will return the
    // definition for 'en', so long as 'en' has already been loaded using
    // moment.lang.
    function getLangDefinition(key) {
        if (!key) {
            return moment.fn._lang;
        }
        if (!languages[key] && hasModule) {
            try {
                require('./lang/' + key);
            } catch (e) {
                // call with no params to set to default
                return moment.fn._lang;
            }
        }
        return languages[key];
    }


    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[.*\]/)) {
            return input.replace(/^\[|\]$/g, "");
        }
        return input.replace(/\\/g, "");
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = "";
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return m.lang().longDateFormat(input) || input;
        }

        while (i-- && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
        }

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token, config) {
        switch (token) {
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
            return parseTokenFourDigits;
        case 'YYYYY':
            return parseTokenSixDigits;
        case 'S':
        case 'SS':
        case 'SSS':
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
            return parseTokenWord;
        case 'a':
        case 'A':
            return getLangDefinition(config._l)._meridiemParse;
        case 'X':
            return parseTokenTimestampMs;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
            return parseTokenOneOrTwoDigits;
        default :
            return new RegExp(token.replace('\\', ''));
        }
    }

    function timezoneMinutesFromString(string) {
        var tzchunk = (parseTokenTimezone.exec(string) || [])[0],
            parts = (tzchunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + ~~parts[2];

        return parts[0] === '+' ? -minutes : minutes;
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;

        switch (token) {
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            datePartArray[1] = (input == null) ? 0 : ~~input - 1;
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            a = getLangDefinition(config._l).monthsParse(input);
            // if we didn't find a month name, mark the date as invalid.
            if (a != null) {
                datePartArray[1] = a;
            } else {
                config._isValid = false;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DDDD
        case 'DD' : // fall through to DDDD
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                datePartArray[2] = ~~input;
            }
            break;
        // YEAR
        case 'YY' :
            datePartArray[0] = ~~input + (~~input > 68 ? 1900 : 2000);
            break;
        case 'YYYY' :
        case 'YYYYY' :
            datePartArray[0] = ~~input;
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config._isPm = getLangDefinition(config._l).isPM(input);
            break;
        // 24 HOUR
        case 'H' : // fall through to hh
        case 'HH' : // fall through to hh
        case 'h' : // fall through to hh
        case 'hh' :
            datePartArray[3] = ~~input;
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[4] = ~~input;
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[5] = ~~input;
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
            datePartArray[6] = ~~ (('0.' + input) * 1000);
            break;
        // UNIX TIMESTAMP WITH MS
        case 'X':
            config._d = new Date(parseFloat(input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config._useUTC = true;
            config._tzm = timezoneMinutesFromString(input);
            break;
        }

        // if the input is null, the date is not valid
        if (input == null) {
            config._isValid = false;
        }
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromArray(config) {
        var i, date, input = [];

        if (config._d) {
            return;
        }

        for (i = 0; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // add the offsets to the time to be parsed so that we can have a clean array for checking isValid
        input[3] += ~~((config._tzm || 0) / 60);
        input[4] += ~~((config._tzm || 0) % 60);

        date = new Date(0);

        if (config._useUTC) {
            date.setUTCFullYear(input[0], input[1], input[2]);
            date.setUTCHours(input[3], input[4], input[5], input[6]);
        } else {
            date.setFullYear(input[0], input[1], input[2]);
            date.setHours(input[3], input[4], input[5], input[6]);
        }

        config._d = date;
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {
        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var tokens = config._f.match(formattingTokens),
            string = config._i,
            i, parsedInput;

        config._a = [];

        for (i = 0; i < tokens.length; i++) {
            parsedInput = (getParseRegexForToken(tokens[i], config).exec(string) || [])[0];
            if (parsedInput) {
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
            }
            // don't parse if its not a known token
            if (formatTokenFunctions[tokens[i]]) {
                addTimeToArrayFromToken(tokens[i], parsedInput, config);
            }
        }

        // add remaining unparsed input to the string
        if (string) {
            config._il = string;
        }

        // handle am pm
        if (config._isPm && config._a[3] < 12) {
            config._a[3] += 12;
        }
        // if is 12 am, change hours to 0
        if (config._isPm === false && config._a[3] === 12) {
            config._a[3] = 0;
        }
        // return
        dateFromArray(config);
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            tempMoment,
            bestMoment,

            scoreToBeat = 99,
            i,
            currentScore;

        for (i = 0; i < config._f.length; i++) {
            tempConfig = extend({}, config);
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);
            tempMoment = new Moment(tempConfig);

            currentScore = compareArrays(tempConfig._a, tempMoment.toArray());

            // if there is any input that was not parsed
            // add a penalty for that format
            if (tempMoment._il) {
                currentScore += tempMoment._il.length;
            }

            if (currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempMoment;
            }
        }

        extend(config, bestMoment);
    }

    // date from iso format
    function makeDateFromString(config) {
        var i,
            string = config._i,
            match = isoRegex.exec(string);

        if (match) {
            // match[2] should be "T" or undefined
            config._f = 'YYYY-MM-DD' + (match[2] || " ");
            for (i = 0; i < 4; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (parseTokenTimezone.exec(string)) {
                config._f += " Z";
            }
            makeDateFromStringAndFormat(config);
        } else {
            config._d = new Date(string);
        }
    }

    function makeDateFromInput(config) {
        var input = config._i,
            matched = aspNetJsonRegex.exec(input);

        if (input === undefined) {
            config._d = new Date();
        } else if (matched) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = input.slice(0);
            dateFromArray(config);
        } else {
            config._d = input instanceof Date ? new Date(+input) : new Date(input);
        }
    }


    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1000),
            minutes = round(seconds / 60),
            hours = round(minutes / 60),
            days = round(hours / 24),
            years = round(days / 365),
            args = seconds < 45 && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < 45 && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < 22 && ['hh', hours] ||
                days === 1 && ['d'] ||
                days <= 25 && ['dd', days] ||
                days <= 45 && ['M'] ||
                days < 345 && ['MM', round(days / 30)] ||
                years === 1 && ['y'] || ['yy', years];
        args[2] = withoutSuffix;
        args[3] = milliseconds > 0;
        args[4] = lang;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Week of Year
    ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = moment(mom).add('d', daysToDayOfWeek);
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }


    /************************************
        Top Level Functions
    ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f;

        if (input === null || input === '') {
            return null;
        }

        if (typeof input === 'string') {
            config._i = input = getLangDefinition().preparse(input);
        }

        if (moment.isMoment(input)) {
            config = extend({}, input);
            config._d = new Date(+input._d);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        return new Moment(config);
    }

    moment = function (input, format, lang) {
        return makeMoment({
            _i : input,
            _f : format,
            _l : lang,
            _isUTC : false
        });
    };

    // creating with utc
    moment.utc = function (input, format, lang) {
        return makeMoment({
            _useUTC : true,
            _isUTC : true,
            _l : lang,
            _i : input,
            _f : format
        });
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var isDuration = moment.isDuration(input),
            isNumber = (typeof input === 'number'),
            duration = (isDuration ? input._input : (isNumber ? {} : input)),
            matched = aspNetTimeSpanJsonRegex.exec(input),
            sign,
            ret;

        if (isNumber) {
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (matched) {
            sign = (matched[1] === "-") ? -1 : 1;
            duration = {
                y: 0,
                d: ~~matched[2] * sign,
                h: ~~matched[3] * sign,
                m: ~~matched[4] * sign,
                s: ~~matched[5] * sign,
                ms: ~~matched[6] * sign
            };
        }

        ret = new Duration(duration);

        if (isDuration && input.hasOwnProperty('_lang')) {
            ret._lang = input._lang;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    moment.updateOffset = function () {};

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    moment.lang = function (key, values) {
        if (!key) {
            return moment.fn._lang._abbr;
        }
        if (values) {
            loadLang(key, values);
        } else if (!languages[key]) {
            getLangDefinition(key);
        }
        moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
    };

    // returns language data
    moment.langData = function (key) {
        if (key && key._lang && key._lang._abbr) {
            key = key._lang._abbr;
        }
        return getLangDefinition(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment;
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };


    /************************************
        Moment Prototype
    ************************************/


    moment.fn = Moment.prototype = {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d + ((this._offset || 0) * 60000);
        },

        unix : function () {
            return Math.floor(+this / 1000);
        },

        toString : function () {
            return this.format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        },

        toDate : function () {
            return this._offset ? new Date(+this) : this._d;
        },

        toISOString : function () {
            return formatMoment(moment(this).utc(), 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            if (this._isValid == null) {
                if (this._a) {
                    this._isValid = !compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray());
                } else {
                    this._isValid = !isNaN(this._d.getTime());
                }
            }
            return !!this._isValid;
        },

        utc : function () {
            return this.zone(0);
        },

        local : function () {
            this.zone(0);
            this._isUTC = false;
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.lang().postformat(output);
        },

        add : function (input, val) {
            var dur;
            // switch args to support add('s', 1) and add(1, 's')
            if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, 1);
            return this;
        },

        subtract : function (input, val) {
            var dur;
            // switch args to support subtract('s', 1) and subtract(1, 's')
            if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, -1);
            return this;
        },

        diff : function (input, units, asFloat) {
            var that = this._isUTC ? moment(input).zone(this._offset || 0) : moment(input).local(),
                zoneDiff = (this.zone() - that.zone()) * 6e4,
                diff, output;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month') {
                // average number of days in the months in the given dates
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
                // difference in months
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                // adjust by taking difference in days, average number of days
                // and dst in the given months.
                output += ((this - moment(this).startOf('month')) -
                        (that - moment(that).startOf('month'))) / diff;
                // same as above but with zones, to negate all dst
                output -= ((this.zone() - moment(this).startOf('month').zone()) -
                        (that.zone() - moment(that).startOf('month').zone())) * 6e4 / diff;
                if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = (this - that);
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function () {
            var diff = this.diff(moment().startOf('day'), 'days', true),
                format = diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.lang().calendar(format, this));
        },

        isLeapYear : function () {
            var year = this.year();
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        },

        isDST : function () {
            return (this.zone() < this.clone().month(0).zone() ||
                this.zone() < this.clone().month(5).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                if (typeof input === 'string') {
                    input = this.lang().weekdaysParse(input);
                    if (typeof input !== 'number') {
                        return this;
                    }
                }
                return this.add({ d : input - day });
            } else {
                return day;
            }
        },

        month : function (input) {
            var utc = this._isUTC ? 'UTC' : '',
                dayOfMonth,
                daysInMonth;

            if (input != null) {
                if (typeof input === 'string') {
                    input = this.lang().monthsParse(input);
                    if (typeof input !== 'number') {
                        return this;
                    }
                }

                dayOfMonth = this.date();
                this.date(1);
                this._d['set' + utc + 'Month'](input);
                this.date(Math.min(dayOfMonth, this.daysInMonth()));

                moment.updateOffset(this);
                return this;
            } else {
                return this._d['get' + utc + 'Month']();
            }
        },

        startOf: function (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            }

            return this;
        },

        endOf: function (units) {
            return this.startOf(units).add(units, 1).subtract('ms', 1);
        },

        isAfter: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) > +moment(input).startOf(units);
        },

        isBefore: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) < +moment(input).startOf(units);
        },

        isSame: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) === +moment(input).startOf(units);
        },

        min: function (other) {
            other = moment.apply(null, arguments);
            return other < this ? this : other;
        },

        max: function (other) {
            other = moment.apply(null, arguments);
            return other > this ? this : other;
        },

        zone : function (input) {
            var offset = this._offset || 0;
            if (input != null) {
                if (typeof input === "string") {
                    input = timezoneMinutesFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                this._offset = input;
                this._isUTC = true;
                if (offset !== input) {
                    addOrSubtractDurationFromMoment(this, moment.duration(offset - input, 'm'), 1, true);
                }
            } else {
                return this._isUTC ? offset : this._d.getTimezoneOffset();
            }
            return this;
        },

        zoneAbbr : function () {
            return this._isUTC ? "UTC" : "";
        },

        zoneName : function () {
            return this._isUTC ? "Coordinated Universal Time" : "";
        },

        daysInMonth : function () {
            return moment.utc([this.year(), this.month() + 1, 0]).date();
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add("d", (input - dayOfYear));
        },

        weekYear : function (input) {
            var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
            return input == null ? year : this.add("y", (input - year));
        },

        isoWeekYear : function (input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add("y", (input - year));
        },

        week : function (input) {
            var week = this.lang().week(this);
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        weekday : function (input) {
            var weekday = (this._d.getDay() + 7 - this.lang()._week.dow) % 7;
            return input == null ? weekday : this.add("d", input - weekday);
        },

        isoWeekday : function (input) {
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },

        // If passed a language key, it will set the language for this
        // instance.  Otherwise, it will return the language configuration
        // variables for this instance.
        lang : function (key) {
            if (key === undefined) {
                return this._lang;
            } else {
                this._lang = getLangDefinition(key);
                return this;
            }
        }
    };

    // helper for adding shortcuts
    function makeGetterAndSetter(name, key) {
        moment.fn[name] = moment.fn[name + 's'] = function (input) {
            var utc = this._isUTC ? 'UTC' : '';
            if (input != null) {
                this._d['set' + utc + key](input);
                moment.updateOffset(this);
                return this;
            } else {
                return this._d['get' + utc + key]();
            }
        };
    }

    // loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)
    for (i = 0; i < proxyGettersAndSetters.length; i ++) {
        makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i]);
    }

    // add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')
    makeGetterAndSetter('year', 'FullYear');

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;

    // add aliased format methods
    moment.fn.toJSON = moment.fn.toISOString;

    /************************************
        Duration Prototype
    ************************************/


    moment.duration.fn = Duration.prototype = {
        _bubble : function () {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds, minutes, hours, years;

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;

            hours = absRound(minutes / 60);
            data.hours = hours % 24;

            days += absRound(hours / 24);
            data.days = days % 30;

            months += absRound(days / 30);
            data.months = months % 12;

            years = absRound(months / 12);
            data.years = years;
        },

        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              (this._months % 12) * 2592e6 +
              ~~(this._months / 12) * 31536e6;
        },

        humanize : function (withSuffix) {
            var difference = +this,
                output = relativeTime(difference, !withSuffix, this.lang());

            if (withSuffix) {
                output = this.lang().pastFuture(difference, output);
            }

            return this.lang().postformat(output);
        },

        add : function (input, val) {
            // supports only 2.0-style add(1, 's') or add(moment)
            var dur = moment.duration(input, val);

            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;

            this._bubble();

            return this;
        },

        subtract : function (input, val) {
            var dur = moment.duration(input, val);

            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;

            this._bubble();

            return this;
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + 's']();
        },

        as : function (units) {
            units = normalizeUnits(units);
            return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']();
        },

        lang : moment.fn.lang
    };

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    function makeDurationAsGetter(name, factor) {
        moment.duration.fn['as' + name] = function () {
            return +this / factor;
        };
    }

    for (i in unitMillisecondFactors) {
        if (unitMillisecondFactors.hasOwnProperty(i)) {
            makeDurationAsGetter(i, unitMillisecondFactors[i]);
            makeDurationGetter(i.toLowerCase());
        }
    }

    makeDurationAsGetter('Weeks', 6048e5);
    moment.duration.fn.asMonths = function () {
        return (+this - this.years() * 31536e6) / 2592e6 + this.years() * 12;
    };


    /************************************
        Default Lang
    ************************************/


    // Set default language, other languages will inherit from English.
    moment.lang('en', {
        ordinal : function (number) {
            var b = number % 10,
                output = (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });


    /************************************
        Exposing Moment
    ************************************/


    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    }
    /*global ender:false */
    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `moment` as a global object via a string identifier,
        // for Closure Compiler "advanced" mode
        this['moment'] = moment;
    }
    /*global define:false */
    if (typeof define === "function" && define.amd) {
        define("moment", [], function () {
            return moment;
        });
    }
}).call(this);
(function() {
Ember.INFLECTED_CLASSIFY = Ember.ENV.INFLECTED_CLASSIFY;

if (typeof Ember.INFLECTED_CLASSIFY === 'undefined') {
  Ember.INFLECTED_CLASSIFY = false;
}


Ember.String.pluralize = function(word) {
  return Ember.Inflector.inflect(word, Ember.Inflector.rules.plurals);
};

Ember.String.singularize = function(word) {
  return Ember.Inflector.inflect(word, Ember.Inflector.rules.singular);
};

Ember.String.humanize = function(word) {

  var inflected = Ember.Inflector.inflect(word,Ember.Inflector.rules.humans);

  inflected = inflected.replace(Ember.Inflector.KEY_SUFFIX_REGEX,'');
  inflected = inflected.replace(Ember.Inflector.WHITESPACE_REGEX,' ');
  inflected = inflected.replace(/_/g,' ');

  // acronymize?

  return Ember.String.capitalize(inflected);
};

Ember.String.titleize = function(word) {
   var result = Ember.String.humanize(word);

   result = result.
     replace(/\b(?:<!['’`])[a-z]/).
     toLowerCase().
     replace(/^.|\s\S/g, function(a) { return a.toUpperCase(); });

  return result;
};

Ember.String.capitalize = function(word) {
  return word.replace(Ember.Inflector.FIRST_LETTER_REGEX, function(match) {
    return match.toUpperCase();
  });
};

Ember.String.tableize = function(word) {
  return Ember.String.pluralize(Ember.String.underscore(word.toLowerCase()));
};

if (Ember.INFLECTED_CLASSIFY) {
  Ember.String.classify = function(word) {
    return Ember.String.capitalize(Ember.String.camelize(Ember.String.singularize(word)));
  };
}

})();



(function() {
Ember.Inflector = {
  FIRST_LETTER_REGEX: /^\w/,
  WHITESPACE_REGEX: /\s+/,
  KEY_SUFFIX_REGEX: /_id$/,
  BLANK_REGEX: /^\s*$/,

  _CACHE: {},
  cache: function(word, rules, value){
    Ember.Inflector._CACHE[word] = Ember.Inflector._CACHE[word] || {};

    if (value){
      Ember.Inflector._CACHE[word][rules] = value;
    }

    return Ember.Inflector._CACHE[word][rules];
  },

  clearCache: function(){
    Ember.Inflector._CACHE = {};
  },

  clearRules: function(){
    Ember.Inflector.rules.plurals     = [];
    Ember.Inflector.rules.plurals     = [];
    Ember.Inflector.rules.singular    = [];
    Ember.Inflector.rules.humans      = [];
    Ember.Inflector.rules.uncountable = {};
    Ember.Inflector.rules.irregular   = {};
    Ember.Inflector.rules.irregularInverse = {};
  },

  rules: {
    plurals:  [],
    singular: [],
    humans:   [],
    irregular: {},
    irregularInverse: {},
    uncountable: {}
  },

  reset: function(){
    Ember.Inflector.clearCache();
    Ember.Inflector.clearRules();
  },

  plural: function(rule,substituion){
    Ember.Inflector.rules.plurals.addObject([rule, substituion]);
  },

  singular: function(rule,substituion){
    Ember.Inflector.rules.singular.addObject([rule, substituion]);
  },

  human: function(rule,substituion){
    Ember.Inflector.rules.humans.addObject([rule, substituion]);
  },

  irregular: function(rule,substituion){
    Ember.Inflector.rules.irregular[rule] = substituion;
    Ember.Inflector.rules.irregularInverse[substituion] = rule;
  },

  uncountable: function(uncountable) {
    uncountable.forEach(function(word) {
      Ember.Inflector.rules.uncountable[word] = true;
    });
  },

  inflect: function(word, rules) {
    var inflection, substitution, result, lowercase,
    isCached, isIrregular, isIrregularInverse, rule;

    if (Ember.Inflector.BLANK_REGEX.test(word)){
      return word;
    }

    lowercase = word.toLowerCase();

    isCached =  Ember.Inflector.cache(lowercase,rules);
    if (isCached){
      // cached
      return isCached;
    }

    if (Ember.Inflector.rules.uncountable[lowercase]){
      // uncountable
      return word;
    }

    isIrregular = Ember.Inflector.rules.irregular[lowercase];

    if (isIrregular){
      // irregular
      return isIrregular;
    }

    isIrregularInverse = Ember.Inflector.rules.irregularInverse[lowercase];

    if (isIrregularInverse){
      // irregular
      return isIrregularInverse;
    }

    for(var i = rules.length, min = 0; i > min; i--){
      inflection = rules[i-1],
      rule = inflection[0];

      if(rule.test(word)){
        break;
      }
    }

    inflection = inflection || [];

    rule = inflection[0];
    substitution = inflection[1];

    result = word.replace(rule,substitution);

    Ember.Inflector.cache(lowercase,rules,result);
    return result;

  }
};

})();



(function() {
Ember.Inflector.loadAll = function(){
  Ember.Inflector.plural(/$/, 's');
  Ember.Inflector.plural(/s$/i, 's');
  Ember.Inflector.plural(/^(ax|test)is$/i, '$1es');
  Ember.Inflector.plural(/(octop|vir)us$/i, '$1i');
  Ember.Inflector.plural(/(octop|vir)i$/i, '$1i');
  Ember.Inflector.plural(/(alias|status)$/i, '$1es');
  Ember.Inflector.plural(/(bu)s$/i, '$1ses');
  Ember.Inflector.plural(/(buffal|tomat)o$/i, '$1oes');
  Ember.Inflector.plural(/([ti])um$/i, '$1a');
  Ember.Inflector.plural(/([ti])a$/i, '$1a');
  Ember.Inflector.plural(/sis$/i, 'ses');
  Ember.Inflector.plural(/(?:([^f])fe|([lr])f)$/i, '$1$2ves');
  Ember.Inflector.plural(/(hive)$/i, '$1s');
  Ember.Inflector.plural(/([^aeiouy]|qu)y$/i, '$1ies');
  Ember.Inflector.plural(/(x|ch|ss|sh)$/i, '$1es');
  Ember.Inflector.plural(/(matr|vert|ind)(?:ix|ex)$/i, '$1ices');
  Ember.Inflector.plural(/^(m|l)ouse$/i, '$1ice');
  Ember.Inflector.plural(/^(m|l)ice$/i, '$1ice');
  Ember.Inflector.plural(/^(ox)$/i, '$1en');
  Ember.Inflector.plural(/^(oxen)$/i, '$1');
  Ember.Inflector.plural(/(quiz)$/i, '$1zes');

  Ember.Inflector.singular(/s$/i, '');
  Ember.Inflector.singular(/(ss)$/i, '$1');
  Ember.Inflector.singular(/(n)ews$/i, '$1ews');
  Ember.Inflector.singular(/([ti])a$/i, '$1um');
  Ember.Inflector.singular(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)(sis|ses)$/i, '$1sis');
  Ember.Inflector.singular(/(^analy)(sis|ses)$/i, '$1sis');
  Ember.Inflector.singular(/([^f])ves$/i, '$1fe');
  Ember.Inflector.singular(/(hive)s$/i, '$1');
  Ember.Inflector.singular(/(tive)s$/i, '$1');
  Ember.Inflector.singular(/([lr])ves$/i, '$1f');
  Ember.Inflector.singular(/([^aeiouy]|qu)ies$/i, '$1y');
  Ember.Inflector.singular(/(s)eries$/i, '$1eries');
  Ember.Inflector.singular(/(m)ovies$/i, '$1ovie');
  Ember.Inflector.singular(/(x|ch|ss|sh)es$/i, '$1');
  Ember.Inflector.singular(/^(m|l)ice$/i, '$1ouse');
  Ember.Inflector.singular(/(bus)(es)?$/i, '$1');
  Ember.Inflector.singular(/(o)es$/i, '$1');
  Ember.Inflector.singular(/(shoe)s$/i, '$1');
  Ember.Inflector.singular(/(cris|test)(is|es)$/i, '$1is');
  Ember.Inflector.singular(/^(a)x[ie]s$/i, '$1xis');
  Ember.Inflector.singular(/(octop|vir)(us|i)$/i, '$1us');
  Ember.Inflector.singular(/(alias|status)(es)?$/i, '$1');
  Ember.Inflector.singular(/^(ox)en/i, '$1');
  Ember.Inflector.singular(/(vert|ind)ices$/i, '$1ex');
  Ember.Inflector.singular(/(matr)ices$/i, '$1ix');
  Ember.Inflector.singular(/(quiz)zes$/i, '$1');
  Ember.Inflector.singular(/(database)s$/i, '$1');

  Ember.Inflector.irregular('person', 'people');
  Ember.Inflector.irregular('man', 'men');
  Ember.Inflector.irregular('child', 'children');
  Ember.Inflector.irregular('sex', 'sexes');
  Ember.Inflector.irregular('move', 'moves');
  Ember.Inflector.irregular('cow', 'kine');
  Ember.Inflector.irregular('zombie', 'zombies');

  Ember.Inflector.uncountable("equipment information rice money species series fish sheep jeans police".w());
};

})();



(function() {
Ember.Inflector.rules.ordinalization = {
  'default': 'th',
  0:  '',
  1:  'st',
  2:  'nd',
  3:  'rd',
  11: 'th',
  12: 'th',
  13: 'th'
};

Ember.Inflector.ordinal = function(number) {
  number = parseInt(number,10);
  number = Math.abs(number);

  if (number > 10 && number < 14){
    number %= 100;
  } else {
    number %= 10;
  }

  var ordinalization = Ember.Inflector.rules.ordinalization;

  return ordinalization[number] || ordinalization['default'];
};

Ember.String.ordinalize = function (word) {
  var ordinalization = Ember.Inflector.ordinal(word);

  return [word, ordinalization].join('');
};

})();



(function() {
var pluralize = Ember.String.pluralize,
    singularize = Ember.String.singularize,
    humanize = Ember.String.humanize,
    titleize = Ember.String.titleize,
    capitalize = Ember.String.capitalize,
    tableize = Ember.String.tableize,
    classify = Ember.String.classify;

if (Ember.EXTEND_PROTOTYPES) {
    
    /*
     * 
     */
    String.prototype.pluralize = function() {
       return pluralize(this, arguments);
    };

    /*
     * 
     */
    String.prototype.singularize = function() {
       return singularize(this, arguments);
    };

    /*
     * 
     */
    String.prototype.humanize = function() {
       return humanize(this, arguments);
    };

    /*
     * 
     */
    String.prototype.titleize = function() {
       return titleize(this, arguments);
    };

    /*
     * 
     */
    String.prototype.capitalize = function() {
       return capitalize(this, arguments);
    };

    /*
     * 
     */
    String.prototype.tableize = function() {
       return tableize(this, arguments);
    };

    /*
     * 
     */
    String.prototype.classify = function() {
       return classify(this, arguments);
    };
}

})();



(function() {

})();



(function() {

})();


define("adminjs/application",
  ["adminjs/routes/index","adminjs/controllers/index","adminjs/views/index","adminjs/views/search","adminjs/views/resource","adminjs/controllers/resource","adminjs/routes/resource","adminjs/helpers/group","adminjs/config","adminjs/controllers/application","adminjs/views/application","adminjs/renderers/id","adminjs/renderers/date","adminjs/renderers/has_many","adminjs/renderers/belongs_to","adminjs/filters/text","adminjs/filters/checkboxes","adminjs/components/spinner_display","adminjs/editors/text"],
  function(IndexRoute, IndexController, IndexView, SearchView, ResourceView, ResourceController, ResourceRoute, group, Config, ApplicationController, ApplicationView, IdRenderer, DateRenderer, HasManyRenderer, BelongsToRenderer, TextFilter, CheckboxesFilter, SpinnerDisplayComponent, TextEditor) {
    "use strict";



    Ember.ENV.HELPER_PARAM_LOOKUPS = true;

    var Application = Ember.Application.extend({

      title: 'AdminJS',

      init: function() {
        this._super();
        this.configs = [];

        var container = this.__container__;

        // TODO: should be in an initializer
        Ember.Inflector.loadAll();

        // These are some hacks to support lookups in the incorporating application
        // this could ultimately be supported better if the resolver could support
        // separate namespaces

        this.ApplicationController = ApplicationController;

        this.ApplicationView = ApplicationView;

        this.IdRenderer = IdRenderer;

        this.DateRenderer = DateRenderer;

        this.HasManyRenderer = HasManyRenderer;

        this.BelongsToRenderer = BelongsToRenderer;

        this.TextFilter = TextFilter;

        this.CheckboxesFilter = CheckboxesFilter;

        this.SpinnerDisplayComponent = SpinnerDisplayComponent;

        this.TextEditor = TextEditor;

        container.register('editor:default', TextEditor);
      },

      manage: function(name, options) {

        var container = this.__container__;
        // HACK: we set EPF container here instead of going through the initializer,
        // this is because this manage method is run before the initializers
        Ep.__container__ = container;

        options = Ember.merge({name: name, container: container, namespace: this}, options || {});

        // TODO: move this to an initializer and make everything container based
        var config = Config.create(options);

        this.configs.push(config);

        // build the controllers/views/routes for this resource
        this[config.classifiedPlural + 'IndexRoute'] = IndexRoute.extend({
          config: config
        });
        this[config.classifiedPlural + 'IndexController'] = IndexController.extendWithConfig(config);
        this[config.classifiedPlural + 'IndexView'] = IndexView.extend({
          config: config
        });
        this[config.classifiedPlural + 'SearchView'] = SearchView.extend({
          config: config
        });
        this[config.classified + 'View'] = ResourceView.extend({
          config: config
        });
        this[config.classified + 'Controller'] = ResourceController.extend({
          config: config
        });
        this[config.classified + 'Route'] = ResourceRoute.extendWithConfig(config);
      },

      configure: function(dsl) {
        dsl.call(this);
        this.buildRoutes();
      },

      buildRoutes: function() {
        var app = this;
        this.Router.map(function() {
          app.configs.forEach(function(config) {
            this.resource(config.plural, function() {
              this.resource(config.name, {path: '/:' + config.name + '_id'});
            });
          }, this);
        });

        this.IndexRoute = Ember.Route.extend({

          beforeModel: function() {
            this.transitionTo(app.configs[0].plural);
          }

        });
      }

    });

    return Application;
  });
define("adminjs/components/spinner_display",
  [],
  function() {
    "use strict";
    var SpinnerDisplayComponent = Ember.Component.extend({

      classNames: ['spinner-display'],
      spinner: null,
      color: "#2693FF",

      didInsertElement: function() {
        var opts = {
          radius: 4,
          length: 3,
          lines: 9,
          width: 3,
          color: this.get('color')
        };
        this.spinner = new Spinner(opts).spin(this.$()[0]);
      },

      willRemoveElement: function() {
        this.spinner.stop();
      }

    });

    return SpinnerDisplayComponent;
  });
define("adminjs/config",
  [],
  function() {
    "use strict";
    var get = Ember.get;

    var Config = Ember.Object.extend({

      init: function() {
        this._super();
        this.plural = Ember.String.pluralize(this.name);
        this.classified = Ember.String.classify(this.name);
        this.classifiedPlural = Ember.String.classify(this.plural);
      },

      getField: function(name) {
        var fields = get(this, 'fields');
        return fields.findProperty('name', name);
      },

      fields: Ember.computed(function() {
        var type = this.container.lookup('model:' + this.name);
        var result = [{
          name: 'id',
          title: 'Id',
          type: 'id',
          editable: false
        }];
        get(type, 'attributes').forEach(function(name, meta) {
          result.push({
            name: name,
            type: meta.type,
            title: Ember.String.titleize(Ember.String.underscore(name))
          });
        });
        type.eachRelationship(function(name, relationship) {
          var typeName = relationship.type.toString().split(".")[1].underscore();
          var isManaged = this.namespace.configs.some(function(config) {
            return config.name === typeName;
          });
          result.push({
            name: name,
            editable: false,
            type: relationship.kind,
            modelType: relationship.type,
            modelTypeName: typeName,
            modelTypePlural: Ember.String.pluralize(typeName),
            isManaged: isManaged,
            title: Ember.String.titleize(Ember.String.underscore(name))
          });
        }, this);
        return result;
      }),

      itemFields: Ember.computed.alias('fields')

    });

    return Config;
  });
define("adminjs/controllers/application",
  [],
  function() {
    "use strict";
    var ApplicationController = Ember.Controller.extend({

      resources: Ember.computed(function() {
        return this.namespace.configs.mapProperty('plural');
      })

    });

    return ApplicationController;
  });
define("adminjs/controllers/index",
  ["adminjs/utils/paginated_model_array"],
  function(PaginatedModelArray) {
    "use strict";

    var IndexController = Ember.ArrayController.extend({

      content: Ember.A([]),
      timer: null,

      updateContent: Ember.observer(function() {
        var config = this.get('config'),
            query = this.get('query'),
            perPage = this.get('config.index.perPage');

        var content = PaginatedModelArray.create({
          session: this.session,
          query: query,
          type: config.name,
          perPage: perPage
        });
        this.set('content', content);
        // add a slight delay to prevent many overlapping
        // requests while typing
        if(this.timer) Ember.run.cancel(this.timer);
        this.timer = Ember.run.later(this, 'more', 250);
      }, 'query'),

      more: function() {
        this.get('content').more();
      },

      toggleMore: function() {
        this.toggleProperty('showMore');
      },

      hasFilters: Ember.computed(function() {
        return this.get('config.filters.length') > 0;
      }).property('config'),

      createResource: function() {
        var session = this.get('session');
        var config = this.get('config');
        var resource = session.create(config.name);
        this.target.transitionTo(config.name, resource);
      }

    });

    IndexController.reopenClass({

      extendWithConfig: function(config) {

        // dynamically extend the class to take into account
        // the configuration

        var queryDeps = (config.filters || []).map(function(filter) {
          return filter.param || filter.name;
        });

        queryDeps.push('q');

        var defaultParams = config.get('index.defaultParams') || {};

        var queryProp = Ember.computed(function() {
          var query = {q: this.get('q')};

          Ember.merge(query, defaultParams);

          if(config.filters) {
            config.filters.forEach(function(filter) {
              var param = filter.param || filter.name;
              query[param] = this.get(param);
            }, this);
          }

          return query;
        });

        queryProp = queryProp.property.apply(queryProp, queryDeps);

        return this.extend({

          config: config,
          query: queryProp

        });

      }

    });

    return IndexController;
  });
define("adminjs/controllers/resource",
  [],
  function() {
    "use strict";
    var get = Ember.get;

    var ResourceController = Ember.ObjectController.extend({

      _originalContent: null,
      editingSession: null,
      isEditing: false,

      edit: function() {
        this.set('isEditing', true);
        this._originalContent = this.get('content');
        // create a child session to to the editing in
        var session = this.get('session');
        this.editingSession = session.newSession();
        this.set('content', this.editingSession.add(this.get('content')));
      },

      cancel: function() {
        this.set('isEditing', false);
        this.set('content', this._originalContent);
        if(this.get('content.isNew')) {
          this.target.transitionTo(this.get('config.plural'));
        }
      },

      save: function() {
        this.editingSession.flush();
        this.set('isEditing', false);
        this.set('content', this._originalContent);
      },

      remove: function() {
        var config = this.get('config');
        if(window.confirm("Are you sure you want to delete this " + config.name + "?")) {
          this.get('session').deleteModel(this.get('content'));
          this.target.transitionTo(config.plural);
        }
      }

    });

    return ResourceController;
  });
define("adminjs/editors/base",
  [],
  function() {
    "use strict";
    var BaseEditor = Ember.Component.extend({

      config: Ember.computed.alias('targetObject.config'),
      resource: Ember.computed.alias('_parentView.context')

    });

    return BaseEditor;
  });
define("adminjs/editors/text",
  ["adminjs/editors/base"],
  function(BaseEditor) {
    "use strict";

    var TextEditor = BaseEditor.extend({

      classNames: ['text-editor'],
      templateName: 'editors/text'

    });

    return TextEditor;
  });
define("adminjs/filters/base",
  [],
  function() {
    "use strict";
    var BaseFilter = Ember.Component.extend({

      classNames: ['adminjs-filter-view'],
      config: Ember.computed.alias('controller.config')

    });

    return BaseFilter;
  });
define("adminjs/filters/checkboxes",
  ["adminjs/filters/base"],
  function(BaseFilter) {
    "use strict";

    var CheckboxesFilterView = BaseFilter.extend({
      classNames: ['checkboxes-filter'],
      templateName: 'filters/checkboxes',

      options: Ember.computed(function() {
        var options = this.get('filter.options');
        return options.map(function(option) {
          return {value: option, checked: false};
        });
      }).property('filter'),

      optionsChanged: Ember.observer(function() {
        var options = this.get('options');
        var selectedValues = options.filterProperty('checked').mapProperty('value');
        this.set('value', selectedValues);
      }, 'options.@each.checked')

    });

    return CheckboxesFilterView;
  });
define("adminjs/filters/text",
  ["adminjs/filters/base"],
  function(BaseFilter) {
    "use strict";

    var TextFilterView = BaseFilter.extend({
      classNames: ['text-filter'],
      templateName: 'filters/text'
    });

    return TextFilterView;
  });
define("adminjs/helpers/field",
  [],
  function() {
    "use strict";
    var get = Ember.get, set = Ember.set, EmberHandlebars = Ember.Handlebars;


    var caches = {
      'editor': Ember.Map.create(),
      'renderer': Ember.Map.create()
    };

    function lookup(type, config, field) {
      var cache = caches[type];
      var cached = cache.get(field);
      if(cached !== undefined) {
        return cached;
      }
      var candidates = Ember.A([field[type], field.name, field.type, 'default']).compact();
      var result;
      for(var i = 0; i < candidates.length; i++) {
        var name = candidates[i];
        result = config.container.lookupFactory(type + ':' + name);
        if(result) break;
      }
      cache.set(field, result);
      return result;
    }

    /**
      Renders a field based on the configuration.
    */
    EmberHandlebars.registerHelper('field', function(name, options) {
      if (options.types[0] === "ID") {
        name = Ember.Handlebars.get(options.contexts[0], name, options);
      }

      var config = options.data.keywords.controller.get('config'),
          view = options.data.view,
          field = config.getField(name),
          FieldView;

      var isEditing = !!options.hash.edit && field.editable !== false;

      FieldView = lookup(isEditing ? 'editor' : 'renderer', config, field);

      if(FieldView) {
        // normalize the path to be relative to the view
        var opts = {
          valueBinding: "_parentView.context." + field.name,
          field: field
        };
        view.appendChild(FieldView, opts);
      } else {
        // the "default renderer" is just a binding
        return EmberHandlebars.helpers.bind.apply(this, [name, options]);
      }
    });
  });
define("adminjs/helpers/group",
  [],
  function() {
    "use strict";
    var get = Ember.get, set = Ember.set, EmberHandlebars = Ember.Handlebars;

    EmberHandlebars.registerHelper('group', function(options) {
      var data = options.data,
          fn   = options.fn,
          view = data.view,
          childView;

      childView = view.createChildView(Ember._MetamorphView, {
        context: get(view, 'context'),

        template: function(context, options) {
          options.data.insideGroup = true;
          return fn(context, options);
        }
      });

      view.appendChild(childView);
    });
  });
define("adminjs/main",
  ["adminjs/application","adminjs/config","adminjs/renderers/base","adminjs/filters/base","adminjs/editors/base","exports"],
  function(Application, Config, Renderer, Filter, Editor, __exports__) {
    "use strict";

    __exports__.Application = Application;
    __exports__.Config = Config;
    __exports__.Renderer = Renderer;
    __exports__.Filter = Filter;
    __exports__.Editor = Editor;
  });
define("adminjs/renderers/base",
  [],
  function() {
    "use strict";
    var BaseRenderer = Ember.Component.extend({

      config: Ember.computed.alias('targetObject.config'),
      resource: Ember.computed.alias('_parentView.context')

    });

    return BaseRenderer;
  });
define("adminjs/renderers/belongs_to",
  ["adminjs/renderers/base"],
  function(BaseRenderer) {
    "use strict";

    var BelongsToRenderer = BaseRenderer.extend({
      classNames: ['belongs-to-renderer'],
      templateName: 'renderers/belongs_to'
    });

    return BelongsToRenderer;
  });
define("adminjs/renderers/date",
  ["adminjs/renderers/base"],
  function(BaseRenderer) {
    "use strict";

    var DateRenderer = BaseRenderer.extend({
      classNames: ['date-renderer'],
      templateName: 'renderers/date',

      formattedValue: Ember.computed(function() {
        var format = this.get('field').format || 'llll',
            value = this.get('value');
        return value && moment(value).format(format);
      }).property('field.format', 'value')
    });

    return DateRenderer;
  });
define("adminjs/renderers/has_many",
  ["adminjs/renderers/base"],
  function(BaseRenderer) {
    "use strict";

    var HasManyRenderer = BaseRenderer.extend({
      tagName: 'ul',
      classNames: ['has-many-renderer'],
      templateName: 'renderers/has_many',

      show: function() {
        this.toggleProperty('showAll');
      }
    });

    return HasManyRenderer;
  });
define("adminjs/renderers/id",
  ["adminjs/renderers/base"],
  function(BaseRenderer) {
    "use strict";

    var IdRenderer = BaseRenderer.extend({
      classNames: ['id-renderer'],
      templateName: 'renderers/id'
    });

    return IdRenderer;
  });
define("adminjs/routes/index",
  [],
  function() {
    "use strict";
    var IndexRoute = Ember.Route.extend({

      setupController: function(controller) {
        if(!controller.get('content.length')) {
          controller.updateContent();
        }
      },

      renderTemplate: function(controller, model) {
        this.render();

        // {{render}} does not currently allow for dynamic names so an outlet is used
        var name = this.config.plural + '_search';
        this.render(name, { outlet: "search", into: this.routeName });
      }
  
    });

    return IndexRoute;
  });
define("adminjs/routes/resource",
  [],
  function() {
    "use strict";
    var ResourceRoute = Ember.Route.extend({

      model: function(params) {
        var config = this.get('config');
        var id = params[config.name + "_id"];
        if(id === 'new') return undefined;
        return this.get('session').load(config.name, id);
      },

      serialize: function(model, params) {
        if(!model || model.get('isNew')) model = {id: 'new'};
        return this._super(model, params);
      },

      setupController: function(controller, model) {
        this._super(controller, model);
        if(model.get('isNew')) controller.edit();
      }
  
    });

    ResourceRoute.reopenClass({

      extendWithConfig: function(config) {
        return this.extend({config: config});
      }

    });

    return ResourceRoute;
  });
define("adminjs/utils/paginated_model_array",
  [],
  function() {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var PaginatedModelArray = Ember.ArrayProxy.extend({
      session: null,
      query: {},
      type: null,
      currentPage: null,
      perPage: null,
      totalEntries: null,
      init: function () {
        this._super();
        return set(this, 'content', []);
      },

      isLoading: false,
      more: function () {
        var query, self;
        if (get(this, 'isLoading'))
          return;
        query = Ember.copy(get(this, 'query'));
        Ember.merge(query, get(this, 'nextPaginationQuery'));
        set(this, 'isLoading', true);
        self = this;
        return get(this, 'session').query(get(this, 'type'), query).then(function (modelArray) {
          var content;
          self.beginPropertyChanges();
          self.extractMeta(modelArray);
          content = get(self, 'content');
          modelArray.forEach(function (model) {
            return content.pushObject(model);
          });
          set(self, 'isLoading', false);
          return self.endPropertyChanges();
        });
      },

      extractMeta: function (modelArray) {
        var meta;
        meta = get(modelArray, 'meta');
        set(this, 'currentPage', get(meta, 'current_page'));
        set(this, 'perPage', get(meta, 'per_page'));
        return set(this, 'totalEntries', get(meta, 'total_entries'));
      },

      nextPaginationQuery: Ember.computed(function () {
        var currentPage, params, perPage;
        params = {};
        currentPage = get(this, 'currentPage');
        if (currentPage)
          set(params, 'page', currentPage + 1);
        perPage = get(this, 'perPage');
        if (perPage)
          set(params, 'per_page', perPage);
        return params;
      }).property('currentPage', 'perPage'),

      hasMore: Ember.computed(function () {
        var numPages, perPage;
        perPage = get(this, 'perPage') || 10;
        if (!get(this, 'totalEntries'))
          return false;
        numPages = Math.ceil(get(this, 'totalEntries') / perPage);
        return get(this, 'currentPage') < numPages;
      }).property('perPage', 'totalEntries', 'currentPage')

    });

    return PaginatedModelArray;
  });
define("adminjs/views/application",
  [],
  function() {
    "use strict";
    var ApplicationView = Ember.View.extend({
      classNames: ['adminjs-application-view'],
      templateName: 'adminjs/application',
    });

    return ApplicationView;
  });
define("adminjs/views/index",
  ["adminjs/helpers/field"],
  function(field) {
    "use strict";

    var IndexView = Ember.View.extend({
      classNames: ['adminjs-index-view'],
      templateName: 'adminjs/index',

      didInsertElement: function() {
        var $this = this.$();
        var view = this;
        var lastScroll = 0;
        var lastHScroll = 0;
        $(window).on('scroll.infinite', function() {
          var scroll = $(window).scrollTop();

          var hscroll = $(window).scrollLeft();
          // fix the header on horizontal scroll
          if(hscroll !== lastHScroll) {
            lastHScroll = hscroll;
            var maxHScroll = $(document).width() - $(window).width();
            hscroll = Math.min(Math.max(0, hscroll), maxHScroll);
            $('.adminjs-application-view > header, .adminjs-index-view > header').css({
              'left': hscroll + 'px'
            });
          }

          if(lastScroll < scroll) {
            // infinite scroll
            var buffer = 120;
            var pageHeight = $this.height() + $this.position().top;
            if($(window).scrollTop() + $(window).height() + buffer > pageHeight)
              view.controller.more();
          }
          lastScroll = scroll;
        });
      },

      willDestroyElement: function() {
        $(window).off('scroll.infinite');
      },

      TableView: Ember.View.extend({
        tagName: 'table',
        classNames: ['adminjs-index-table-view'],

        config: Ember.computed.alias('parentView.config'),
        fields: Ember.computed.alias('config.fields'),

        // Dynamically create the template as an optimization. This
        // is faster than have an inner {{each}} which loops over the columns
        template: Ember.computed(function() {

          var hbs = "<tr><thead>";
          var fields = this.get('fields');
          fields.forEach(function(field) {
            hbs += "<th>" + field.title + "</th>";
          });
          hbs += "</thead></tr>";

          hbs += "<tbody>{{#each this}}";
          hbs += "<tr>";
          fields.forEach(function(field) {
            hbs += "<td>{{field \"" + field.name + "\"}}</td>";
          });
          hbs += "</tr>";
          hbs += "{{/each}}</tbody>";

          return Ember.Handlebars.compile(hbs);

        }).property('fieldNames')

      })
    });

    return IndexView;
  });
define("adminjs/views/resource",
  [],
  function() {
    "use strict";
    var ResourceView = Ember.View.extend({
      classNames: ['adminjs-resource-view'],
      templateName: 'adminjs/resource',

      didInsertElement: function() {
        this._super();

        // when navigating from a deeply scrolled
        // index view it is good to reset the scroll
        $('body').scrollTop(0);
      }
    });

    return ResourceView;
  });
define("adminjs/views/search",
  [],
  function() {
    "use strict";
    var SearchView = Ember.View.extend({
      classNameBindings: [':adminjs-search-view', 'controller.content.isLoading:loading'],
      templateName: 'adminjs/search',

      filters: Ember.computed(function() {
        // loop over filter configurations and lookup view classes
        var views = [],
            config = this.get('config');

        return config.filters.map(function(filter) {
          var filterName = filter.type || "text";

          var FilterView = config.container.lookupFactory('filter:' + filterName);

          var param = filter.param || filter.name;

          FilterView = FilterView.extend({
            filter: filter,
            valueBinding: 'targetObject.' + param
          });

          return FilterView;
        });
      }).property('config'),
    });

    return SearchView;
  });
Ember.TEMPLATES["adminjs/application"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("<li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers.linkTo || depth0.linkTo),stack1 ? stack1.call(depth0, "name", options) : helperMissing.call(depth0, "linkTo", "name", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>");
  return buffer;
  }
function program2(depth0,data) {
  
  var hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

function program4(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

  data.buffer.push("<header><h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "namespace.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h1><nav><ul>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "name", "in", "resources", {hash:{},inverse:self.program(4, program4, data),fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul></nav><div class=\"credits\"><a href=\"http://adminjs.com\">adminjs</a> by <a href=\"https://grouptalent.com\">GroupTalent</a></div></header>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  return buffer;
  
});

Ember.TEMPLATES["adminjs/index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<header>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.outlet || depth0.outlet),stack1 ? stack1.call(depth0, "search", options) : helperMissing.call(depth0, "outlet", "search", options))));
  data.buffer.push("<h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "config.plural", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" - ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "content.totalEntries", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h1><ul class=\"actions\"><li><a class=\"create\" href=\"#\" ");
  hashContexts = {'on': depth0};
  hashTypes = {'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createResource", {hash:{
    'on': ("click")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><div class=\"icon-plus\"></div></a></li></ul></header>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.TableView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  return buffer;
  
});

Ember.TEMPLATES["adminjs/resource"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<li><a class=\"cancel\" href=\"#\" ");
  hashContexts = {'on': depth0};
  hashTypes = {'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancel", {hash:{
    'on': ("click")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><div class=\"icon-remove\"></div></a></li><li><a class=\"save\" href=\"#\" ");
  hashContexts = {'on': depth0};
  hashTypes = {'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "save", {hash:{
    'on': ("click")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><div class=\"icon-ok\"></div></a></li>");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<li><a class=\"remove\" href=\"#\" ");
  hashContexts = {'on': depth0};
  hashTypes = {'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "remove", {hash:{
    'on': ("click")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><div class=\"icon-trash\"></div></a></li><li><a class=\"edit\" href=\"#\" ");
  hashContexts = {'on': depth0};
  hashTypes = {'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "edit", {hash:{
    'on': ("click")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><div class=\"icon-edit\"></div></a></li>");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("<tr><td class=\"field-name\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "f.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td><td>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isEditing", {hash:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td></tr>");
  return buffer;
  }
function program6(depth0,data) {
  
  var stack1, hashContexts, hashTypes, options;
  hashContexts = {'edit': depth0};
  hashTypes = {'edit': "BOOLEAN"};
  options = {hash:{
    'edit': (true)
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.field || depth0.field),stack1 ? stack1.call(depth0, "f.name", options) : helperMissing.call(depth0, "field", "f.name", options))));
  }

function program8(depth0,data) {
  
  var stack1, hashTypes, hashContexts, options;
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.field || depth0.field),stack1 ? stack1.call(depth0, "f.name", options) : helperMissing.call(depth0, "field", "f.name", options))));
  }

function program10(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

  data.buffer.push("<header><h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "config.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h1><ul class=\"actions\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isEditing", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul></header><table><tr><th class=\"field-name\">Field</th><th>Value</th></tr>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "f", "in", "config.fields", {hash:{},inverse:self.program(10, program10, data),fn:self.program(5, program5, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</table>");
  return buffer;
  
});

Ember.TEMPLATES["adminjs/search"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "spinner-display", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

function program3(depth0,data) {
  
  
  data.buffer.push("<i class=\"icon-search\"></i>");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("<div class=\"fixed-indicator\">");
  hashContexts = {'color': depth0};
  hashTypes = {'color': "STRING"};
  options = {hash:{
    'color': ("#fff")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['spinner-display'] || depth0['spinner-display']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "spinner-display", options))));
  data.buffer.push("</div>");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("<a class=\"toggle-more\" ");
  hashContexts = {'on': depth0};
  hashTypes = {'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleMore", {hash:{
    'on': ("click")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" href=\"#\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "showMore", {hash:{},inverse:self.program(12, program12, data),fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>");
  return buffer;
  }
function program10(depth0,data) {
  
  
  data.buffer.push("<i class=\"icon-caret-up\"></i>");
  }

function program12(depth0,data) {
  
  
  data.buffer.push("<i class=\"icon-caret-down\"></i>");
  }

function program14(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("<div class=\"filters\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "filter", "in", "view.filters", {hash:{},inverse:self.program(7, program7, data),fn:self.program(15, program15, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  }
function program15(depth0,data) {
  
  var hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "filter", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

  data.buffer.push("<div class=\"fulltext-container\">");
  hashContexts = {'valueBinding': depth0,'elementId': depth0};
  hashTypes = {'valueBinding': "STRING",'elementId': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
    'valueBinding': ("q"),
    'elementId': ("fulltext")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<div class=\"icons\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "content.isLoading", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div></div>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "content.isLoading", {hash:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "hasFilters", {hash:{},inverse:self.program(7, program7, data),fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "showMore", {hash:{},inverse:self.program(7, program7, data),fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  
});

Ember.TEMPLATES["components/spinner-display"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '';


  return buffer;
  
});

Ember.TEMPLATES["editors/text"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var hashContexts, hashTypes, escapeExpression=this.escapeExpression;


  hashContexts = {'valueBinding': depth0};
  hashTypes = {'valueBinding': "ID"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
    'valueBinding': ("value")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  
});

Ember.TEMPLATES["filters/checkboxes"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<label class=\"check\">");
  hashContexts = {'valueBinding': depth0,'checkedBinding': depth0};
  hashTypes = {'valueBinding': "ID",'checkedBinding': "ID"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Checkbox", {hash:{
    'valueBinding': ("value"),
    'checkedBinding': ("checked")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "value", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</label>");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

  data.buffer.push("<label>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "filter.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(":</label>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "options", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  
});

Ember.TEMPLATES["filters/text"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashTypes, hashContexts, escapeExpression=this.escapeExpression;


  data.buffer.push("<label>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "filter.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(":</label>");
  hashContexts = {'valueBinding': depth0};
  hashTypes = {'valueBinding': "ID"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
    'valueBinding': ("value")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  return buffer;
  
});

Ember.TEMPLATES["renderers/belongs_to"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var stack1, stack2, hashTypes, hashContexts, options;
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers.linkTo || depth0.linkTo),stack1 ? stack1.call(depth0, "field.name", "value", options) : helperMissing.call(depth0, "linkTo", "field.name", "value", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  else { data.buffer.push(''); }
  }
function program2(depth0,data) {
  
  var hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "value.id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

function program4(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "field.isManaged", {hash:{},inverse:self.program(2, program2, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  
});

Ember.TEMPLATES["renderers/date"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashTypes, hashContexts, escapeExpression=this.escapeExpression;


  data.buffer.push("<time>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "formattedValue", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</time>");
  return buffer;
  
});

Ember.TEMPLATES["renderers/has_many"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "showAll", {hash:{},inverse:self.program(9, program9, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program2(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "rel", "in", "value", {hash:{},inverse:self.program(7, program7, data),fn:self.program(3, program3, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("<li>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "field.isManaged", {hash:{},inverse:self.program(5, program5, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</li>");
  return buffer;
  }
function program4(depth0,data) {
  
  var stack1, stack2, hashTypes, hashContexts, options;
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers.linkTo || depth0.linkTo),stack1 ? stack1.call(depth0, "field.modelTypeName", "rel", options) : helperMissing.call(depth0, "linkTo", "field.modelTypeName", "rel", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  else { data.buffer.push(''); }
  }
function program5(depth0,data) {
  
  var hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "rel.id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

function program7(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<a href=\"#\" ");
  hashContexts = {'on': depth0};
  hashTypes = {'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "show", {hash:{
    'on': ("click")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "value.length", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "field.modelTypePlural", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>");
  return buffer;
  }

  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "value.length", {hash:{},inverse:self.program(7, program7, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  
});

Ember.TEMPLATES["renderers/id"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var stack1, stack2, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "value", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

function program3(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers.linkTo || depth0.linkTo),stack1 ? stack1.call(depth0, "config.name", "resource", options) : helperMissing.call(depth0, "linkTo", "config.name", "resource", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  else { data.buffer.push(''); }
  
});
window.AJS = requireModule("adminjs/main");
})(window);