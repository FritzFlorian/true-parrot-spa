define('services/user',["require", "exports", "gravatar"], function (require, exports, gravatar) {
    "use strict";
    var User = (function () {
        function User(id, firstName, lastName, email, createdAt, description, scope, token) {
            if (description === void 0) { description = ""; }
            if (scope === void 0) { scope = []; }
            if (token === void 0) { token = ""; }
            this.id = id;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.scope = scope;
            this.token = token;
            this.description = description;
            this.createdAt = createdAt;
        }
        User.fromJson = function (json) {
            return new User(json._id || json.id, json.firstName, json.lastName, json.email, json.createdAt, json.description, json.scope, json.token);
        };
        Object.defineProperty(User.prototype, "fullName", {
            get: function () {
                return this.firstName + " " + this.lastName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(User.prototype, "isAdmin", {
            get: function () {
                for (var _i = 0, _a = this.scope; _i < _a.length; _i++) {
                    var role = _a[_i];
                    if (role == "admin")
                        return true;
                }
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(User.prototype, "gravatar", {
            get: function () {
                return gravatar.url(this.email);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(User.prototype, "bigGravatar", {
            get: function () {
                return gravatar.url(this.email, { s: '300' });
            },
            enumerable: true,
            configurable: true
        });
        return User;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = User;
});

define('services/tweet',["require", "exports", "./user"], function (require, exports, user_1) {
    "use strict";
    var Tweet = (function () {
        function Tweet(id, message, image, parroting, createdAt, creator) {
            this.id = id;
            this.image = image;
            this.message = message;
            this.parroting = parroting;
            this.createdAt = createdAt;
            this.creator = creator;
        }
        Tweet.fromJson = function (json) {
            return new Tweet(json._id, json.message, json.image, json.parroting, json.createdAt, user_1.default.fromJson(json.creator));
        };
        Tweet.prototype.updateCurrentUser = function (currentUser) {
            this.currentUser = currentUser;
        };
        Object.defineProperty(Tweet.prototype, "canUserDeletePost", {
            get: function () {
                if (!this.currentUser) {
                    return false;
                }
                if (this.currentUser.id == this.creator.id) {
                    return true;
                }
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tweet.prototype, "hasParrotedTweet", {
            get: function () {
                if (!this.currentUser) {
                    return false;
                }
                for (var _i = 0, _a = this.parroting; _i < _a.length; _i++) {
                    var parrotingId = _a[_i];
                    if (parrotingId == this.currentUser.id) {
                        return true;
                    }
                }
                return false;
            },
            enumerable: true,
            configurable: true
        });
        return Tweet;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Tweet;
});

define('services/messages',["require", "exports"], function (require, exports) {
    "use strict";
    var LoginStatus = (function () {
        function LoginStatus(success, error, user) {
            this.success = success;
            this.error = error;
            this.user = user;
        }
        return LoginStatus;
    }());
    exports.LoginStatus = LoginStatus;
    var TweetsChanged = (function () {
        function TweetsChanged(tweets) {
            this.tweets = tweets;
        }
        return TweetsChanged;
    }());
    exports.TweetsChanged = TweetsChanged;
});

define('services/fixtures',["require", "exports"], function (require, exports) {
    "use strict";
    var Fixtures = (function () {
        function Fixtures() {
            this.baseUrl = "http://localhost:4000";
        }
        return Fixtures;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Fixtures;
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
define('services/asyncHttpClient',["require", "exports", "aurelia-framework", "aurelia-http-client", "./fixtures", 'aurelia-event-aggregator', './messages', "./user"], function (require, exports, aurelia_framework_1, aurelia_http_client_1, fixtures_1, aurelia_event_aggregator_1, messages_1, user_1) {
    "use strict";
    var AsyncHttpClient = (function () {
        function AsyncHttpClient(httpClient, ea, fixtures) {
            this.httpClient = httpClient;
            this.httpClient.configure(function (configuration) {
                configuration.withBaseUrl(fixtures.baseUrl);
            });
            this.ea = ea;
        }
        AsyncHttpClient.prototype.getAuthenticatedUser = function () {
            var user;
            var localAuth = localStorage["trueParrot"];
            if (localAuth && localAuth !== 'null') {
                var userJson = JSON.parse(localAuth);
                user = user_1.default.fromJson(userJson);
                this.httpClient.configure(function (http) {
                    http.withHeader('Authorization', 'bearer ' + user.token);
                });
            }
            return user;
        };
        AsyncHttpClient.prototype.authenticate = function (url, user) {
            var _this = this;
            this.httpClient.post(url, user).then(function (response) {
                var status = response.content;
                if (status.success) {
                    var user_2 = user_1.default.fromJson(status.user);
                    user_2.token = status.token;
                    _this.setCurrentUser(user_2);
                    _this.ea.publish(new messages_1.LoginStatus(true, null, user_2));
                }
                else {
                    _this.ea.publish(new messages_1.LoginStatus(false, status.message, null));
                }
            }).catch(function (error) {
                _this.ea.publish(new messages_1.LoginStatus(false, "service not available", null));
            });
        };
        AsyncHttpClient.prototype.clearAuthentication = function () {
            localStorage["trueParrot"] = null;
            this.httpClient.configure(function (configuration) {
                configuration.withHeader("Authorization", "");
            });
        };
        AsyncHttpClient.prototype.setCurrentUser = function (user) {
            localStorage["trueParrot"] = JSON.stringify(user);
            this.httpClient.configure(function (configuration) {
                configuration.withHeader("Authorization", "bearer " + user.token);
            });
        };
        AsyncHttpClient.prototype.get = function (url) {
            return this.httpClient.get(url);
        };
        AsyncHttpClient.prototype.post = function (url, obj) {
            return this.httpClient.post(url, obj);
        };
        AsyncHttpClient.prototype.delete = function (url) {
            return this.httpClient.delete(url);
        };
        AsyncHttpClient.prototype.patch = function (url, obj) {
            return this.httpClient.patch(url, obj);
        };
        AsyncHttpClient = __decorate([
            aurelia_framework_1.autoinject(), 
            __metadata('design:paramtypes', [aurelia_http_client_1.HttpClient, aurelia_event_aggregator_1.EventAggregator, fixtures_1.default])
        ], AsyncHttpClient);
        return AsyncHttpClient;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AsyncHttpClient;
});

define('services/profile',["require", "exports"], function (require, exports) {
    "use strict";
    var Profile = (function () {
        function Profile(user, tweets) {
            this.user = user;
            this.tweets = tweets;
        }
        return Profile;
    }());
    exports.Profile = Profile;
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
define('services/twitterCloneService',["require", "exports", "./user", "aurelia-framework", "aurelia-event-aggregator", "./messages", "./asyncHttpClient", "./tweet", "./profile"], function (require, exports, user_1, aurelia_framework_1, aurelia_event_aggregator_1, messages_1, asyncHttpClient_1, tweet_1, profile_1) {
    "use strict";
    var TwitterCloneService = (function () {
        function TwitterCloneService(ea, httpClient) {
            var _this = this;
            this.ea = ea;
            this.httpClient = httpClient;
            this.currentUser = this.httpClient.getAuthenticatedUser();
            this.tweets = [];
            this.reloadTweets();
            ea.subscribe(messages_1.LoginStatus, function (loginStatus) {
                _this.currentUser = loginStatus.user;
            });
        }
        TwitterCloneService.prototype.isAuthenticated = function () {
            return !!this.currentUser;
        };
        TwitterCloneService.prototype.login = function (email, password) {
            this.httpClient.authenticate('/api/users/authenticate', { email: email, password: password });
        };
        TwitterCloneService.prototype.register = function (email, password, firstName, lastName, description) {
            var _this = this;
            var params = {
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
                description: description,
            };
            this.httpClient.post('/api/users', params).then(function (result) {
                if (result.isSuccess) {
                    _this.login(email, password);
                }
            }).catch(function (error) {
                console.log(error);
            });
        };
        TwitterCloneService.prototype.logout = function () {
            this.httpClient.clearAuthentication();
            this.currentUser = null;
            this.ea.publish(new messages_1.LoginStatus(false, "logout", null));
        };
        TwitterCloneService.prototype.reloadTweets = function () {
            var _this = this;
            this.httpClient.get("/api/tweets").then(function (response) {
                if (response.isSuccess) {
                    _this.tweets = [];
                    for (var _i = 0, _a = response.content; _i < _a.length; _i++) {
                        var tweetJson = _a[_i];
                        var newTweet = tweet_1.default.fromJson(tweetJson);
                        newTweet.updateCurrentUser(_this.currentUser);
                        _this.tweets.push(newTweet);
                    }
                    _this.ea.publish(new messages_1.TweetsChanged(_this.tweets));
                }
            });
        };
        TwitterCloneService.prototype.deleteTweet = function (tweet) {
            var _this = this;
            this.httpClient.delete("/api/tweets/" + tweet.id).then(function (result) {
                if (result.isSuccess) {
                    _this.tweets.forEach(function (existingTweet, index) {
                        if (existingTweet.id == tweet.id) {
                            _this.tweets.splice(index, 1);
                        }
                    });
                    _this.ea.publish(new messages_1.TweetsChanged(_this.tweets));
                }
            });
        };
        TwitterCloneService.prototype.parrotTweet = function (tweet, parroting) {
            var _this = this;
            this.httpClient.patch("/api/tweets/" + tweet.id + "/parrot", { parroting: parroting }).then(function (result) {
                if (result.isSuccess) {
                    _this.tweets.forEach(function (existingTweet) {
                        if (existingTweet.id == tweet.id) {
                            existingTweet.parroting = result.content.parroting;
                        }
                    });
                    _this.ea.publish(new messages_1.TweetsChanged(_this.tweets));
                }
            }).catch(function (error) {
                console.log(error);
            });
        };
        TwitterCloneService.prototype.updateSettings = function (email, firstName, lastName, description, password) {
            var _this = this;
            if (password === void 0) { password = null; }
            var settings = {
                email: email,
                firstName: firstName,
                lastName: lastName,
                description: description,
                password: password,
            };
            this.httpClient.patch("/api/users/" + this.currentUser.id, settings).then(function (result) {
                if (result.isSuccess) {
                    _this.currentUser.firstName = result.content.firstName;
                    _this.currentUser.lastName = result.content.lastName;
                    _this.currentUser.description = result.content.description;
                    _this.currentUser.email = result.content.email;
                }
                _this.httpClient.setCurrentUser(_this.currentUser);
            });
        };
        TwitterCloneService.prototype.getUserProfile = function (userId) {
            var _this = this;
            var profile = new profile_1.Profile(null, null);
            var userUrl = "/api/users/" + userId;
            return this.httpClient.get(userUrl).then(function (result) {
                if (result.isSuccess) {
                    profile.user = user_1.default.fromJson(result.content);
                    return _this.httpClient.get(userUrl + "/tweets");
                }
                else {
                    throw 'could not load profile';
                }
            }).then(function (result) {
                if (result.isSuccess) {
                    profile.tweets = [];
                    for (var _i = 0, _a = result.content; _i < _a.length; _i++) {
                        var tweetJson = _a[_i];
                        profile.tweets.push(tweet_1.default.fromJson(tweetJson));
                    }
                    return profile;
                }
                else {
                    throw 'could not load profile';
                }
            });
        };
        TwitterCloneService.prototype.createTweet = function (message, image) {
            var _this = this;
            if (image === void 0) { image = null; }
            var form = new FormData();
            form.append('json', JSON.stringify({ message: message }));
            if (image) {
                form.append('image', image);
            }
            this.httpClient.post("/api/tweets", form).then(function (result) {
                if (result.isSuccess) {
                    var newTweet = tweet_1.default.fromJson(result.content);
                    _this.tweets.unshift(newTweet);
                    _this.ea.publish(new messages_1.TweetsChanged(_this.tweets));
                }
            });
        };
        TwitterCloneService = __decorate([
            aurelia_framework_1.autoinject(), 
            __metadata('design:paramtypes', [aurelia_event_aggregator_1.EventAggregator, asyncHttpClient_1.default])
        ], TwitterCloneService);
        return TwitterCloneService;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TwitterCloneService;
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
define('app',["require", "exports", "aurelia-framework", "aurelia-router", "./services/twitterCloneService", "aurelia-event-aggregator", "./services/messages"], function (require, exports, aurelia_framework_1, aurelia_router_1, twitterCloneService_1, aurelia_event_aggregator_1, messages_1) {
    "use strict";
    var App = (function () {
        function App(service, ea) {
            var _this = this;
            this.service = service;
            this.ea = ea;
            this.ea.subscribe(messages_1.LoginStatus, function (loginStatus) {
                if (loginStatus.success) {
                    _this.router.navigateToRoute('tweets');
                }
                else {
                    _this.router.navigateToRoute('landing');
                }
            });
        }
        App.prototype.configureRouter = function (config, router) {
            var step = new AuthorizeStep(this.service);
            config.addAuthorizeStep(step);
            config.map([
                {
                    route: 'logout',
                    name: 'logout',
                    moduleId: 'viewmodels/logout/logout',
                    nav: true,
                    title: "Logout",
                },
                {
                    route: 'login',
                    name: 'login',
                    moduleId: 'viewmodels/login/login',
                    nav: true,
                    title: "Login",
                },
                {
                    route: 'signup',
                    name: 'signup',
                    moduleId: 'viewmodels/signup/signup',
                    nav: true,
                    title: "Signup",
                },
                {
                    route: '',
                    name: 'landing',
                    moduleId: 'viewmodels/landing/landing',
                    nav: true,
                    title: "Welcome",
                },
                {
                    route: 'tweets',
                    name: 'tweets',
                    moduleId: 'viewmodels/tweets/tweets',
                    nav: true,
                    title: 'Tweets',
                },
                {
                    route: 'settings',
                    name: 'settings',
                    moduleId: 'viewmodels/settings/settings',
                    nav: true,
                    settings: { auth: true },
                    title: 'Settings',
                },
                {
                    route: 'profile/:id',
                    href: 'profile/:id',
                    name: 'profile',
                    moduleId: 'viewmodels/profile/profile',
                    nav: true,
                    title: 'Profile',
                },
                {
                    route: 'tweet',
                    name: 'tweet',
                    moduleId: 'viewmodels/createTweet/createTweet',
                    nav: true,
                    settings: { auth: true },
                    title: 'Tweet',
                },
            ]);
            this.router = router;
        };
        App = __decorate([
            aurelia_framework_1.autoinject(), 
            __metadata('design:paramtypes', [twitterCloneService_1.default, aurelia_event_aggregator_1.EventAggregator])
        ], App);
        return App;
    }());
    exports.App = App;
    var AuthorizeStep = (function () {
        function AuthorizeStep(service) {
            this.service = service;
        }
        AuthorizeStep.prototype.run = function (navigationInstruction, next) {
            if (navigationInstruction.getAllInstructions().some(function (i) { return i.config.settings.auth; })) {
                var isLoggedIn = this.service.isAuthenticated;
                if (!isLoggedIn) {
                    return next.cancel(new aurelia_router_1.Redirect('login'));
                }
            }
            return next();
        };
        return AuthorizeStep;
    }());
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
define('viewmodels/createTweet/createTweet',["require", "exports", "aurelia-framework", "../../services/twitterCloneService"], function (require, exports, aurelia_framework_1, twitterCloneService_1) {
    "use strict";
    var Login = (function () {
        function Login(service) {
            this.service = service;
        }
        Login.prototype.tweet = function () {
            var image = null;
            if (this.files) {
                image = this.files[0];
            }
            this.service.createTweet(this.message, image);
        };
        Login.prototype.attached = function () {
            runJquery();
        };
        Login = __decorate([
            aurelia_framework_1.autoinject(), 
            __metadata('design:paramtypes', [twitterCloneService_1.default])
        ], Login);
        return Login;
    }());
    exports.Login = Login;
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
define('viewmodels/headerMenu/headerMenu',["require", "exports", "aurelia-framework", "aurelia-event-aggregator", "../../services/messages", "../../services/twitterCloneService"], function (require, exports, aurelia_framework_1, aurelia_event_aggregator_1, messages_1, twitterCloneService_1) {
    "use strict";
    var HeaderMenu = (function () {
        function HeaderMenu(service, ea) {
            var _this = this;
            this.service = service;
            this.ea = ea;
            ea.subscribe(messages_1.LoginStatus, function (loginStatus) {
                _this.currentUser = loginStatus.user;
                _this.loggedIn = loginStatus.success;
            });
        }
        HeaderMenu.prototype.attached = function () {
            this.currentUser = this.service.currentUser;
            this.loggedIn = this.service.isAuthenticated();
            runJquery();
        };
        HeaderMenu = __decorate([
            aurelia_framework_1.autoinject(), 
            __metadata('design:paramtypes', [twitterCloneService_1.default, aurelia_event_aggregator_1.EventAggregator])
        ], HeaderMenu);
        return HeaderMenu;
    }());
    exports.HeaderMenu = HeaderMenu;
});

define('viewmodels/landing/landing',["require", "exports"], function (require, exports) {
    "use strict";
    var Landing = (function () {
        function Landing() {
        }
        Landing.prototype.attached = function () {
            runJquery();
        };
        return Landing;
    }());
    exports.Landing = Landing;
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
define('viewmodels/login/login',["require", "exports", "aurelia-framework", "../../services/twitterCloneService"], function (require, exports, aurelia_framework_1, twitterCloneService_1) {
    "use strict";
    var Login = (function () {
        function Login(service) {
            this.service = service;
        }
        Login.prototype.login = function (event) {
            this.service.login(this.email, this.password);
        };
        Login.prototype.attached = function () {
            runJquery();
        };
        Login = __decorate([
            aurelia_framework_1.autoinject(), 
            __metadata('design:paramtypes', [twitterCloneService_1.default])
        ], Login);
        return Login;
    }());
    exports.Login = Login;
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
define('viewmodels/logout/logout',["require", "exports", "aurelia-framework", "../../services/twitterCloneService"], function (require, exports, aurelia_framework_1, twitterCloneService_1) {
    "use strict";
    var Logout = (function () {
        function Logout(service) {
            this.service = service;
        }
        Logout.prototype.logout = function () {
            this.service.logout();
        };
        Logout.prototype.attached = function () {
            runJquery();
        };
        Logout = __decorate([
            aurelia_framework_1.autoinject(), 
            __metadata('design:paramtypes', [twitterCloneService_1.default])
        ], Logout);
        return Logout;
    }());
    exports.Logout = Logout;
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
define('viewmodels/profile/profile',["require", "exports", "aurelia-framework", "../../services/twitterCloneService"], function (require, exports, aurelia_framework_1, twitterCloneService_1) {
    "use strict";
    var Profile = (function () {
        function Profile(service) {
            this.service = service;
        }
        Profile.prototype.activate = function (params) {
            var _this = this;
            this.service.getUserProfile(params.id).then(function (profile) {
                _this.profile = profile;
                runJquery();
            });
        };
        Profile = __decorate([
            aurelia_framework_1.autoinject(), 
            __metadata('design:paramtypes', [twitterCloneService_1.default])
        ], Profile);
        return Profile;
    }());
    exports.Profile = Profile;
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
define('viewmodels/signup/signup',["require", "exports", "aurelia-framework", "../../services/twitterCloneService"], function (require, exports, aurelia_framework_1, twitterCloneService_1) {
    "use strict";
    var Signup = (function () {
        function Signup(service) {
            this.service = service;
        }
        Signup.prototype.register = function (event) {
            this.service.register(this.email, this.password, this.firstName, this.lastName, this.description);
        };
        Signup.prototype.attached = function () {
            runJquery();
        };
        Signup = __decorate([
            aurelia_framework_1.autoinject(), 
            __metadata('design:paramtypes', [twitterCloneService_1.default])
        ], Signup);
        return Signup;
    }());
    exports.Signup = Signup;
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
define('viewmodels/settings/settings',["require", "exports", "aurelia-framework", "../../services/twitterCloneService"], function (require, exports, aurelia_framework_1, twitterCloneService_1) {
    "use strict";
    var Settings = (function () {
        function Settings(service) {
            this.service = service;
        }
        Settings.prototype.updateCurrentUser = function (user) {
            this.currentUser = user;
            this.email = this.currentUser.email;
            this.firstName = this.currentUser.firstName;
            this.lastName = this.currentUser.lastName;
            this.description = this.currentUser.description;
        };
        Settings.prototype.attached = function () {
            this.updateCurrentUser(this.service.currentUser);
            runJquery();
        };
        Settings.prototype.saveSettings = function () {
            this.service.updateSettings(this.email, this.firstName, this.lastName, this.description, this.password);
        };
        Settings = __decorate([
            aurelia_framework_1.autoinject(), 
            __metadata('design:paramtypes', [twitterCloneService_1.default])
        ], Settings);
        return Settings;
    }());
    exports.Settings = Settings;
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
define('viewmodels/tweets/tweets',["require", "exports", "aurelia-framework", "../../services/twitterCloneService", "aurelia-event-aggregator", "../../services/messages"], function (require, exports, aurelia_framework_1, twitterCloneService_1, aurelia_event_aggregator_1, messages_1) {
    "use strict";
    var Tweets = (function () {
        function Tweets(service, ea) {
            var _this = this;
            this.service = service;
            ea.subscribe(messages_1.TweetsChanged, function (message) {
                _this.tweets = message.tweets;
            });
            this.tweets = service.tweets;
            this.service.reloadTweets();
            this.currentUser = this.service.currentUser;
        }
        Tweets.prototype.attached = function () {
            this.currentUser = this.service.currentUser;
            runJquery();
        };
        Tweets = __decorate([
            aurelia_framework_1.autoinject(), 
            __metadata('design:paramtypes', [twitterCloneService_1.default, aurelia_event_aggregator_1.EventAggregator])
        ], Tweets);
        return Tweets;
    }());
    exports.Tweets = Tweets;
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
define('viewmodels/tweetCard/tweetCard',["require", "exports", "aurelia-framework", "../../services/twitterCloneService", "aurelia-router"], function (require, exports, aurelia_framework_1, twitterCloneService_1, aurelia_router_1) {
    "use strict";
    var TweetCard = (function () {
        function TweetCard(service, router) {
            this.service = service;
            this.router = router;
        }
        TweetCard.prototype.activate = function (model) {
            this.currentUser = model.currentUser;
            this.tweet = model.tweet;
        };
        TweetCard.prototype.delete = function () {
            this.service.deleteTweet(this.tweet);
        };
        TweetCard.prototype.parrot = function () {
            if (this.service.isAuthenticated()) {
                this.service.parrotTweet(this.tweet, true);
            }
            else {
                this.router.navigateToRoute('login');
            }
        };
        TweetCard.prototype.unParrot = function () {
            if (this.service.isAuthenticated()) {
                this.service.parrotTweet(this.tweet, false);
            }
            else {
                this.router.navigateToRoute('login');
            }
        };
        TweetCard = __decorate([
            aurelia_framework_1.autoinject(), 
            __metadata('design:paramtypes', [twitterCloneService_1.default, aurelia_router_1.Router])
        ], TweetCard);
        return TweetCard;
    }());
    exports.TweetCard = TweetCard;
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

define('text!app.html', ['module'], function(module) { module.exports = "<template>\n  <compose view-model=\"./viewmodels/headerMenu/headerMenu\"></compose>\n\n  <section class=\"ui container\" id=\"main-content\">\n    <router-view></router-view>\n  </section>\n\n  <compose view=\"./viewmodels/footerMenu/footerMenu.html\"></compose>\n</template>\n"; });
define('text!viewmodels/createTweet/createTweet.html', ['module'], function(module) { module.exports = "<template>\n  <section class=\"ui raised segment fill\">\n    <form submit.delegate=\"tweet()\" class=\"ui form\">\n      <h3 class=\"ui dividing header\">Share your mind with the world!</h3>\n      <div class=\"field\">\n        <label>Message (max. 140 Characters)</label>\n        <input placeholder=\"Message\" value.bind=\"message\" type=\"text\" name=\"message\">\n      </div>\n      <div class=\"field\">\n        <label>Image (optional)</label>\n        <input type=\"file\" name=\"image\" files.bind=\"files\">\n      </div>\n      <button class=\"ui blue submit button\">Post</button>\n    </form>\n  </section>\n</template>\n"; });
define('text!viewmodels/headerMenu/headerMenu.html', ['module'], function(module) { module.exports = "<template>\n  <header class=\"ui fixed menu above\">\n    <menu class=\"ui container\">\n      <a class=\"header item\" route-href=\"route: tweets\">\n        <img class=\"logo\" src=\"./images/parrot.svg\"/>\n        True Parrot\n      </a>\n      <a class=\"header item\" route-href=\"route: tweet\" show.bind=\"loggedIn\">\n        Tweet\n      </a>\n\n      <a class=\"header item\" href=\"/admin/dashboard\" show.bind=\"loggedIn && currentUser.isAdmin\">\n        Admin Dashboard\n      </a>\n\n      <div class=\"right menu\">\n        <!-- Logged in navigation -->\n        <div class=\"ui dropdown item\" show.bind=\"loggedIn\">\n          <a route-href=\"route: profile;\n                         params.bind: {id: currentUser.id}\">\n            <img class=\"ui avatar image\" src=\"${currentUser.gravatar}\"/>\n            ${currentUser.fullName}\n          </a>\n          <i class=\"ui dropdown icon\"></i>\n\n          <div class=\"menu\">\n            <a class=\"item\" route-href=\"route: profile;\n                                        params.bind: {id: currentUser.id}\">\n              Profile\n            </a>\n            <a class=\"item\" route-href=\"route: settings\">Settings</a>\n            <div class=\"divider\"></div>\n            <a class=\"item\" route-href=\"route: logout\">Logout</a>\n          </div>\n        </div>\n\n        <!-- Not logged in navigation -->\n        <a class=\"item\" route-href=\"route: login\" show.bind=\"!loggedIn\">\n          Log-in\n        </a>\n        <a class=\"item\" route-href=\"route: signup\" show.bind=\"!loggedIn\">\n          Sign up\n        </a>\n      </div>\n    </menu>\n  </header>\n</template>\n"; });
define('text!viewmodels/footerMenu/footerMenu.html', ['module'], function(module) { module.exports = "<template>\n  <footer class=\"ui inverted vertical footer segment\">\n    <menu class=\"ui container\">\n      <div class=\"ui inverted stackable divided grid\">\n        <div class=\"eight wide column\">\n          <h4 class=\"ui inverted header\">Copyright</h4>\n          <div class=\"ui inverted link list\">\n            <p class=\"item\">Author: Florian Fritz</p>\n            <p class=\"item\">License: MIT</p>\n            <p class=\"item\">\n              Source:\n              <a href=\"https://github.com/FritzFlorian/true-parrot/\">https://github.com/FritzFlorian/true-parrot-spa</a>\n            </p>\n          </div>\n        </div>\n        <div class=\"eight wide column\">\n          <h4 class=\"ui inverted header\">Mentions/References</h4>\n          <div class=\"ui inverted link list\">\n            <p class=\"item\">\n              Most images, logos, designs and technical effects are open source resources from other people.\n              Please see the <a href=\"https://github.com/FritzFlorian/true-parrot-spa\">Github Readme</a> for details.\n            </p>\n          </div>\n        </div>\n      </div>\n    </menu>\n  </footer>\n</template>\n"; });
define('text!viewmodels/landing/landing.html', ['module'], function(module) { module.exports = "<template>\n  <div id=\"fullscreen-image\">\n  </div>\n\n  <div class=\"center-both landig-page\" style=\"z-index: 1;\">\n    <h1>True Parrot</h1>\n    <h2>Exchange news and status updates with people from all around the world!</h2>\n    <a route-href=\"route: signup\">\n      <button class=\"ui massive button\">Join Now!</button>\n    </a>\n    </br>\n    <a route-href=\"route: tweets\">...or read without login</a>\n  </div>\n</template>\n"; });
define('text!viewmodels/login/login.html', ['module'], function(module) { module.exports = "<template>\n  <section class=\"ui raised segment fill\">\n    <form submit.delegate=\"login($event)\" class=\"ui form\">\n      <h3 class=\"ui dividing header\">Login</h3>\n      <div class=\"field\">\n        <label>Email</label>\n        <input placeholder=\"Email\" type=\"text\" name=\"email\" value.bind=\"email\">\n      </div>\n      <div class=\"field\">\n        <label>Password</label>\n        <input type=\"password\" name=\"password\" value.bind=\"password\" placeholder=\"Password\">\n      </div>\n      <button class=\"ui blue submit button\">Submit</button>\n    </form>\n  </section>\n</template>\n"; });
define('text!viewmodels/logout/logout.html', ['module'], function(module) { module.exports = "<template>\n\n  <form submit.delegate=\"logout($event)\" class=\"ui stacked segment form\">\n    <h3 class=\"ui header\">Are you sure you want to log out?</h3>\n    <button class=\"ui blue submit button\">Logout</button>\n  </form>\n\n</template>\n"; });
define('text!viewmodels/profile/profile.html', ['module'], function(module) { module.exports = "<template>\n  <section class=\"ui raised segment\">\n    <div class=\"ui stackable column grid\">\n      <div class=\"six wide column\">\n        <div class=\"ui sticky\" style=\"padding: 10px;\">\n          <div class=\"ui fluid card\">\n            <div class=\"image\">\n              <img src=\"${profile.user.bigGravatar}\">\n            </div>\n            <div class=\"content\">\n              <a class=\"header\" route-href=\"route: profile;\n                                    params.bind: {id: profile.user.id}\">${profile.user.fullName}</a>\n              <div class=\"meta\">\n                <span class=\"date\">Joined ${profile.user.createdAt}</span>\n              </div>\n              <div class=\"description\">\n                ${profile.user.description}\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"ten wide column\">\n        <div class=\"ui two column stackable grid\">\n          <div class=\"column\" repeat.for=\"tweet of profile.tweets\">\n            <compose view-model=\"../tweetCard/tweetCard\"\n                     model.bind=\"{ currentUser: currentUser, tweet: tweet}\"></compose>\n          </div>\n        </div>\n      </div>\n\n    </div>\n  </section>\n</template>\n"; });
define('text!viewmodels/settings/settings.html', ['module'], function(module) { module.exports = "<template>\n  <section class=\"ui raised segment\">\n    <form submit.delegate=\"saveSettings($event)\" class=\"ui form\">\n      <h3 class=\"ui dividing header\">Register</h3>\n      <div class=\"field\">\n        <label>Name</label>\n        <div class=\"two fields\">\n          <div class=\"field\">\n            <input placeholder=\"First Name\" type=\"text\" name=\"firstName\" value.bind=\"firstName\">\n          </div>\n          <div class=\"field\">\n            <input placeholder=\"Last Name\" type=\"text\" name=\"lastName\" value.bind=\"lastName\">\n          </div>\n        </div>\n      </div>\n      <div class=\"field\">\n        <label>Email</label>\n        <input placeholder=\"Email\" type=\"text\" name=\"email\" value.bind=\"email\">\n      </div>\n      <div class=\"field\">\n        <label>Description</label>\n        <input placeholder=\"Short Profile Description\" type=\"text\" name=\"description\" value.bind=\"description\">\n      </div>\n      <div class=\"field\">\n        <label>Password</label>\n        <input type=\"password\" name=\"password\" placeholder=\"Password\" value.bind=\"password\">\n      </div>\n      <button class=\"ui blue submit button\">Submit</button>\n    </form>\n  </section>\n</template>\n"; });
define('text!viewmodels/signup/signup.html', ['module'], function(module) { module.exports = "<template>\n  <section class=\"ui raised segment\">\n    <form submit.delegate=\"register($event)\" class=\"ui form\">\n      <h3 class=\"ui dividing header\">Register</h3>\n      <div class=\"field\">\n        <label>Name</label>\n        <div class=\"two fields\">\n          <div class=\"field\">\n            <input placeholder=\"First Name\" type=\"text\" name=\"firstName\" value.bind=\"firstName\">\n          </div>\n          <div class=\"field\">\n            <input placeholder=\"Last Name\" type=\"text\" name=\"lastName\" value.bind=\"lastName\">\n          </div>\n        </div>\n      </div>\n      <div class=\"field\">\n        <label>Email</label>\n        <input placeholder=\"Email\" type=\"text\" name=\"email\" value.bind=\"email\">\n      </div>\n      <div class=\"field\">\n        <label>Description</label>\n        <input placeholder=\"Short Profile Description\" type=\"text\" name=\"description\" value.bind=\"description\">\n      </div>\n      <div class=\"field\">\n        <label>Password</label>\n        <input type=\"password\" name=\"password\" placeholder=\"Password\" value.bind=\"password\">\n      </div>\n      <button class=\"ui blue submit button\">Submit</button>\n    </form>\n  </section>\n</template>\n"; });
define('text!viewmodels/tweetCard/tweetCard.html', ['module'], function(module) { module.exports = "<template>\n  <div class=\"ui fluid card\">\n    <div class=\"content\">\n      <div class=\"right floated meta\">${tweet.createdAt}</div>\n      <a href=\"/users/{{creator._id}}\">\n        <img class=\"ui avatar image\" src=\"${tweet.creator.gravatar}\">\n        ${tweet.creator.fullName}\n      </a>\n    </div>\n    <div class=\"content\">\n      <p>${tweet.message}</p>\n    </div>\n    <div class=\"image\" show.bind=\"tweet.image\">\n      <img src=\"${tweet.image}\">\n    </div>\n    <div class=\"extra content\">\n      <a show.bind=\"tweet.canUserDeletePost\" click.delegate=\"delete($event)\">\n        <i class=\"big trash icon\"></i>\n        Delete\n      </a>\n\n      <a class=\"right floated\" click.delegate=\"unParrot($event)\" show.bind=\"tweet.hasParrotedTweet\">\n        <img class=\"ui icon image\" src=\"./images/parrot_round_highlight.svg\"/>\n\n        ${tweet.parroting.length} parroting\n      </a>\n      <a class=\"right floated\" click.delegate=\"parrot($event)\" show.bind=\"!tweet.hasParrotedTweet\"/>\n        <img class=\"ui icon image\" src=\"./images/parrot_round.svg\"/>\n\n        ${tweet.parroting.length} parroting\n      </a>\n    </div>\n  </div>\n</template>\n"; });
define('text!viewmodels/tweets/tweets.html', ['module'], function(module) { module.exports = "<template>\n  <section class=\"ui raised segment\">\n    <div class=\"ui three column grid\">\n      <div class=\"column\" repeat.for=\"tweet of tweets\">\n        <compose view-model=\"../tweetCard/tweetCard\"\n                  model.bind=\"{ currentUser: currentUser, tweet: tweet}\"></compose>\n      </div>\n    </div>\n  </section>\n</template>\n"; });
//# sourceMappingURL=app-bundle.js.map