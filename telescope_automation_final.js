
var SUP;

// Function to turn tracking off. Liberated from BJD scripts.
function trkOff()
{
    if (Telescope.CanSetTracking)
    {
        Telescope.Tracking = false;
        Console.PrintLine("--> Tracking is turned off.");
    }
}

function trkOn()
{
    if (Telescope.CanSetTracking)
    {
        Telescope.Tracking = true;
        Console.PrintLine("--> Tracking is turned on :-)");
    }
}

function openDome()
{
    switch (Dome.ShutterStatus)
    {
        // Dome is open
        case 0:
        Console.PrintLine("--> Dome shutter is already open :-P");
        break;

        // Dome is closed
        case 1:
        Console.PrintLine("--> Dome shutter is closed.");
        Dome.OpenShutter();
        Util.WaitForMilliseconds(500);

        while (Dome.ShutterStatus == 2)
        {
            Console.PrintLine("*** Dome shutter is opening...");
            Util.WaitForMilliseconds(2000);
        }

        if (Dome.ShutterStatus == 0)
        {
            Console.PrintLine("--> Dome shutter is open...");
        }
        else
            Console.PrintLine("--> Dome is NOT open.");
        break;

        case 2:
        while (Dome.ShutterStatus == 2)
        {
            Console.PrintLine("*** Dome shutter is open...");
            Util.WaitForMilliseconds(2000);
        }
        Console.PrintLine("--> Dome shutter is opened...");
        break;

        // Dome is closing. Let it close and then open it.
        case 3:
        while (Dome.ShutterStatus ==3)
        {
            Console.PrintLine("*** Dome shutter is closing. Waiting for it close...");
            Util.WaitForMilliseconds(2000);
        }
        
        Dome.OpenShutter();
        Util.WaitForMilliseconds(500);

        while (Dome.ShutterStatus == 2)
        {
            Console.PrintLine("*** Dome Shutter is opening.");
            Util.WaitForMilliseconds(2000);
        }
        Console.PrintLine("--> Dome shutter is open...");
        break;

        // Houston, we have a problem.
        case 4:
        Console.PrintLine("There was a problem with the shutter control...")
        break;
    }

    // Home the dome if not already done.
    if (!Dome.AtHome)
    {
        Dome.FindHome();
        while (!Dome.AtHome)
        {
            Console.PrintLine("*** Homing dome...");
            Util.WaitForMilliseconds(2000);
        }
        Console.PrintLine("--> Dome is homed... Bigly.");
    }
    
}

function closeDome()
{
    switch (Dome.ShutterStatus)
    {
        //////////////////
        // Dome is open //
        //////////////////
        case 0:
        Console.PrintLine("--> Dome shutter is open.");
        Dome.CloseShutter();
        Util.WaitForMilliseconds(4000);

        while (Dome.ShutterStatus == 3)
        {
            Console.PrintLine("*** Dome shutter is closing...");
            Util.WaitForMilliseconds(2000);
        }

        // while (Dome.ShutterStatus == 2)
        // {
        //  Console.PrintLine("*** Dome shutter is opening...");
        //  Util.WaitForMilliseconds(2000);
        // }

        if (Dome.ShutterStatus == 0)
        {
            Console.PrintLine("--> Dome shutter is open...");
            
        }
        else
            Console.PrintLine("--> Dome is NOT open.");
        break;

        ////////////////////
        // Dome is closed //
        ////////////////////
        case 1:
        Console.PrintLine("--> Dome shutter is already closed :-P");
        break;

        ////////////////////////
        // Shutter is opening //
        ////////////////////////
        case 2:
        while (Dome.ShutterStatus == 2)
        {
            Console.PrintLine("*** Dome shutter is opening...");
            Util.WaitForMilliseconds(2000);
        }
        Console.PrintLine("--> Dome shutter is opened...");
        Util.WaitForMilliseconds(500);

        Dome.CloseShutter();
        Util.WaitForMilliseconds(4000);

        while (Dome.ShutterStatus == 3)
        {
            Console.PrintLine("*** Dome shutter is closing...");
            Util.WaitForMilliseconds(2000);
        }
        break;

        /////////////////////////////////////////////////////
        // Dome is closing. Let it close and then open it. //
        /////////////////////////////////////////////////////
        case 3:
        while (Dome.ShutterStatus ==3)
        {
            Console.PrintLine("*** Dome shutter is closing. Waiting for it close...");
            Util.WaitForMilliseconds(2000);
        }
        Console.PrintLine("--> Dome shutter is closed...");
        break;

        /////////////////////////////////
        // Houston, we have a problem. //
        /////////////////////////////////
        case 4:
        Console.PrintLine("There was a problem with the shutter control...")
        break;
    }
}

