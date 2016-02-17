var settings = require('nconf');
var battery = require('./battery');
var waterLevel = 255;

var targetOxygen = settings.get("sim:target_oxygen");

// http://science.howstuffworks.com/oxygen-made-aboard-spacecraft.htm
// http://www.spaceacademy.net.au/flight/emg/spcdp.htm

/*
'DEPRESSURATION TIME FOR HOLED SPACECRAFT

CLS             'clear screen
mw = .029       'molecular weight of gas (kg/mole)  - air=0.029
temp = 293      'temp in kelvin (=20 Celcius)
Rg = 8.314      'Universal Gas Constant (J / mole-K)
press = 100000  'pressure in Pascal (Earth atmospheric = 101,300 Pa)
press0 = press  'keep record of initial pressure
vol = 30        'spacecraft cabin volume cubic metres
Ah = .0001      'impact hole in square metres
tm = 0          'start time (seconds)
PRINT USING "Spacecraft depressurisation - Hole size = #####.## sq
 cm"; Ah * 10000
PRINT "Time(sec/min)  Mass(kg)  Density(kg/m^3)  Pressure(kPa)"
f1$ = " ####/###.#     ###.#        ##.##           ###.##"
'compute initial mass and density of gas
mass = press * vol * mw / Rg / temp	'initial mass of gas
rho = mass / vol	'initial density
'now advance in time
DO
'print out parameters every 100 seconds
IF tm MOD 100 = 0 THEN
  PRINT USING f1$; tm; tm / 60; mass; rho; press / 1000
END IF
tm = tm + 1			'advance time by one second
massloss = Ah * SQR(2 * press * rho)	'compute mass loss in 1 sec
mass = mass - massloss		'compute new mass
rho = mass / vol		'compute new density
press = rho * Rg * temp / mw	.compute new pressure
LOOP WHILE press > press0 / 10  'do while pressure>10% initial
*/

module.exports.process = function(simState, delta) {
    // Use water to generate oxygen
    if (simState.oxygenLevel < targetOxygen) {
        var waterRequired = 0.0001 * delta;
        if (simState.waterLevel > waterRequired && battery.drain(simState, 10, delta)) {
            simState.waterLevel -= waterRequired;
            simState.oxygenLevel += 0.00005 * delta;
        }
    }
}