/*
* Copyright (c) 2013 Marco van Hylckama Vlieg
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
*
* You may obtain a copy of the License at:
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*
* See the License for the specific language governing permissions and
* limitations under the License.
*/

(function() {	
	var weathericons = {
		"200" : ["thunder.png", "rain_medium.png"],
		"201" : ["thunder.png", "rain_heavy.png"],
		"202" : ["thunder.png", "rain_heavy.png"],
		"210" : ["thunder.png"],
		"211" : ["thunder.png"],
		"212" : ["thunder.png"],
		"221" : ["thunder.png"],
		"230" : ["thunder.png", "drizzle.png"],
		"231" : ["thunder.png", "drizzle.png"],
		"232" : ["thunder.png", "drizzle.png"],
		"300" : ["drizzle.png"],
		"301" : ["drizzle.png"],
		"302" : ["drizzle.png"],
		"310" : ["rain_medium.png"],
		"311" : ["rain_heavy.png"],
		"312" : ["rain_heavy.png"],
		"321" : ["showers.png"],
		"500" : ["rain_medium.png"],
		"502" : ["rain_heavy.png"],
		"503" : ["rain_heavy.png"],
		"504" : ["rain_heavy.png"],
		"511" : ["rain_medium.png"],
		"520" : ["showers.png"],
		"521" : ["showers.png"],
		"522" : ["showers.png"],
		"600" : ["snow.png"],
		"601" : ["snow.png"],
		"602" : ["snow_strong.png"],
		"622" : ["snow.png"],
		"611" : ["sleet.png"],
		"621" : ["showers.png"],
		"701" : ["mist.png"],
		"711" : ["mist.png"],
		"721" : ["haze.png"],
		"731" : ["mist.png"],
		"741" : ["fog.png"],
		"800" : ["clear_day.png"],
		"801" : ["half_day.png"],
		"802" : ["half_day.png"],
		"803" : ["half_day.png"],
		"804" : ["cloudy.png"],
		"900" : ["tornado.png"],
		"901" : ["tornado.png"],
		"902" : ["tornado.png"],
		"903" : [""],
		"904" : [""],
		"905" : ["wind.png"],
		"906" : ["hail.png"]
	}
	var weathercodes = {
		"200" : "fucking <strong>thunderstorms</strong> with a bit of rain",
		"201" : "fucking <strong>thunderstorms</strong> and it's pissing down",
		"202" : "fucking <strong>thunderstorms</strong> with apocalyptic rain",
		"210" : "wannabe <strong>thunderstorms</strong>",
		"211" : "a fucking <strong>thunderstorm</strong>",
		"212" : "a heavy fucking <strong>thunderstorm</strong>",
		"221" : "a fucking ragged <strong>thunderstorm</strong>",
		"230" : "a fucking <strong>thunderstorm</strong> with light drizzle",
		"231" : "a fucking <strong>thunderstorm</strong> with drizzle",
		"232" : "a fucking <strong>thunderstorm</strong> with heavy drizzle",
		"300" : "light fucking <strong>drizzle</strong>",
		"301" : "fucking <strong>drizzle</strong>",
		"302" : "heavy fucking <strong>drizzle</strong>",
		"310" : "it's <strong>pissing down</strong> lightly",
		"311" : "it's <strong>pissing down</strong>",
		"312" : "it's <strong>pissing down</strong> heavily",
		"321" : "<strong>Pissing showers</strong>",
		"500" : "it's <strong>pissing down</strong> lightly",
		"501" : "it's <strong>pissing down</strong> moderately",
		"502" : "it's <strong>fucking raining</strong> right now",
		"503" : "it's <strong>fucking raining</strong>, monsoon style",
		"504" : "there is an <strong>apocalyptic downpour</strong>. Prepare your fucking boats",
		"511" : "there's freezing fucking <strong>rain</strong>",
		"520" : "there are light fucking <strong>showers</strong>",
		"521" : "there are fucking <strong>showers</strong>",
		"522" : "there are heavy fucking <strong>showers</strong>",
		"600" : "there is fucking <strong>light snow</strong>",
		"601" : "fucking <strong>snow</strong>",
		"602" : "tons of fucking <strong>snow</strong>",
		"622" : "tons of fucking <strong>shower snow</strong>",
		"611" : "fucking <strong>sleet</strong>",
		"621" : "nasty fucking <strong>shower sleet</strong>",
		"701" : "fucking <strong>mist</strong>",
		"711" : "fucking <strong>smoke</strong>",
		"721" : "fucking <strong>haze</strong>",
		"731" : "fucking <strong>sand/dust whirls</strong>",
		"741" : "yay, fucking <strong>fog</strong>",
		"800" : "clear fucking <strong>skies</strong>",
		"801" : "a few fucking <strong>clouds</strong>",
		"802" : "scattered fucking <strong>clouds</strong>",
		"803" : "broken fucking <strong>clouds</strong>",
		"804" : "fucking <strong>overcast clouds</strong>",
		"900" : "a fucking <strong>tornado</strong> rages",
		"901" : "a fucking <strong>tropical storm</strong> is raging",
		"902" : "a fucking <strong>hurricane</strong> is raging",
		"903" : "extreme fucking <strong>cold</strong>",
		"904" : "extreme fucking <strong>heat</strong>",
		"905" : "it's <strong>windy</strong> as fuck",
		"906" : "fucking <strong>hail</strong>"
	}

	var temperatures = [];
	temperatures[0] = "Hell is <strong>freezing</strong> over.";
	temperatures[1] = "<strong>Cold</strong> as fuck.";
	temperatures[2] = "Damn <strong>chilly</strong>.";
	temperatures[3] = "Sort of ok.";
	temperatures[4] = "Pretty damn <strong>nice</strong>.";
	temperatures[5] = "Pretty damn <strong>hot</strong>.";
	temperatures[6] = "<strong>Hot</strong> as fuck.";

	function appWorld() {
		// fire up appWorld with Screamager
		blackberry.invoke.invoke({
			uri: "http://appworld.blackberry.com/webstore/content/22052928"
			}, onInvokeSuccess, onInvokeError);
		};
		function onInvokeSuccess() {
			console.log("Invocation successful!");
		}
		function onInvokeError(error) {
			console.log("Invocation failed, error: " + error);
		}

		function getWeather() {
		    
		    $('#weather').html('<div id="loader"><div id="floatingCirclesG"><div class="f_circleG" id="frotateG_01"></div><div class="f_circleG" id="frotateG_02"></div><div class="f_circleG" id="frotateG_03"></div><div class="f_circleG" id="frotateG_04"></div><div class="f_circleG" id="frotateG_05"></div><div class="f_circleG" id="frotateG_06"></div><div class="f_circleG" id="frotateG_07"></div><div class="f_circleG" id="frotateG_08"></div></div><p id="fetching">Fetching the obvious. Please wait. Be patient, it may take a while.</p>');
		    
			var loc = navigator.geolocation.getCurrentPosition(showWeather);
			function showWeather(position) {
				var lat = Math.round(position.coords.latitude*10000)/10000;
				var lon = Math.round(position.coords.longitude*10000)/10000;				
				$.getJSON('http://api.openweathermap.org/data/2.1/find/city?lat=' + lat +  '&lon=' + lon + '&cnt=1', function(data) {
					var tempnode;
					var tempicon;
					var weather = '';
					var weathericonstrip = '';
					var out;
					var weatheritems = 0;
					var datetest = new Date();
					var dot = '';
					var d = new Date();
					var hours = d.getHours();
					var minutes = d.getMinutes();
					var seconds = d.getSeconds();
					if (hours < 10) {hours = '0' + hours;}
					if (minutes < 10) {minutes = '0' + minutes;}
					if (seconds < 10) {seconds = '0' + seconds;}
					
					var bbmmessage = 'My weather:';
					if(data.list[0].weather) {
						for(var i=0;i<data.list[0].weather.length;i++) {
							if(i == data.list[0].weather.length-1) {
								dot = '.';
							}
							if(weatheritems > 0) {
								weather += '<div class="weatherdescription"> and ' + weathercodes[data.list[0].weather[i].id].replace(/fucking/,'bloody') + dot + '</div>';
								bbmmessage = bbmmessage + ' and ' + weathercodes[data.list[0].weather[i].id].replace(/fucking/,'bloody') + dot;
							}
							else {
								weatheritems++;
								weather += '<div class="weatherdescription">' + weathercodes[data.list[0].weather[i].id].charAt(0).toUpperCase() + weathercodes[data.list[0].weather[i].id].slice(1) + dot + '</div>';				
								bbmmessage = bbmmessage + weathercodes[data.list[0].weather[i].id].charAt(0).toUpperCase() + weathercodes[data.list[0].weather[i].id].slice(1) + dot;			
							}
							for(var k=0;k<weathericons[data.list[0].weather[i].id].length;k++) {
								if(!weathericonstrip.match(weathericons[data.list[0].weather[i].id][k])) {
									weathericonstrip = weathericonstrip + '<img src="img/' + weathericons[data.list[0].weather[i].id][k] + '" />';
								}
							}
						}

						if(datetest.getHours() > 18 || datetest.getHours() < 7) {
							weathericonstrip = weathericonstrip.replace(/day/g, 'night');
						}
						avg_temp = ((data.list[0].main.temp_max + data.list[0].main.temp_min) / 2) - 273.15;
						if(avg_temp < -10) {
							tempnote = temperatures[0];
							bbmmessage = bbmmessage + ' ' + temperatures[0];
							tempicon = '<img src="img/temp_0.png" />';  
						}
						if(avg_temp > -10 && avg_temp <= 0) {
							tempnote = temperatures[1];
							bbmmessage = bbmmessage + ' ' + temperatures[1];
							tempicon = '<img src="img/temp_1.png" />';  
						}
						if(avg_temp > 0 && avg_temp <= 10) {
							tempnote = temperatures[2];
							bbmmessage = bbmmessage + ' ' + temperatures[2];
							tempicon = '<img src="img/temp_2.png" />';  
						}
						if(avg_temp > 10 && avg_temp <= 18) {
							tempnote = temperatures[3];
							bbmmessage = bbmmessage + ' ' + temperatures[3];
							tempicon = '<img src="img/temp_3.png" />';  
						}	
						if(avg_temp > 18 && avg_temp <= 25) {
							tempnote = temperatures[4];
							bbmmessage = bbmmessage + ' ' + temperatures[4];
							tempicon = '<img src="img/temp_4.png" />';  
						}	
						if(avg_temp > 25 && avg_temp <= 32) {
							tempnote = temperatures[5];
							bbmmessage = bbmmessage + ' ' + temperatures[5];
							tempicon = '<img src="img/temp_5.png" />';  
						}	
						if(avg_temp > 32) {
							tempnote = temperatures[6];
							bbmmessage = bbmmessage + ' ' + temperatures[6];
							tempicon = '<img src="img/temp_5.png" />';  
						}		
					}
					bbmmessage = bbmmessage.replace(/<(?:.|\n)*?>/gm, '');
					out = '<div class="weathericons">' + weathericonstrip + '</div>';
					out = out + '<div id="weatherpanel">';
					out = out + '<p id="loc">You are somewhere near ' + data.list[0].name + '.</p>';
					out = out + '<p id="myweather">My weather right now (' + hours + ':' + minutes + ':' + seconds + ') :</p>';
					out = out + '<div class="weathertext">' + weather + '</div>';
					out = out + '<div class="temp">' + tempicon + '<div class="temptext">' + tempnote + '</div></div>';
					out = out + '<div class="footnote">I could look outside for more information...</div>';
					out = out + '<div class="poweredby">The Last Weather App. By Marco van Hylckama Vlieg.<br/>Only on BlackBerry&reg; 10</div>';
					out = out + '</div>';
					out = out + '<div id="refresh"></div><div id="share"></div><div id="bbm"></div><div id="info"></div>'
					$('#weather').html(out);
					$('#loc, #bbm, #info, #share, #refresh').hide();
					html2canvas(document.getElementById('weather'), {
						// first, create a canvas version of the weather screen
						onrendered: function(canvas) {
							// second, save the canvas as an image
							saveCanvas(canvas);
							$('.footnote').html('You can look outside for more information.');
							$('#loc, #bbm, #info, #share, #refresh').show();
							$('.poweredby, #myweather').remove();
						}
					});

					$('#weather').after('<div id="infoscreen"><h1>The <strong>Last</strong> Weather App</h1><p>By Marco van Hylckama Vlieg</p><p>Copyright &copy; 2013</p><p>Based on an idea by Tobias van Schneider</p><p>Powered by <strong>openweathermap.org</strong></p><div id="applink">Love this? Try Screamager! <img src="img/scrmicon.png"></div><div id="returnbtn">&raquo; Return</div></div><div id="bbmscreen"><h2>BBM</h2><ul><li id="bbmupdate">&raquo; Set Personal Weather Message</li><li id="bbmdownload">&raquo; Invite to Download</li><li id="return">&raquo; Return</li></ul></div>');

					$('#infoscreen, #bbmscreen').hide();

					$('#returnbtn, #bbmscreen li, #applink')
					.bind('touchstart', function(e) {
						e.target.style.background = '#cccccc';
					})
					.bind('touchend', function(e) {
						e.target.style.background = 'transparent';
					});

					$(document)
					.bind('touchend', function(e) {
						var request;

						switch(e.target.id) {
							case 'info':
							$('#weather, #bbmscreen').hide();
							$('#infoscreen').show();
							break;

							case 'returnbtn':
							$('#weather').show();
							$('#infoscreen, #bbmscreen').hide();
							break;

							case 'refresh':
							$(document).unbind();
							$('body').html('<div id="weather"></div>');
							getWeather();
							break;

							case 'bbm':
							$('#weather, #infoscreen').hide();
							$('#bbmscreen').show();	
							break;

							case 'share':
							// use invoke framework to share the previously created image of the user's current weather situation
							request = {
								action: 'bb.action.SHARE',
								uri: 'file://' + blackberry.io.sharedFolder + '/documents/tlwa.png',
								target_type: ["CARD"]
							};		
							blackberry.invoke.card.invokeTargetPicker(request, 'Share your misery',
							// success
							function() {},

							// error
							function(e) {
								console.log(e);
							});
							break;
							case 'return':
							$('#weather').show();
							$('#infoscreen, #bbmscreen').hide();
							break;
							case 'bbmupdate':
							if(bbm.registered) {
								bbm.save(bbmmessage);
							}
							break;
							case 'bbmdownload':
							if(bbm.registered) {
								bbm.inviteToDownload();
							}
							break;
							case 'applink':
							appWorld();
							break;
							default:
							break;
						}
					});
				}).error(function(){
					out = '<div class="weathertext">Error fetching the weather.</div><div class="footnote">Looks like you\'re gonna have to look outside after all.</div>';
					$('#weather').html(out);
				});
			}
		}
				
		$(document).ready(function() {
			getWeather();
		});
		})();