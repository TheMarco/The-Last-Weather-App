/* 
    This code comes from http://kybernetikos.github.com/SolarPosition/ 
    It's used to calculate whether it's day or night based on latitude, 
    longitude and timezone.
    I'd mention the guy's name if it was listed anywhere.

*/

var Time = (function() {

	function Time(dayFraction) {
		this.dayFraction = dayFraction - Math.floor(dayFraction);
	}

	function pad(str, len) {
		return ("000".substring(3 - (len - str.toString().length))) + str;
	}

	Time.prototype.toHours = function() {
		return this.dayFraction * 24;
	};

	Time.prototype.addHours = function(hrs) {
		return new Time(this.dayFraction + (hrs / 24));
	};

	Time.prototype.toString = function() {
		return this.toHMS().toString();
	};

	Time.prototype.toHMS = function() {
		var floor = Math.floor;
		var remainingDayFrac = this.dayFraction;

		remainingDayFrac = remainingDayFrac * 24;
		var hour = floor(remainingDayFrac);
		remainingDayFrac -= hour;

		remainingDayFrac *= 60;
		var minute = floor(remainingDayFrac);
		remainingDayFrac -= minute;

		remainingDayFrac *= 60;
		var second = floor(remainingDayFrac);
		remainingDayFrac -= second;

		var millisecond = floor(remainingDayFrac * 1000);

		return {
			hour:hour, minute:minute, second:second, millisecond: millisecond,
			toString: function() {return pad(hour, 2)+":"+pad(minute, 2)+":"+pad(second, 2)+"."+pad(millisecond, 3)}
		};
	};

	Time.prototype.changeTimeZone = function(fromTzHr, toTzHr) {
		return this.addHours(toTzHr - fromTzHr);
	};

	Time.prototype.valueOf = function() {
		return this.dayFraction;
	};

	Time.fromValues = function(hour, minute, second, millisecond) {
		return new Time(((hour || 0) + ((minute || 0) + ((second || 0)+ (millisecond || 0) / 1000) / 60) / 60) / 24);
	};

	Time.fromHMS = function(hms) {
		return Time.fromValues(hms.hour, hms.minute, hms.second, hms.millisecond);
	};

	Time.fromDate = function(date) {
		date = date || new Date();
		return Time.fromValues(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
	};

	return Time;

})();
var JulianDay = (function() {

	var floor = Math.floor;

	function JulianDay(day) {
		if (typeof day == 'string' && day.substring(0, 2) == "JD") day = Number(day.substring(2));
		this.day = day;
	}

	JulianDay.prototype.century = function() {
		return (this.day - 2451545.0) / 36525.0;
	};

	JulianDay.prototype.ephemerisDay = function(delta_t) {
		return this.day + delta_t / 86400.0;
	};

	JulianDay.prototype.ephemerisCentury = function(delta_t) {
		return (this.ephemerisDay(delta_t) - 2451545) / 36525;
	};

	JulianDay.prototype.ephemerisMillennium = function(delta_t) {
		return this.ephemerisCentury(delta_t) / 10;
	};

	JulianDay.prototype.valueOf = function() {
		return this.day;
	};

	JulianDay.prototype.getTime = function() {
		return new Time(this.day);
	};

	JulianDay.prototype.toString = function() {
		return "JD"+this.day;
	};

	JulianDay.prototype.setTime = function(time) {
		return new JulianDay(floor(this.day - 0.5) + 0.5 + time.valueOf());
	};

	JulianDay.prototype.add = function(days) {
		return new JulianDay(this.day + days);
	};

	JulianDay.prototype.toDate = function() {
		var tmp = this.day + 0.5;
		var z = floor(tmp);
		var f = tmp - z;
		var A;
		if (z < 2299161) {
			A = z;
		} else {
			var B = floor((z - 1867216.25) / 36524.25);
			A = z + 1 + B - floor(B / 4);
		}
		var C = A + 1524;
		var D = floor((C - 122.1) / 365.25);
		var G = floor(D * 365.25);
		var I = floor((C - G) / 30.6001);
		var d = C - G - floor(30.6001 * I ) + f;
		var m = (I < 14) ? I - 1 : I - 13;
		var y = (m > 2) ? D - 4716 : D - 4715;

		var dayInMillis = d * 24 * 60 * 60 * 1000;

		return new Date(Date.UTC(y, m - 1, 0, 0, 0, 0, dayInMillis));
	};

	JulianDay.fromDate = function(date) {
		date = date || new Date();
		return JulianDay.fromValues(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds(), date.getTimezoneOffset() / -60);
	};

	JulianDay.fromValues = function(year, month, day, hour, minute, second, millisecond, tz) {
		tz = tz || 0;
		millisecond = millisecond || 0;

		var day_decimal = day + (hour - tz + (minute + (second + millisecond / 1000) / 60) / 60) / 24;
		if (month < 3) {
			month += 12;
			year--;
		}
		var julian_day = floor(365.25 * (year + 4716.0)) + floor(30.6001 * (month+1)) + day_decimal - 1524.5;
		if (julian_day > 2299160.0) {
			var a = floor(year/100);
			julian_day += (2 - a + floor(a/4));
		}
		return new JulianDay(julian_day);
	};

	return JulianDay;
})();
var SolarPosition = (function() {

	// Import the math functions.
	var floor = Math.floor, abs = Math.abs, cos = Math.cos, sin = Math.sin;
	var pow = Math.pow, acos = Math.acos, atan2 = Math.atan2, tan = Math.tan;
	var atan = Math.atan, asin = Math.asin, PI = Math.PI;

	var SUN_RADIUS = 0.26667;

	var L_COUNT = 6, B_COUNT = 2, R_COUNT = 5, Y_COUNT = 63;
	var TERM_A = 0, TERM_B = 1, TERM_C = 2;
	var TERM_X0 = 0, TERM_X1 = 1, TERM_X2 = 2, TERM_X3 = 3, TERM_X4 = 4, TERM_X_COUNT = 5;
	var TERM_PSI_A = 0, TERM_PSI_B = 1, TERM_EPS_C = 2, TERM_EPS_D = 3;
	var SUN_TRANSIT = 0, SUN_RISE = 1, SUN_SET = 2, SUN_COUNT = 3;
	var TERM_Y_COUNT = TERM_X_COUNT;

	var l_subcount = [64, 34, 20, 7, 3, 1];
	var b_subcount = [5, 2];
	var r_subcount = [40, 10, 6, 2, 1];

	function rad2deg(radians) {
		return (180.0 / PI) * radians;
	}

	function deg2rad(degrees) {
		return (PI / 180.0) * degrees;
	}

	function limitDegrees(degrees) {
		degrees /= 360.0;
		var limited = 360.0 * (degrees - floor(degrees) );
		if (limited < 0) limited += 360.0;
		return limited;
	}

	function limitDegrees180pm(degrees) {
		degrees /= 360.0;
		var limited = 360.0 * (degrees - floor(degrees));
		if (limited < -180.0) {
			limited += 360.0;
		} else if (limited > 180.0) {
			limited -= 360.0;
		}
		return limited;
	}

	function limitDegrees180(degrees) {
		degrees /= 180.0;
		var limited = 180.0 * (degrees - floor(degrees));
		if (limited < 0) limited += 180.0;
		return limited;
	}

	function limitZero2one(value) {
		var limited = value - floor(value);
		if (limited < 0) limited += 1.0;
		return limited;
	}

	function limitMinutes(minutes) {
		var limited = minutes;
		if (limited < -20.0) {
			limited += 1440.0;
		} else if (limited > 20.0) {
			limited -= 1440.0;
		}
		return limited;
	}

	function thirdOrderPolynomial(a, b, c, d, x) {
		return ((a * x + b) * x + c) * x + d;
	}

	function earthPeriodicTermSummation(terms, count, jme) {
		var sum = 0;
		for (var i = 0; i < count; i++) {
			sum += terms[i][TERM_A] * cos(terms[i][TERM_B] + terms[i][TERM_C] * jme);
		}
		return sum;
	}

	function earthValues(term_sum, count, jme) {
		var sum = 0;
		for (var i = 0; i < count; i++) {
			sum += term_sum[i] * pow(jme, i);
		}
		sum /= 1.0e8;
		return sum;
	}

	function earthHeliocentricLongitude(jme) {
		var sum = [];
		for (var i = 0; i < L_COUNT; i++) {
			sum[i] = earthPeriodicTermSummation(L_TERMS[i], l_subcount[i], jme);
		}
		return limitDegrees(rad2deg(earthValues(sum, L_COUNT, jme)));
	}

	function earthHeliocentricLatitude(jme) {
		var sum = [];
		for (var i = 0; i < B_COUNT; i++) {
			sum[i] = earthPeriodicTermSummation(B_TERMS[i], b_subcount[i], jme);
		}
		return rad2deg(earthValues(sum, B_COUNT, jme));
	}

	function earthRadiusVector(jme) {
		var sum = [];
		for (var i = 0; i < R_COUNT; i++) {
			sum[i] = earthPeriodicTermSummation(R_TERMS[i], r_subcount[i], jme);
		}
		return earthValues(sum, R_COUNT, jme);
	}

	function geocentricLongitude(l) {
		var theta = l + 180.0;
		if (theta >= 360.0) theta -= 360.0;
		return theta;
	}

	function geocentricLatitude(b) {
		return -b;
	}


	function meanElongationMoonSun(jce) {
		return thirdOrderPolynomial(1.0 / 189474.0, -0.0019142, 445267.11148, 297.85036, jce);
	}

	function meanAnomalySun(jce) {
		return thirdOrderPolynomial(-1.0 / 300000.0, -0.0001603, 35999.05034, 357.52772, jce);
	}

	function meanAnomalyMoon(jce) {
		return thirdOrderPolynomial(1.0 / 56250.0, 0.0086972, 477198.867398, 134.96298, jce);
	}

	function argumentLatitudeMoon(jce) {
		return thirdOrderPolynomial(1.0 / 327270.0, -0.0036825, 483202.017538, 93.27191, jce);
	}

	function ascendingLongitudeMoon(jce) {
		return thirdOrderPolynomial(1.0 / 450000.0, 0.0020708, -1934.136261, 125.04452, jce);
	}

	function xyTermSummation(i, x) {
		var sum = 0;
		for (var j = 0; j < TERM_Y_COUNT; j++) {
			sum += x[j] * Y_TERMS[i][j];
		}
		return sum;
	}

	function nutationLongitudeAndObliquity(jce, x) {
		var xy_term_sum, sum_psi = 0, sum_epsilon = 0;
		for (var i = 0; i < Y_COUNT; i++) {
			xy_term_sum = deg2rad(xyTermSummation(i, x));
			sum_psi += (PE_TERMS[i][TERM_PSI_A] + jce * PE_TERMS[i][TERM_PSI_B]) * sin(xy_term_sum);
			sum_epsilon += (PE_TERMS[i][TERM_EPS_C] + jce * PE_TERMS[i][TERM_EPS_D]) * cos(xy_term_sum);
		}
		return {
			psi:sum_psi / 36000000.0,
			epsilon:sum_epsilon / 36000000.0
		}
	}

	function eclipticMeanObliquity(jme) {
		var u = jme / 10.0;
		return 84381.448 + u * (-4680.96 + u * (-1.55 + u * (1999.25 + u * (-51.38 + u * (-249.67 +
			u * ( -39.05 + u * ( 7.12 + u * ( 27.87 + u * ( 5.79 + u * 2.45)))))))));
	}

	function eclipticTrueObliquity(delta_epsilon, epsilon0) {
		return delta_epsilon + epsilon0 / 3600.0;
	}

	function aberrationCorrection(r) {
		return -20.4898 / (3600.0 * r);
	}

	function apparentSunLongitude(theta, delta_psi, delta_tau) {
		return theta + delta_psi + delta_tau;
	}


	function greenwichMeanSiderealTime(jd, jc) {
		return limitDegrees(280.46061837 + 360.98564736629 * (jd.valueOf() - 2451545.0) +
			jc * jc * (0.000387933 - jc / 38710000.0));
	}

	function greenwichSiderealTime(nu0, delta_psi, epsilon) {
		return nu0 + delta_psi * cos(deg2rad(epsilon));
	}

	function geocentricSunRightAscension(lamda, epsilon, beta) {
		var lamda_rad = deg2rad(lamda);
		var epsilon_rad = deg2rad(epsilon);
		return limitDegrees(rad2deg(atan2(sin(lamda_rad) * cos(epsilon_rad) -
			tan(deg2rad(beta)) * sin(epsilon_rad), cos(lamda_rad))));
	}

	function geocentricSunDeclination(beta, epsilon, lamda) {
		var beta_rad = deg2rad(beta);
		var epsilon_rad = deg2rad(epsilon);
		return rad2deg(asin(sin(beta_rad) * cos(epsilon_rad) +
			cos(beta_rad) * sin(epsilon_rad) * sin(deg2rad(lamda))));
	}

	function observerHourAngle(nu, longitude, alpha_deg) {
		return nu + longitude - alpha_deg;
	}

	function sunEquatorialHorizontalParallax(r) {
		return 8.794 / (3600.0 * r);
	}

	function sunRightAscensionParallaxAndTopocentricDec(latitude, elevation, xi, h, delta) {
		var lat_rad = deg2rad(latitude);
		var xi_rad = deg2rad(xi);
		var h_rad = deg2rad(h);
		var delta_rad = deg2rad(delta);
		var u = atan(0.99664719 * tan(lat_rad));
		var y = 0.99664717 * sin(u) + elevation * sin(lat_rad) / 6378140.0;
		var x = cos(u) + elevation * cos(lat_rad) / 6378140.0;
		var delta_alpha = rad2deg(atan2(-x * sin(xi_rad) * sin(h_rad), cos(delta_rad) -
			x * sin(xi_rad) * cos(h_rad)));
		return {
			alpha:delta_alpha,
			prime:rad2deg(atan2((sin(delta_rad) - y * sin(xi_rad)) * cos(delta_alpha),
				cos(delta_rad) - x * sin(xi_rad) * cos(h_rad)))
		};
	}

	function topocentricSunRightAscension(alpha_deg, delta_alpha) {
		return alpha_deg + delta_alpha;
	}

	function topocentricLocalHourAngle(h, delta_alpha) {
		return h - delta_alpha;
	}

	function topocentricElevationAngle(latitude, delta_prime, h_prime) {
		var lat_rad = deg2rad(latitude);
		var delta_prime_rad = deg2rad(delta_prime);
		return rad2deg(asin(sin(lat_rad) * sin(delta_prime_rad) +
			cos(lat_rad) * cos(delta_prime_rad) * cos(deg2rad(h_prime))));
	}


	function atmosphericRefractionCorrection(pressure, temperature, e0) {
		return (pressure / 1010.0) * (283.0 / (273.0 + temperature)) * 1.02 / (60 * tan(deg2rad(e0 + 10.3 / (e0 + 5.11))));
	}

	function topocentricElevationAngleCorrected(e0, delta_e) {
		return e0 + delta_e;
	}

	function topocentricZenithAngle(e) {
		return 90.0 - e;
	}

	function topocentricAzimuthAngleNeg180To180(h_prime, latitude, delta_prime) {
		var h_prime_rad = deg2rad(h_prime);
		var lat_rad = deg2rad(latitude);
		return rad2deg(atan2(sin(h_prime_rad),
			cos(h_prime_rad) * sin(lat_rad) -
				tan(deg2rad(delta_prime)) * cos(lat_rad)));
	}

	function topocentricAzimuthAngleZero360(azimuth180) {
		return azimuth180 + 180.0;
	}

	function surfaceIncidenceAngle(zenith, azimuth180, azm_rotation, slope) {

		var zenith_rad = deg2rad(zenith);
		var slope_rad = deg2rad(slope);
		var inner = cos(zenith_rad) * cos(slope_rad) + sin(slope_rad) * sin(zenith_rad) * cos(deg2rad(azimuth180 - azm_rotation));

		console.log("sia", inner, acos(inner));

		return rad2deg(
			acos(
				inner
			)
		);
	}

	function sunMeanLongitude(jme) {
		return limitDegrees(280.4664567 + jme * (360007.6982779 + jme * (0.03032028 +
			jme * (1 / 49931.0 + jme * (-1 / 15300.0 + jme * (-1 / 2000000.0))))));
	}

	function eot(m, alpha, del_psi, epsilon) {
		return limitMinutes(4.0 * (m - 0.0057183 - alpha + del_psi * cos(deg2rad(epsilon))));
	}

	function approxSunTransitTime(alpha_zero, longitude, nu) {
		return (alpha_zero - longitude - nu) / 360.0;
	}

	function sunHourAngleAtRiseSet(latitude, delta_zero, h0_prime) {
		var latitude_rad = deg2rad(latitude);
		var delta_zero_rad = deg2rad(delta_zero);

		var argument = (sin(deg2rad(h0_prime)) - sin(latitude_rad) * sin(delta_zero_rad)) / (cos(latitude_rad) * cos(delta_zero_rad));

		if (abs(argument) <= 1) {
			return limitDegrees180(rad2deg(acos(argument)));
		}
		return -99999;
	}

	function approxSunRiseAndSet(m_rts, h0) {
		var h0_dfrac = h0 / 360.0;

		m_rts[SUN_RISE] = limitZero2one(m_rts[SUN_TRANSIT] - h0_dfrac);
		m_rts[SUN_SET] = limitZero2one(m_rts[SUN_TRANSIT] + h0_dfrac);
		m_rts[SUN_TRANSIT] = limitZero2one(m_rts[SUN_TRANSIT]);
	}

	function rtsAlphaDeltaPrime(ad, n) {
		var a = ad[1] - ad[0];
		var b = ad[2] - ad[1];
		if (abs(a) >= 2.0) a = limitZero2one(a);
		if (abs(b) >= 2.0) b = limitZero2one(b);
		return ad[1] + n * (a + b + (b - a) * n) / 2.0;
	}

	function rtsSunAltitude(latitude, delta_prime, h_prime) {
		var latitude_rad = deg2rad(latitude);
		var delta_prime_rad = deg2rad(delta_prime);
		return rad2deg(asin(sin(latitude_rad) * sin(delta_prime_rad) +	cos(latitude_rad) * cos(delta_prime_rad) * cos(deg2rad(h_prime))));
	}

	function sunRiseAndSet(m_rts, h_rts, delta_prime, latitude, h_prime, h0_prime, sun) {
		return m_rts[sun] + (h_rts[sun] - h0_prime) /
			(360.0 * cos(deg2rad(delta_prime[sun])) * cos(deg2rad(latitude)) * sin(deg2rad(h_prime[sun])));
	}

	////////////////////////////////////////////////////////////////////////////////////////////////
	// Calculate required SPA parameters to get the right ascension (alpha) and declination (delta)
	// Note: JD must be already calculated and in structure
	////////////////////////////////////////////////////////////////////////////////////////////////
	function calculateGeocentricSunRightAscensionAndDeclination(input) {
		var output = {};
		var x = [];
		var julianDay = input.julianDay;
		output.jc = julianDay.century();
		output.jde = julianDay.ephemerisDay(input.delta_t);
		output.jce = julianDay.ephemerisCentury(input.delta_t);
		output.jme = julianDay.ephemerisMillennium(input.delta_t);
		output.l = earthHeliocentricLongitude(output.jme);
		output.b = earthHeliocentricLatitude(output.jme);
		output.r = earthRadiusVector(output.jme);
		output.theta = geocentricLongitude(output.l);
		output.beta = geocentricLatitude(output.b);
		x[TERM_X0] = output.x0 = meanElongationMoonSun(output.jce);
		x[TERM_X1] = output.x1 = meanAnomalySun(output.jce);
		x[TERM_X2] = output.x2 = meanAnomalyMoon(output.jce);
		x[TERM_X3] = output.x3 = argumentLatitudeMoon(output.jce);
		x[TERM_X4] = output.x4 = ascendingLongitudeMoon(output.jce);
		var del = nutationLongitudeAndObliquity(output.jce, x);
		output.del_psi = del.psi;
		output.del_epsilon = del.epsilon;
		output.epsilon0 = eclipticMeanObliquity(output.jme);
		output.epsilon = eclipticTrueObliquity(output.del_epsilon, output.epsilon0);
		output.del_tau = aberrationCorrection(output.r);
		output.lamda = apparentSunLongitude(output.theta, output.del_psi, output.del_tau);
		output.nu0 = greenwichMeanSiderealTime(julianDay, output.jc);
		output.nu = greenwichSiderealTime(output.nu0, output.del_psi, output.epsilon);
		output.alpha = geocentricSunRightAscension(output.lamda, output.epsilon, output.beta);
		output.delta = geocentricSunDeclination(output.beta, output.epsilon, output.lamda);
		var m = sunMeanLongitude(output.jme);
		output.eot = eot(m, output.alpha, output.del_psi, output.epsilon);
		return output;
	}

	function validateInputs(input) {
		if (!input.julianDay) throw new Error("No date present.");
		if ((input.pressure < 0     ) || (input.pressure > 5000)) throw new Error("Pressure " + input.pressure + " outside range (0 to 5000).");
		if ((input.temperature <= -273) || (input.temperature > 6000)) throw new Error("Temperature " + input.temperature + " outside range (-273 to 6000).");
		if ((input.hour == 24 ) && (input.minute > 0    )) throw new Error("Minute is in the next day.");
		if ((input.hour == 24 ) && (input.second > 0    )) throw new Error("Second is in the next day.");
		if (abs(input.delta_t) > 8000) throw new Error("Delta T " + input.delta_t + " is larger than 8000.");
		if (abs(input.longitude) > 180) throw new Error("Longitude " + input.longitude + " is larger than 180.");
		if (abs(input.latitude) > 90) throw new Error("Latitude " + input.latitude + " is larger than 90.");
		if (input.elevation < -6500000) throw new Error("Elevation " + input.elevation + " is less than -6500000.");
		if (abs(input.slope) > 360) throw new Error("Slope " + input.slope + " is larger than 360.");
		if (abs(input.azm_rotation) > 360) throw new Error("Azm Rotation " + input.azm_rotation + " is larger than 360.");
		if (abs(input.atmos_refract) > 10) throw new Error("Atospheric refraction " + input.atmos_refract + " is larger than 10.");
		return true;
	}

	////////////////////////////////////////////////////////////////////////
	// Calculate Equation of Time (EOT) and Sun Rise, Transit, & Set (RTS)
	////////////////////////////////////////////////////////////////////////
	function calculateSunRiseTransitSet(input) {
		validateInputs(input);
		var output = {};

		var alpha = [], delta = [];
		var m_rts = [], nu_rts = [], h_rts = [];
		var alpha_prime = [], delta_prime = [], h_prime = [];
		var h0_prime = -1 * (SUN_RADIUS + input.atmos_refract);

		var sun_rts = input.changeDay(input.julianDay.setTime(new Time(0)));
		var startOfDayData = sun_rts.calculateGeocentricSunRightAscensionAndDeclination();
		var nu = startOfDayData.nu;

		sun_rts.delta_t = 0;
		sun_rts.julianDay = sun_rts.julianDay.add(-1);

		for (var i = 0; i < 3; i++) {
			var tmpDayData = sun_rts.calculateGeocentricSunRightAscensionAndDeclination();
			alpha[i] = tmpDayData.alpha;
			delta[i] = tmpDayData.delta;
			sun_rts.julianDay = sun_rts.julianDay.add(1);
		}

		m_rts[SUN_TRANSIT] = approxSunTransitTime(alpha[1], input.longitude, nu);
		var h0 = sunHourAngleAtRiseSet(input.latitude, delta[1], h0_prime);
		if (h0 >= 0) {
			approxSunRiseAndSet(m_rts, h0);
			for (i = 0; i < SUN_COUNT; i++) {
				nu_rts[i] = nu + 360.985647 * m_rts[i];
				var n = m_rts[i] + input.delta_t / 86400.0;
				alpha_prime[i] = rtsAlphaDeltaPrime(alpha, n);
				delta_prime[i] = rtsAlphaDeltaPrime(delta, n);
				h_prime[i] = limitDegrees180pm(nu_rts[i] + input.longitude - alpha_prime[i]);
				h_rts[i] = rtsSunAltitude(input.latitude, delta_prime[i], h_prime[i]);
			}

			output.sunTransitHourAngle = h_rts[SUN_TRANSIT];
			output.sunRiseHourAngle = h_prime[SUN_RISE];
			output.sunSetHourAngle = h_prime[SUN_SET];

			output.sunTransitUTC = new Time(m_rts[SUN_TRANSIT] - h_prime[SUN_TRANSIT] / 360.0);
			output.sunRiseUTC = new Time(sunRiseAndSet(m_rts, h_rts, delta_prime, input.latitude, h_prime, h0_prime, SUN_RISE));
			output.sunSetUTC = new Time(sunRiseAndSet(m_rts, h_rts, delta_prime, input.latitude, h_prime, h0_prime, SUN_SET));

		} else {
			return null;
		}
		return output;
	}

	function calculateSunPosition(input) {
		validateInputs(input);
		var intermediate = input.calculateGeocentricSunRightAscensionAndDeclination();
		var output = {};

		// limitDegrees ? document suggests h should be limited
		output.h = observerHourAngle(intermediate.nu, input.longitude, intermediate.alpha);
		output.xi = sunEquatorialHorizontalParallax(intermediate.r);
		var del = sunRightAscensionParallaxAndTopocentricDec(input.latitude, input.elevation, output.xi, output.h, intermediate.delta);
		output.del_alpha = del.alpha;
		output.delta_prime = del.prime;
		output.alpha_prime = topocentricSunRightAscension(intermediate.alpha, output.del_alpha);
		output.h_prime = topocentricLocalHourAngle(output.h, output.del_alpha);
		output.e0 = topocentricElevationAngle(input.latitude, input.delta_prime, output.h_prime);
		output.del_e = atmosphericRefractionCorrection(input.pressure, input.temperature, output.e0);
		output.e = topocentricElevationAngleCorrected(output.e0, output.del_e);
		output.zenith = topocentricZenithAngle(output.e);
		output.azimuth180 = topocentricAzimuthAngleNeg180To180(output.h_prime, input.latitude, input.delta_prime);
		output.azimuth = topocentricAzimuthAngleZero360(output.azimuth180);
		output.incidence = surfaceIncidenceAngle(output.zenith, output.azimuth180, input.azm_rotation, input.slope);

		return output;
	}

	// DATA
	///////////////////////////////////////////////////
	/// Earth Periodic Terms
	///////////////////////////////////////////////////
	L_TERMS = [
		[
			[175347046.0, 0, 0],
			[3341656.0, 4.6692568, 6283.07585],
			[34894.0, 4.6261, 12566.1517],
			[3497.0, 2.7441, 5753.3849],
			[3418.0, 2.8289, 3.5231],
			[3136.0, 3.6277, 77713.7715],
			[2676.0, 4.4181, 7860.4194],
			[2343.0, 6.1352, 3930.2097],
			[1324.0, 0.7425, 11506.7698],
			[1273.0, 2.0371, 529.691],
			[1199.0, 1.1096, 1577.3435],
			[990, 5.233, 5884.927],
			[902, 2.045, 26.298],
			[857, 3.508, 398.149],
			[780, 1.179, 5223.694],
			[753, 2.533, 5507.553],
			[505, 4.583, 18849.228],
			[492, 4.205, 775.523],
			[357, 2.92, 0.067],
			[317, 5.849, 11790.629],
			[284, 1.899, 796.298],
			[271, 0.315, 10977.079],
			[243, 0.345, 5486.778],
			[206, 4.806, 2544.314],
			[205, 1.869, 5573.143],
			[202, 2.4458, 6069.777],
			[156, 0.833, 213.299],
			[132, 3.411, 2942.463],
			[126, 1.083, 20.775],
			[115, 0.645, 0.98],
			[103, 0.636, 4694.003],
			[102, 0.976, 15720.839],
			[102, 4.267, 7.114],
			[99, 6.21, 2146.17],
			[98, 0.68, 155.42],
			[86, 5.98, 161000.69],
			[85, 1.3, 6275.96],
			[85, 3.67, 71430.7],
			[80, 1.81, 17260.15],
			[79, 3.04, 12036.46],
			[71, 1.76, 5088.63],
			[74, 3.5, 3154.69],
			[74, 4.68, 801.82],
			[70, 0.83, 9437.76],
			[62, 3.98, 8827.39],
			[61, 1.82, 7084.9],
			[57, 2.78, 6286.6],
			[56, 4.39, 14143.5],
			[56, 3.47, 6279.55],
			[52, 0.19, 12139.55],
			[52, 1.33, 1748.02],
			[51, 0.28, 5856.48],
			[49, 0.49, 1194.45],
			[41, 5.37, 8429.24],
			[41, 2.4, 19651.05],
			[39, 6.17, 10447.39],
			[37, 6.04, 10213.29],
			[37, 2.57, 1059.38],
			[36, 1.71, 2352.87],
			[36, 1.78, 6812.77],
			[33, 0.59, 17789.85],
			[30, 0.44, 83996.85],
			[30, 2.74, 1349.87],
			[25, 3.16, 4690.48]
		],
		[
			[628331966747.0, 0, 0],
			[206059.0, 2.678235, 6283.07585],

			[4303.0, 2.6351, 12566.1517],
			[425.0, 1.59, 3.523],
			[119.0, 5.796, 26.298],
			[109.0, 2.966, 1577.344],
			[93, 2.59, 18849.23],
			[72, 1.14, 529.69],
			[68, 1.87, 398.15],
			[67, 4.41, 5507.55],
			[59, 2.89, 5223.69],
			[56, 2.17, 155.42],
			[45, 0.4, 796.3],
			[36, 0.47, 775.52],
			[29, 2.65, 7.11],
			[21, 5.34, 0.98],
			[19, 1.85, 5486.78],
			[19, 4.97, 213.3],
			[17, 2.99, 6275.96],
			[16, 0.03, 2544.31],
			[16, 1.43, 2146.17],
			[15, 1.21, 10977.08],
			[12, 2.83, 1748.02],
			[12, 3.26, 5088.63],
			[12, 5.27, 1194.45],
			[12, 2.08, 4694],
			[11, 0.77, 553.57],
			[10, 1.3, 3286.6],
			[10, 4.24, 1349.87],
			[9, 2.7, 242.73],
			[9, 5.64, 951.72],
			[8, 5.3, 2352.87],
			[6, 2.65, 9437.76],
			[6, 4.67, 4690.48]
		],
		[
			[52919.0, 0, 0],
			[8720.0, 1.0721, 6283.0758],
			[309.0, 0.867, 12566.152],
			[27, 0.05, 3.52],
			[16, 5.19, 26.3],
			[16, 3.68, 155.42],
			[10, 0.76, 18849.23],
			[9, 2.06, 77713.77],
			[7, 0.83, 775.52],
			[5, 4.66, 1577.34],
			[4, 1.03, 7.11],
			[4, 3.44, 5573.14],
			[3, 5.14, 796.3],
			[3, 6.05, 5507.55],
			[3, 1.19, 242.73],
			[3, 6.12, 529.69],
			[3, 0.31, 398.15],
			[3, 2.28, 553.57],
			[2, 4.38, 5223.69],
			[2, 3.75, 0.98]
		],
		[
			[289.0, 5.844, 6283.076],
			[35, 0, 0],
			[17, 5.49, 12566.15],
			[3, 5.2, 155.42],
			[1, 4.72, 3.52],
			[1, 5.3, 18849.23],
			[1, 5.97, 242.73]
		],
		[
			[114.0, 3.142, 0],
			[8, 4.13, 6283.08],
			[1, 3.84, 12566.15]
		],
		[
			[1, 3.14, 0]
		]
	];


	B_TERMS =
		[
			[
				[280.0, 3.199, 84334.662],
				[102.0, 5.422, 5507.553],
				[80, 3.88, 5223.69],
				[44, 3.7, 2352.87],
				[32, 4, 1577.34]
			],
			[
				[9, 3.9, 5507.55],
				[6, 1.73, 5223.69]
			]
		];

	R_TERMS =
		[
			[
				[100013989.0, 0, 0],
				[1670700.0, 3.0984635, 6283.07585],
				[13956.0, 3.05525, 12566.1517],
				[3084.0, 5.1985, 77713.7715],
				[1628.0, 1.1739, 5753.3849],
				[1576.0, 2.8469, 7860.4194],
				[925.0, 5.453, 11506.77],
				[542.0, 4.564, 3930.21],
				[472.0, 3.661, 5884.927],
				[346.0, 0.964, 5507.553],
				[329.0, 5.9, 5223.694],
				[307.0, 0.299, 5573.143],
				[243.0, 4.273, 11790.629],
				[212.0, 5.847, 1577.344],
				[186.0, 5.022, 10977.079],
				[175.0, 3.012, 18849.228],
				[110.0, 5.055, 5486.778],
				[98, 0.89, 6069.78],
				[86, 5.69, 15720.84],
				[86, 1.27, 161000.69],
				[85, 0.27, 17260.15],
				[63, 0.92, 529.69],
				[57, 2.01, 83996.85],
				[56, 5.24, 71430.7],
				[49, 3.25, 2544.31],
				[47, 2.58, 775.52],
				[45, 5.54, 9437.76],
				[43, 6.01, 6275.96],
				[39, 5.36, 4694],
				[38, 2.39, 8827.39],
				[37, 0.83, 19651.05],
				[37, 4.9, 12139.55],
				[36, 1.67, 12036.46],
				[35, 1.84, 2942.46],
				[33, 0.24, 7084.9],
				[32, 0.18, 5088.63],
				[32, 1.78, 398.15],
				[28, 1.21, 6286.6],
				[28, 1.9, 6279.55],
				[26, 4.59, 10447.39]
			],
			[
				[103019.0, 1.10749, 6283.07585],
				[1721.0, 1.0644, 12566.1517],
				[702.0, 3.142, 0],
				[32, 1.02, 18849.23],
				[31, 2.84, 5507.55],
				[25, 1.32, 5223.69],
				[18, 1.42, 1577.34],
				[10, 5.91, 10977.08],
				[9, 1.42, 6275.96],
				[9, 0.27, 5486.78]
			],
			[
				[4359.0, 5.7846, 6283.0758],
				[124.0, 5.579, 12566.152],
				[12, 3.14, 0],

				[9, 3.63, 77713.77],
				[6, 1.87, 5573.14],
				[3, 5.47, 18849]
			],
			[
				[145.0, 4.273, 6283.076],
				[7, 3.92, 12566.15]
			],
			[
				[4, 2.56, 6283.08]
			]
		];

	////////////////////////////////////////////////////////////////
	/// Periodic Terms for the nutation in longitude and obliquity
	////////////////////////////////////////////////////////////////
	Y_TERMS =
		[
			[0, 0, 0, 0, 1],
			[-2, 0, 0, 2, 2],
			[0, 0, 0, 2, 2],
			[0, 0, 0, 0, 2],
			[0, 1, 0, 0, 0],
			[0, 0, 1, 0, 0],
			[-2, 1, 0, 2, 2],
			[0, 0, 0, 2, 1],
			[0, 0, 1, 2, 2],
			[-2, -1, 0, 2, 2],
			[-2, 0, 1, 0, 0],
			[-2, 0, 0, 2, 1],
			[0, 0, -1, 2, 2],
			[2, 0, 0, 0, 0],
			[0, 0, 1, 0, 1],
			[2, 0, -1, 2, 2],
			[0, 0, -1, 0, 1],
			[0, 0, 1, 2, 1],
			[-2, 0, 2, 0, 0],
			[0, 0, -2, 2, 1],
			[2, 0, 0, 2, 2],
			[0, 0, 2, 2, 2],
			[0, 0, 2, 0, 0],
			[-2, 0, 1, 2, 2],
			[0, 0, 0, 2, 0],
			[-2, 0, 0, 2, 0],
			[0, 0, -1, 2, 1],
			[0, 2, 0, 0, 0],
			[2, 0, -1, 0, 1],
			[-2, 2, 0, 2, 2],
			[0, 1, 0, 0, 1],
			[-2, 0, 1, 0, 1],
			[0, -1, 0, 0, 1],
			[0, 0, 2, -2, 0],
			[2, 0, -1, 2, 1],
			[2, 0, 1, 2, 2],
			[0, 1, 0, 2, 2],
			[-2, 1, 1, 0, 0],
			[0, -1, 0, 2, 2],
			[2, 0, 0, 2, 1],
			[2, 0, 1, 0, 0],
			[-2, 0, 2, 2, 2],
			[-2, 0, 1, 2, 1],
			[2, 0, -2, 0, 1],
			[2, 0, 0, 0, 1],
			[0, -1, 1, 0, 0],
			[-2, -1, 0, 2, 1],
			[-2, 0, 0, 0, 1],
			[0, 0, 2, 2, 1],
			[-2, 0, 2, 0, 1],
			[-2, 1, 0, 2, 1],
			[0, 0, 1, -2, 0],
			[-1, 0, 1, 0, 0],
			[-2, 1, 0, 0, 0],
			[1, 0, 0, 0, 0],
			[0, 0, 1, 2, 0],

			[0, 0, -2, 2, 2],
			[-1, -1, 1, 0, 0],
			[0, 1, 1, 0, 0],
			[0, -1, 1, 2, 2],
			[2, -1, -1, 2, 2],
			[0, 0, 3, 2, 2],
			[2, -1, 0, 2, 2]
		];

	PE_TERMS = [
		[-171996, -174.2, 92025, 8.9],
		[-13187, -1.6, 5736, -3.1],
		[-2274, -0.2, 977, -0.5],
		[2062, 0.2, -895, 0.5],
		[1426, -3.4, 54, -0.1],
		[712, 0.1, -7, 0],
		[-517, 1.2, 224, -0.6],
		[-386, -0.4, 200, 0],
		[-301, 0, 129, -0.1],
		[217, -0.5, -95, 0.3],
		[-158, 0, 0, 0],
		[129, 0.1, -70, 0],
		[123, 0, -53, 0],
		[63, 0, 0, 0],
		[63, 0.1, -33, 0],
		[-59, 0, 26, 0],
		[-58, -0.1, 32, 0],
		[-51, 0, 27, 0],
		[48, 0, 0, 0],
		[46, 0, -24, 0],
		[-38, 0, 16, 0],
		[-31, 0, 13, 0],
		[29, 0, 0, 0],
		[29, 0, -12, 0],
		[26, 0, 0, 0],
		[-22, 0, 0, 0],
		[21, 0, -10, 0],
		[17, -0.1, 0, 0],
		[16, 0, -8, 0],
		[-16, 0.1, 7, 0],
		[-15, 0, 9, 0],
		[-13, 0, 7, 0],
		[-12, 0, 6, 0],
		[11, 0, 0, 0],
		[-10, 0, 5, 0],
		[-8, 0, 3, 0],
		[7, 0, -3, 0],
		[-7, 0, 0, 0],
		[-7, 0, 3, 0],
		[-7, 0, 3, 0],
		[6, 0, 0, 0],
		[6, 0, -3, 0],
		[6, 0, -3, 0],
		[-6, 0, 3, 0],
		[-6, 0, 3, 0],
		[5, 0, 0, 0],
		[-5, 0, 3, 0],
		[-5, 0, 3, 0],
		[-5, 0, 3, 0],
		[4, 0, 0, 0],
		[4, 0, 0, 0],
		[4, 0, 0, 0],
		[-4, 0, 0, 0],
		[-4, 0, 0, 0],
		[-4, 0, 0, 0],
		[3, 0, 0, 0],
		[-3, 0, 0, 0],
		[-3, 0, 0, 0],
		[-3, 0, 0, 0],
		[-3, 0, 0, 0],
		[-3, 0, 0, 0],
		[-3, 0, 0, 0],
		[-3, 0, 0, 0]
	];

	function SolarPosition(julianDay, latitude, longitude, delta_t, elevation, pressure, temperature, slope, azm_rotation, atmos_refract) {
		this.julianDay = julianDay || JulianDay.fromDate();
		this.latitude = latitude || 0;
		this.longitude = longitude || 0;
		this.delta_t = delta_t || 64.797;
		this.elevation = elevation || 1829;
		this.pressure = pressure || 835;
		this.temperature = temperature || 10;
		this.slope = slope || 0;
		this.azm_rotation = azm_rotation || 180;
		this.atmos_refract = atmos_refract || 0.5667;
	}

	SolarPosition.prototype.getSunRiseTransitSet = function() {
		return calculateSunRiseTransitSet(this);
	};

	SolarPosition.prototype.getSunPosition = function() {
		return calculateSunPosition(this);
	};

	SolarPosition.prototype.calculateGeocentricSunRightAscensionAndDeclination = function() {
		return calculateGeocentricSunRightAscensionAndDeclination(this);
	};

	SolarPosition.prototype.changeDay = function(newJulianDay) {
		return new SolarPosition(newJulianDay, this.latitude, this.longitude, this.delta_t, this.elevation, this.pressure, this.temperature, this.slope, this.azm_rotation, this.atmos_refract);
	};

	return SolarPosition;

})();


function getOffset() {
var offset = new Date().getTimezoneOffset()
return ((offset<0? '+':'-')+ 
          parseInt(Math.abs(offset/60)) +
          Math.abs(offset%60)) / 10;        
      };
      
function getSunset(lat, lon) {
    var jd = JulianDay.fromDate(new Date());
    var offset = getOffset();
    var sp = new SolarPosition(jd, lat, lon, offset);
    var t = sp.getSunRiseTransitSet();
    return t.sunSetUTC.changeTimeZone(0, offset).toString();
}
function getSunrise(lat, lon) {
    var jd = JulianDay.fromDate(new Date());
    var offset = getOffset();
    var sp = new SolarPosition(jd, lat, lon, offset);
    var t = sp.getSunRiseTransitSet();
    return t.sunRiseUTC.changeTimeZone(0, offset).toString();
}      

function isNight(lat, lon) {
    
    // The function we needed: Is it night, or not?
    
    var ss = Date.parse('01/01/2013 ' + getSunset(lat, lon).split('.')[0]);
    var sr = Date.parse('01/01/2013 ' + getSunrise(lat, lon).split('.')[0]);
    var date = new Date();
    var current = Date.parse('01/01/2013 ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds());   
 
    if (current < sr || current > ss) {
        return true;
    }
    else {
        return false;
    }
}