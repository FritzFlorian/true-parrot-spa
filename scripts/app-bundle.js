define('services/twitterCloneService',["require", "exports"], function (require, exports) {
    "use strict";
    var TwitterCloneService = (function () {
        function TwitterCloneService() {
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

define('text!app.html', ['module'], function(module) { module.exports = "<template>\n  <compose view-model=\"./viewmodels/headerMenu/headerMenu\"></compose>\n  <section class=\"ui container\" id=\"main-content\">\n    {{> flashMessage }}\n\n    <h1>Testing</h1>\n\n    {{{content}}}\n  </section>\n</template>\n"; });
define('text!viewmodels/headerMenu/headerMenu.html', ['module'], function(module) { module.exports = "<template>\n  <h1>Header</h1>\n  <header class=\"ui fixed menu above\">\n    <menu class=\"ui container\">\n      <a class=\"header item\" href=\"/tweets\">\n        <img class=\"logo\" src=\"/images/parrot.svg\"/>\n        True Parrot\n      </a>\n      <a class=\"header item\" href=\"/tweet\" show.bind=\"loggedIn\">\n        Tweet\n      </a>\n\n      {{#isAdmin}}\n      <a class=\"header item\" href=\"/admin/dashboard\">\n        Admin Dashboard\n      </a>\n      {{/isAdmin}}\n\n      <div class=\"right menu\">\n        <!-- Logged in navigation -->\n        <div class=\"ui dropdown item\" show.bind=\"loggedIn\">\n          <a href=\"/users/{{userId}}\">\n            <img class=\"ui avatar image\" src=\"{{gravatar}}\"/>\n            {{fullName}}\n          </a>\n          <i class=\"ui dropdown icon\"></i>\n\n          <div class=\"menu\">\n            <a class=\"item\" href=\"/users/{{userId}}\">Profile</a>\n            <a class=\"item\" href=\"/settings\">Settings</a>\n            <div class=\"divider\"></div>\n            <a class=\"item\" href=\"/logout\">Logout</a>\n          </div>\n        </div>\n\n        <!-- Not logged in navigation -->\n        <a class=\"item\" href=\"/login\" show.bind=\"!loggedIn\">\n          Log-in\n        </a>\n        <a class=\"item\" href=\"/signup\" show.bind=\"!loggedIn\">\n          Sign up\n        </a>\n      </div>\n    </menu>\n  </header>\n</template>\n"; });
//# sourceMappingURL=app-bundle.js.map