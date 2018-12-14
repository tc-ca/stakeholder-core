/*******************************************************************************
netWorkDays(s, e)

Provided two JavaScript Date objects, the netWorkDays function will calculate 
the number of working days between the specified start and end date supplied in
the arguments and return the value as an integer.

in:     s   -   Start date
        e   -   End date
*******************************************************************************/

var MS_PER_DAY = 86400000;
var SATURDAY = 6;
var SUNDAY = 0;

function netWorkDays(s, e){
    var workDays = 0;
    if(s == null || e == null) return workDays;
    
    for(var i = s; i < e; i = new Date(i.getTime() + MS_PER_DAY)){
        if(i.getDay() != SUNDAY && i.getDay() != SATURDAY)
            workDays++;
    }
    
    return workDays;
}