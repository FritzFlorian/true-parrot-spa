define('services/User',["require", "exports", "gravatar"], function (require, exports, gravatar) {
    "use strict";
    var User = (function () {
        function User(firstName, lastName, email, scope) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.scope = scope;
        }
        User.prototype.fullName = function () {
            return this.firstName + " " + this.lastName;
        };
        User.prototype.isAdmin = function () {
            for (var _i = 0, _a = this.scope; _i < _a.length; _i++) {
                var role = _a[_i];
                if (role == "admin")
                    return true;
            }
            return false;
        };
        User.prototype.gravatar = function () {
            return gravatar.url(this.email);
        };
        return User;
    }());
    exports.User = User;
});

define('services/twitterCloneService',["require", "exports", "./User"], function (require, exports, User_1) {
    "use strict";
    var TwitterCloneService = (function () {
        function TwitterCloneService() {
            this.currentUser = new User_1.User("Test", "User", "test@test.com", []);
        }
        TwitterCloneService.prototype.isAuthenticated = function () {
            return true;
        };
        return TwitterCloneService;
    }());
    exports.TwitterCloneService = TwitterCloneService;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('app',["require", "exports", "aurelia-framework", "./services/twitterCloneService"], function (require, exports, aurelia_framework_1, twitterCloneService_1) {
    "use strict";
    var App = (function () {
        function App(service) {
            this.service = service;
        }
        App.prototype.configureRouter = function (config, router) {
            config.map([
                { route: '', name: 'header', moduleId: 'viewmodels/headeMenu/headerMenu', nav: true, title: 'Header' },
            ]);
            this.router = router;
        };
        App = __decorate([
            aurelia_framework_1.autoinject(), 
            __metadata('design:paramtypes', [twitterCloneService_1.TwitterCloneService])
        ], App);
        return App;
    }());
    exports.App = App;
});

define('environment',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        debug: true,
        testing: true
    };
});

define('main',["require", "exports", './environment'], function (require, exports, environment_1) {
    "use strict";
    Promise.config({
        warnings: {
            wForgottenReturn: false
        }
    });
    function configure(aurelia) {
        aurelia.use
            .standardConfiguration()
            .feature('resources');
        if (environment_1.default.debug) {
            aurelia.use.developmentLogging();
        }
        if (environment_1.default.testing) {
            aurelia.use.plugin('aurelia-testing');
        }
        aurelia.start().then(function () { return aurelia.setRoot(); });
    }
    exports.configure = configure;
});

define('resources/index',["require", "exports"], function (require, exports) {
    "use strict";
    function configure(config) {
    }
    exports.configure = configure;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('viewmodels/headerMenu/headerMenu',["require", "exports", "aurelia-framework", "../../services/twitterCloneService"], function (require, exports, aurelia_framework_1, twitterCloneService_1) {
    "use strict";
    var HeaderMenu = (function () {
        function HeaderMenu(service) {
            this.service = service;
        }
        HeaderMenu.prototype.attached = function () {
            this.currentUser = this.service.currentUser;
            this.loggedIn = this.service.isAuthenticated();
        };
        HeaderMenu = __decorate([
            aurelia_framework_1.autoinject(), 
            __metadata('design:paramtypes', [twitterCloneService_1.TwitterCloneService])
        ], HeaderMenu);
        return HeaderMenu;
    }());
    exports.HeaderMenu = HeaderMenu;
});

define('querystring/decode',['require','exports','module'],function (require, exports, module) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

});

define('querystring/encode',['require','exports','module'],function (require, exports, module) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).map(function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (Array.isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

});

define('text!app.html', ['module'], function(module) { module.exports = "<template>\n  <compose view-model=\"./viewmodels/headerMenu/headerMenu\"></compose>\n  <section class=\"ui container\" id=\"main-content\">\n    {{> flashMessage }}\n\n    <h1>Testing</h1>\n\n    {{{content}}}\n  </section>\n</template>\n"; });
define('text!viewmodels/headerMenu/headerMenu.html', ['module'], function(module) { module.exports = "<template>\n  <h1>Header</h1>\n  <header class=\"ui fixed menu above\">\n    <menu class=\"ui container\">\n      <a class=\"header item\" href=\"/tweets\">\n        <img class=\"logo\" src=\"/images/parrot.svg\"/>\n        True Parrot\n      </a>\n      <a class=\"header item\" href=\"/tweet\" show.bind=\"loggedIn\">\n        Tweet\n      </a>\n\n      <a class=\"header item\" href=\"/admin/dashboard\" show.bind=\"loggedIn && currentUser.isAdmin()\">\n        Admin Dashboard\n      </a>\n\n      <div class=\"right menu\">\n        <!-- Logged in navigation -->\n        <div class=\"ui dropdown item\" show.bind=\"loggedIn\">\n          <a href=\"/users/{{userId}}\">\n            <img class=\"ui avatar image\" src=\"${currentUser.gravatar()}\"/>\n            ${currentUser.fullName()}\n          </a>\n          <i class=\"ui dropdown icon\"></i>\n\n          <div class=\"menu\">\n            <a class=\"item\" href=\"/users/{{userId}}\">Profile</a>\n            <a class=\"item\" href=\"/settings\">Settings</a>\n            <div class=\"divider\"></div>\n            <a class=\"item\" href=\"/logout\">Logout</a>\n          </div>\n        </div>\n\n        <!-- Not logged in navigation -->\n        <a class=\"item\" href=\"/login\" show.bind=\"!loggedIn\">\n          Log-in\n        </a>\n        <a class=\"item\" href=\"/signup\" show.bind=\"!loggedIn\">\n          Sign up\n        </a>\n      </div>\n    </menu>\n  </header>\n</template>\n"; });
//# sourceMappingURL=app-bundle.js.map