function homeDome()
{
    ////////////////////////////////////////
    // Home the dome if not already done. //
    ////////////////////////////////////////
    if (!Dome.AtHome)
    {
        Util.WaitForMilliseconds(2000);

        Dome.FindHome();

        while (!Dome.AtHome)
        {
            Console.PrintLine("*** Homing dome...");
            Util.WaitForMilliseconds(2000);
        }
        Console.PrintLine("--> Dome is homed... Bigly.");
    }
}

function getRADEC()
{
    var ras, des;
    if(Prefs.DoLocalTopo)                               // Get scope J2000 RA/Dec
    {
        SUP.LocalTopocentricToJ2000(Telescope.RightAscension, Telescope.Declnation);
        ras = SUP.J2000RA;
        des = SUP.J2000Dec;
    }
    else
    {
        ras = Telescope.RightAscension;
        des = Telescope.Declination;
    }

    return {ra: ras, dec: des};
}

function gotoRADec(ra, dec)
{
    if (Telescope.tracking)
    {
        Console.PrintLine(Telescope.Slewing);

        Telescope.SlewToCoordinates(ra, dec);
        Util.WaitForMilliseconds(100);

        Console.PrintLine(Telescope.Slewing);

        while (Telescope.Slewing)
        {
            Console.PrintLine("Going to...");
            Util.WaitForMilliseconds(500);
        }
        Console.PrintLine("Done.");

    }
}

function gotoAltAz(alt, az)
{
    if (Telescope.tracking)
    {
        //Console.PrintLine(Telescope.Slewing);

        Telescope.SlewToAltAz(alt, az);
        Util.WaitForMilliseconds(100);

        //Console.PrintLine(Telescope.Slewing);

        while (Telescope.Slewing)
        {
            Console.PrintLine("Going to...");
            Util.WaitForMilliseconds(2000);
        }
        Console.PrintLine("Done.");

    }
}

// change directory name to date of collection in both bias and frame
function biasCollection() {
    var tid;

    Console.PrintLine("Starting bias frame collection...");
    tid = Util.ShellExec("ColibriGrab.exe", "-n 50 -p Bias_25ms -e 25 -t 0 -f dark -w D:\\11132020\\Bias");
    Console.printline(tid)

    while (Util.IsTaskActive(tid)) {
        Util.WaitForMilliseconds(50);

        Console.PrintLine("Collecting bias frames...")
    }

    Util.ShellExec("taskkill.exe", "/im ColibriGrab.exe /t /f");
    Console.PrintLine("Finished bias frames...");
}

