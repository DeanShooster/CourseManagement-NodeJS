
/**
 * Calculates how many days are between 2 given dates.
 * @param {StartingDate} start 
 * @param {endingDate} end 
 * @returns The difference in days positive/negative.
 */
function DateDiff(start,end)
{
    return (new Date(end) - new Date(start)) /  (1000*60*60*24);
}

/**
 * Calculates a given date the date + days, date. 
 * @param {Starting Date} date 
 * @param {Number of days to add} i 
 * @returns False for weekend days otherwise date
 */
function AddDays( date , i )
{
    const newDate = new Date( date.valueOf() );
    newDate.setUTCDate( newDate.getUTCDate() + (i+1) );
    if( newDate.getUTCDay() >= 5 )
        return false;
    return newDate;
}

/**
 * Converts a date object to DD/MM string.
 * @param {Date} date 
 * @returns date string DD/MM
 */
function ConvertDate( date )
{
    let day;
    if( date.getUTCDate() < 10 )
        day = '0' + (date.getUTCDate());
    else
        day = date.getUTCDate();
    let month;
    if( date.getUTCMonth() < 10 )
        month = '0' + (date.getUTCMonth()+1);
    else
        month = (date.getUTCMonth()+1);
    return day + '/' + month;
}

module.exports = {DateDiff,AddDays,ConvertDate};