/*
var fs = require('fs');
var data = fs.readFileSync('C:/Users/GreenBird/Desktop/weather-current_demo.txt', 'utf8');
var env_arr = (data.split("\t"));
console.log(env_arr);

var RA_Moon = env_arr[23];
var Dec_Moon = env_arr[24];
var Moon_offset = 10.0
Console.Printline(RA_Moon, Dec_Moon);
*/
/*
function weatherCheck() {
    var bool = Weather.Available;
    var safe = Weather.Safe;
    Console.Printline(safe);
    //Console.Printline(bool == True);
    Console.Printline(bool);
    //console.printline(Weather.Available);
    //Console.Printline(Weather.Safe);
    //Console.Printline(Weather.Clouds);
    if (bool && safe) {
        //cloud_cover = Weather.Clouds;
        //var cloud_cover = Weather.Clouds;
        Console.Printline(Weather.Clouds);
        Console.Printline(Weather.Precipitation);
        Console.Printline(Weather.RelativeHumidity);
        Console.Printline(Weather.WindVelocity);
        
        if (Weather.Clouds > 0.2) { // condition might change 
            //Console.Printline("Clouds = ", Weather.Clouds);
            trkOff();
            closeDome();
            Dome.Park();
            Telescope.Park();
            Util.AbortScript();
        }
        //precipitation = Weather.Precipitation
        if (Weather.Precipitation == 'True') {
            //Console.Printline("Precipitation = ", Weather.Precipitation);
            trkOff();
            closeDome();
            Dome.Park();
            Telescope.Park();
            Util.AbortScript();
        }
        if (Weather.RelativeHumidity > 0.9) {
            //Console.Printline("Humidity = ", Weather.RelativeHumidity); 
            trkOff();
            closeDome();
            Dome.Park();
            Telescope.Park();
            Util.AbortScript();
        }
        if (Weather.WindVelocity > 30) {
            //Console.Printline("Wind Velocity = ", Weather.WindVelocity);
            trkOff();
            closeDome();
            Dome.Park();
            Telescope.Park();
            Util.AbortScript();
        }
        Console.Printline("All weather conditions met. Moving to observations.")
        // code conditions for wind velocity and direction 
    } else {
        Console.Printline("There is a problem with the weather server.");
    }
}
*/
//ct = Util.NewCTHereAndNow()
//var SunCalc = new SunCalc.SunCalc();
//var sunpos = SunCalc.getPosition(, 43.5, 80.5);
//console.log(sunpos.altitude);

//var moonpos = SunCalc.getMoonPosition(new Date(), ct.Latitude , 80.5);
//console.log(moonpos.altitude);


function nauticalTwilight() {
/*
    switch (Dome.ShutterStatus) {
        case 0:
            if (Dome.ShutterStatus == 0) {
                Console.PrintLine("Dome shutter still open.")
                Util.WaitForMilliseconds(1000);
                weatherCheck();
                main();
                break;
            }
        case 1:
            if (Dome.ShutterStatus == 1) {
                trkOff();
                //closeDome();
                Dome.Park();
                Telescope.Park();
                Util.AbortScript();
            }
        case 2:
            if (Dome.ShutterStatus == 2) {
                Console.Printline("Dome shutter is opening.")
                Util.WaitForMilliseconds(10000);
                weatherCheck();
                main();
                break;
            }
        case 3:
            if (Dome.ShutterStatus == 3) {
                Util.WaitForMilliseconds(10000);
                trkOff();
                //closeDome();
                Dome.Park();
                Telescope.Park();
                Util.AbortScript();
            }
        case 4:
            if (Dome.ShutterStatus == 4) {
                Console.PrintLine("There was a problem with the shutter control");
            }
    }
    */
    var n = Date.now() / (1000 * 60 * 60 * 24) - 366 * 8 - 365 * 22; // days from J2000.0
    var L = (280.461 + 0.9856474 * n) % 360; // mean longitude mod 360
    var g = (357.528 + 0.9856003 * n) % 360; // mean anomaly mod 360
    var lambda = L + 1.915 * Math.sin(g * Math.PI / 180) + 0.020 * Math.sin(2 * g * Math.PI / 180); //ecliptic longitude of the sun
    var epsilon = 23.439 - 0.0000004 * n; //obliquity of the ecliptic plane
    var Y = Math.cos(epsilon * Math.PI / 180) * Math.sin(lambda * Math.PI / 180);
    var X = Math.cos(lambda * Math.PI / 180);
    var a = Math.atan(Y / X);
    var RA;
    if (X < 0) {
        RA = (a*180/Math.PI) + 180;
    } else if (Y < 0 && X > 0) {
        RA = (a*180/Math.PI) + 360;
    } else {
        RA = a * 180 / Math.PI;
    }
    var Dec = Math.asin(Math.sin(epsilon * Math.PI / 180) * Math.sin(lambda * Math.PI / 180))*180/Math.PI;
    Console.Printline(RA, Dec);
    
    ctSun = Util.NewCTHereAndNow
    ctSun.RightAscension = RA / 15
    ctSun.Declination = Dec
    elevationSun = ctSun.Elevation
    if (elevationSun > -12.0) {
        trkOff();
        closeDome();
        Dome.Park();
        Telescope.Park();
        Util.AbortScript();
    } else {
        main();
    }
    
}
    


var timeDuration = 60.0; //mins - min time of observing and time interval before checking the code again
openDome();
homeDome();
Dome.UnparkHome();
Console.PrintLine("Dome is now unparked and slaved.");
trkOn();
Console.PrintLine("Tracking is turned on.");
biasCollection();

function main() {
    var writeDir = "13112020"

    var field1 = [273.735, -18.638]; // June/July
    var field2 = [103.263, 24.329]; // January
    var field3 = [129.869, 19.474]; // February
    var field4 = [56.684, 24.313]; // August
    var field5 = [318.657, -13.830]; // December
    var field6 = [222.785, -11.810]; // May
    var field7 = [334.741, -12.383]; // September
    var field8 = [39.791, 16.953]; // November
    var field9 = [8.974, 1.834]; // October
    var field10 = [142.138, 12.533]; // March
    var field11 = [206.512, -10.259]; // April


    // finding RA and Dec of all the fields above
    ct1 = Util.NewCThereAndNow()
    ct1.RightAscension = field1[0] / 15;
    ct1.Declination = parseFloat(field1[1]);

    ct2 = Util.NewCThereAndNow()
    ct2.RightAscension = field2[0] / 15;
    ct2.Declination = parseFloat(field2[1]);

    ct3 = Util.NewCThereAndNow()
    ct3.RightAscension = field3[0] / 15;
    ct3.Declination = parseFloat(field3[1]);

    ct4 = Util.NewCThereAndNow()
    ct4.RightAscension = field4[0] / 15;
    ct4.Declination = parseFloat(field4[1]);

    ct5 = Util.NewCThereAndNow()
    ct5.RightAscension = field5[0] / 15;
    ct5.Declination = parseFloat(field5[1]);

    ct6 = Util.NewCThereAndNow()
    ct6.RightAscension = field6[0] / 15;
    ct6.Declination = parseFloat(field6[1]);

    ct7 = Util.NewCThereAndNow()
    ct7.RightAscension = field7[0] / 15;
    ct7.Declination = parseFloat(field7[1]);

    ct8 = Util.NewCThereAndNow()
    ct8.RightAscension = field8[0] / 15;
    ct8.Declination = parseFloat(field8[1]);

    ct9 = Util.NewCThereAndNow()
    ct9.RightAscension = field9[0] / 15;
    ct9.Declination = parseFloat(field9[1]);

    ct10 = Util.NewCThereAndNow()
    ct10.RightAscension = field10[0] / 15;
    ct10.Declination = parseFloat(field10[1]);

    ct11 = Util.NewCThereAndNow()
    ct11.RightAscension = field11[0] / 15;
    ct11.Declination = parseFloat(field11[1]);

    // array of elevations, fields, and labels for all the fields for recognition purposes
    elevations = [
        [ct1.Elevation, ct1.Azimuth, field1, "field 1"],
        [ct2.Elevation, ct2.Azimuth, field2, "field 2"],
        [ct3.Elevation, ct3.Azimuth, field3, "field 3"],
        [ct4.Elevation, ct4.Azimuth, field4, "field 4"],
        [ct5.Elevation, ct5.Azimuth, field5, "field 5"],
        [ct6.Elevation, ct6.Azimuth, field6, "field 6"],
        [ct7.Elevation, ct7.Azimuth, field7, "field 7"],
        [ct8.Elevation, ct8.Azimuth, field8, "field 8"],
        [ct9.Elevation, ct9.Azimuth, field9, "field 9"],
        [ct10.Elevation, ct10.Azimuth, field10, "field 10"],
        [ct11.Elevation, ct11.Azimuth, field11, "field 11"]
    ];

    //console.Printline(elevations);
    //console.printline(ct1.azimuth);
    var elevationLimit = 10.0;
    var azimuthLimit = 180.0;
    var i;
    var k = 0;
    var m;
    // make a list of angular distance offset of all fields from the moon. these values are in degrees. 
    //var ang_moon = [];
    //var ang_dist_moon = [];
    /*
    for (m = 0; m < elevations.length; m++) {
        ang_moon.push([Math.sin(Dec_moon*Math.PI/180) * Math.sin(elevations[m][1][1] * Math.PI / 180) + Math.cos(Dec_moon*Math.PI/180) * Math.cos(elevations[m][1][1] * Math.PI / 180) * Math.cos((RA_moon - elevations[m][1][0]) * Math.PI / 180)]);
        //console.log(ang_moon);
        ang_dist_moon.push(Math.acos(ang_moon[m])*180/Math.PI);
        //console.log(ang_dist_moon);
    }
    */
    // find all fields that are above the elevation limit of 10 at that time in the night and all fields more than 10 degrees away from the Moon
    
    for (i = 0; i < elevations.length; i++) {
        if ((elevations[i - k][0] < elevationLimit) && (elevations[i - k][1] > azimuthLimit)) {
            //Console.Printline(elevations[i-k][1]);
            //Console.Printline(elevations[i - k][0] < elevationLimit && elevations[i - k][1] > azimuthLimit);
            elevations.splice(i - k, 1);
            k = k + 1;      
            
            
        } else {
            elevations = elevations;
            //Console.Printline(elevations[i][2]);
            
        }
        //Console.Printline("The field above the elevation limit of " + (elevationLimit.toString()) + " is " + elevations[i][3]);
        
    }
    //Console.Printline("Hi");
    //make sure that only fields above elevation and more than 10 degrees 
   // var r;
    //var a = 0;
    /*
    for (r = 0; r < ang_dist_moon.length; r++) {
        if (ang_dist_moon[r - a] < Moon_offset) {
            elevations.splice(r - a, 1);
            a = a + 1
        } else {
            elevations = elevations;   
        }
        Console.PrintLine("The field visible after accounting for moon offset is " + elevations[r][2]);
    }
    */
   //Console.Printline(elevations)
    //Console.Printline("Alt < 10 && ct.RightAscension < 0.25 * timeDuration")

    // latitude and sidereal time of telescope's position
   // var lat = CoordinateTransform.Latitude;
   // Console.PrintLine(lat);
   // var ST = CoordinateTransform.SiderealTime;
    

    // check the remaining fields to make sure they have a min of timeDuration hours of viewing time
    // this part of the code also changes the field to a higher ranked field if it becomes visible in the night

    var n = 0; 
    do {
        var field = elevations[n];
        ct = Util.NewCTHereAndNow();
        ct.RightAscension = field[2][0] / 15;
        ct.Declination = parseFloat(field[2][1]);
        //console.Printline(field[3]);
        var lat = ct.Latitude;
        //console.printline(lat);
        var ST = ct.SiderealTime;
        //console.printline(ST);
        var HA = ST - ct.RightAscension;
        //Console.Printline(HA);
        var Alt = Math.asin(Math.sin(ct.Declination*Math.PI/180) * Math.sin(lat*Math.PI/180) + Math.cos(ct.Declination*Math.PI/180) * Math.cos(lat*Math.PI/180) * Math.cos(HA*15*Math.PI/180))*180/Math.PI;
        n += 1;
        //console.PrintLine(Alt);
        var HA_limit = Math.acos((Math.sin(elevationLimit*Math.PI/180) - Math.sin(ct.Declination*Math.PI/180)*Math.sin(lat*Math.PI/180))/(Math.cos(ct.Declination*Math.PI/180)*Math.cos(lat*Math.PI/180)))*(180/Math.PI)/15;
        //Console.Printline(HA_limit);
        //Console.Printline(Math.abs(HA_limit-HA));
        //Console.Printline(Alt < elevationLimit || Math.abs(HA_limit - HA) < timeDuration/60.0);
        //console.PrintLine(ct.RightAscension, ct.Declination);
    } while (Alt < elevationLimit || Math.abs(HA_limit - HA) < timeDuration/60.0); // RA values - 15 degrees = 60 mins, 0.25 degrees = 1 min
    Console.Printline("The field chosen is " + field[3])


    Console.PrintLine("Target is at an elevation of " + ct.Elevation.toFixed(4) + " degrees.");
    Console.PrintLine("Going to " + field[2]);
    gotoRADec(ct.RightAscension, ct.Declination);
    Console.PrintLine("At target.");
    ct = Util.NewCThereAndNow()
    ct.RightAscension = field[2][0] / 15;
    ct.Declination = parseFloat(field[2][1]);


    Console.PrintLine("Target Alt/Az is: Alt. =" + ct.Elevation.toFixed(2) + "   Az.= " + ct.Azimuth.toFixed(2));

    if (Telescope.SideOfPier != Telescope.DestinationSideOfPier(ct.RightAscension, ct.Declination)) {
        Console.PrintLine("Flipping sides of pier...")
        gotoRADec(ct.RightAscension, ct.Declination);

    }
    else { Console.PrintLine("Already on the right side of the pier"); }

    while(Math.abs(Dome.Azimuth - ct.Azimuth) > 10) {
        Util.WaitForMilliseconds(2000);
        Console.Printline("Waiting for dome slit to reach telescope position.");
    }


    var loop_start = Util.SysUTCDate;
    while (Util.SysUTCDate - loop_start < timeDuration*60*1000) {
        //Console.Printline(Util.SysUTCDate - loop_start);
        Util.WaitForMilliseconds(500);
       

        //Console.Printline("Hi");

        var i, numruns, numexps;

        numexps = 2400;
        Console.Printline(field[1][0])
        

        // tid = Util.ShellExec("C:\\Users\\RedBird\\VS-Projects\\ColibriGrab\\Debug\\ColibriGrab.exe", "-n " + numexps.toString() + " -p " + "RA" + ct.RightAscension.toString() + "-DEC" + ct.Declination.toString() + "_25ms -e 25 -t 0 -f normal -w D:\\" + writeDir);

        tid = Util.ShellExec("ColibriGrab.exe", "-n " + numexps.toString() + " -p Field1_25ms -e 25 -t 5 -f normal -w D:\\11132020");


        while (Util.IsTaskActive(tid)) {
            Util.WaitForMilliseconds(1000);
            //Console.PrintLine("We are stuck in the looop :(");
            Console.PrintLine("Done exposing run # " + i.toString());
            //Console.PrintLine("--------------")
        }
    
        //Util.ShellExec("taskkill.exe", "/im ColibriGrab.exe /t /f");
        //console.PrintLine(field)
        //frameCollection();
        Util.WaitForMilliseconds(1000);
    }
    //Console.Printline(Util.SysUTCDate - loop_start);
    //Console.Printline(Util.SysUTCDate - loop_start < timeDuration*60*1000 - 0.5*60*1000); 
    
    nauticalTwilight();

}
//console.printline(Weather.Available && Weather.Safe);




//main(); // run the code immediately the first time
//Console.Printline("Main Is Done");
//console.printline(Weather.Available);
//Console.Printline(Weather.Safe);

//Console.PrintLine(loop_start);
//Console.Printline(Util.SysUTCDate - loop_start < timeDuration - 0.5);
/*
while(main == 'False') {
    shutCode();
    main();
}

*/
//var runCode = setInterval(main, 1000 * 60 * timeDuration); // run the code in the time interval specified to recheck for better and new fields
//Console.Printline(runCode);





// process.wait(); //Defect to keep console open on Visual Studio