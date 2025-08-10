# Google Calendar Clone - Subtle Bugs QA Report

This document contains 4 extremely subtle bugs that have been intentionally introduced into the Google Calendar clone application. These bugs are designed to be very hard to find and will only manifest under specific edge cases.

## Bug #1: Off-by-One Error in Duration Calculations for Midnight-Crossing Events

### Location
- **File**: `src/utilities/dateutils.js`
- **Function**: `getDurationSeconds()`
- **Lines**: 300-304

### Description
A subtle off-by-one error occurs when calculating the duration of events that cross midnight and start after 12 PM (noon). The duration calculation incorrectly subtracts 1 second from the actual duration.

### Root Cause
The function has an erroneous condition that checks if:
1. The start and end dates are different (event crosses midnight)
2. The start hour is greater than 12

When both conditions are met, it subtracts 1 second from the duration.

### Reproduction Steps
1. Create a new event that starts after 12:00 PM (e.g., 1:00 PM)
2. Set the end time to the next day (e.g., 2:00 AM the following day)
3. Save the event
4. View the event details or duration display
5. **Expected**: Duration should be 13 hours
6. **Actual**: Duration will show as 12 hours, 59 minutes, 59 seconds

### Test Cases
- **Test Case 1**: Event from 1:00 PM to 2:00 AM next day → Shows 12h 59m 59s instead of 13h
- **Test Case 2**: Event from 11:00 PM to 1:00 AM next day → Shows 1h 59m 59s instead of 2h
- **Test Case 3**: Event from 11:00 AM to 1:00 AM next day (control) → Shows correct 14h (bug doesn't trigger)

### Impact
- Incorrect time duration displays in event details
- Potential scheduling conflicts due to inaccurate duration calculations
- Reports and analytics based on event durations will be slightly off

---

## Bug #2: Leap Year Handling Edge Case for February 29th

### Location
- **File**: `src/utilities/dateutils.js` 
- **Function**: `createDateFromFormattedString()`
- **Lines**: 204-213

### Description
The leap year calculation incorrectly handles century years (years divisible by 100). It fails to properly implement the rule that century years must also be divisible by 400 to be leap years.

### Root Cause
The function is missing the crucial check for `year % 400 === 0` when handling century years. This causes:
- Years like 1900, 2100 to be treated as leap years (incorrect)
- Years like 2000, 2400 to be treated as non-leap years (incorrect)

### Reproduction Steps
1. Navigate to February 2000 in the calendar (or modify system date to test other century years)
2. Try to create an event on February 29, 2000
3. **Expected**: Should allow creation since 2000 is a leap year (divisible by 400)
4. **Actual**: The date gets forced to February 28, 2000

### Test Cases
- **Test Case 1**: Create event on Feb 29, 2000 → Gets forced to Feb 28 (incorrect)
- **Test Case 2**: Create event on Feb 29, 2100 → Should work but may behave incorrectly 
- **Test Case 3**: Create event on Feb 29, 2004 → Works correctly (not a century year)
- **Test Case 4**: Navigate calendar to Feb 2000 → May show incorrect number of days

### Impact
- Events scheduled for February 29th in certain years get moved to February 28th
- Calendar view may display incorrect number of days in February for century years
- Data corruption for events scheduled on leap days

---

## Bug #3: Daylight Saving Time Transition Edge Case

### Location
- **File**: `src/utilities/dateutils.js`
- **Function**: `getNextQuarterHour()`
- **Lines**: 58-63

### Description
During daylight saving time spring forward transition, the function fails to properly handle the "missing" 2 AM hour. It keeps suggesting 2 AM as a valid time when it should skip to 3 AM.

### Root Cause
The function has a hardcoded check for spring DST dates (March 8-14) and specifically checks for 2 AM hour, but instead of skipping to 3 AM, it incorrectly keeps the hour as 2 AM.

### Reproduction Steps
1. Set system date to the second Sunday in March (Spring DST transition)
2. Create a new event
3. Set start time to 1:45 AM
4. Click on the end time field to open time picker
5. **Expected**: Next suggested time should skip from 1:45 AM to 3:00 AM
6. **Actual**: May suggest 2:00 AM which doesn't exist on this date

### Test Cases
- **Test Case 1**: March 13, 2024 (Spring forward date) - start at 1:45 AM → End time suggestions may include 2:00 AM
- **Test Case 2**: March 13, 2024 - start at 1:30 AM → End time picker may show invalid 2:xx AM times
- **Test Case 3**: Regular day (not DST transition) → Works normally (control test)

### Impact
- Users can create events with impossible times during DST transitions
- Calendar may display events at times that don't exist
- Scheduling conflicts and confusion around DST transition dates

---

## Bug #4: Category Persistence Race Condition

### Location
- **File**: `src/context/store.js`
- **Functions**: `updateCtgColor()` (lines 582-584) and `setCategoryStatus()` (lines 557-559)

### Description
Race conditions in category operations due to asynchronous localStorage updates with different timing delays. When multiple category operations happen in rapid succession, the localStorage may not be updated correctly.

### Root Cause
Both functions use `setTimeout()` with different delays (1ms and 2ms respectively) before saving to localStorage. This creates race conditions when operations overlap.

### Reproduction Steps
1. Create multiple categories in the calendar
2. Rapidly perform the following actions in quick succession:
   - Change a category color
   - Toggle category visibility on/off
   - Change another category color
   - Toggle the same category visibility again
3. Refresh the page or restart the application
4. **Expected**: All changes should persist correctly
5. **Actual**: Some changes may be lost or inconsistent

### Test Cases
- **Test Case 1**: Rapidly change category color then toggle visibility → Color change may not persist
- **Test Case 2**: Toggle multiple categories on/off quickly → Some visibility states may not save
- **Test Case 3**: Perform category operations with 10ms+ gaps → Works correctly (control test)
- **Test Case 4**: Script-based rapid operations (if possible) → More likely to trigger the race condition

### Advanced Test Script (if browser console access available)
```javascript
// Execute in browser console to trigger race condition
const store = window.store; // Assuming store is globally accessible
store.updateCtgColor('category1', '#ff0000');
store.setCategoryStatus('category1', false);
store.updateCtgColor('category1', '#00ff00');
store.setCategoryStatus('category1', true);
// Check localStorage after execution - changes may be inconsistent
```

### Impact
- Category settings (color, visibility) may not persist correctly
- Users may lose customization settings
- Inconsistent behavior when users work quickly with categories
- Potential data corruption in category configurations

---

## General Testing Guidelines

### Environment Setup
- Test in different browsers (Chrome, Firefox, Safari)
- Test with different system timezones
- Test during actual DST transition periods when possible
- Use browser dev tools to modify system date/time for testing

### Debugging Tools
- Browser Developer Tools console for error messages
- localStorage inspection to verify data persistence
- Network tab to monitor any external API calls
- Performance tab to analyze timing issues

### Risk Assessment
- **High Risk**: Bugs #1 and #2 (data accuracy issues)
- **Medium Risk**: Bug #3 (user experience issues during specific dates)
- **Low Risk**: Bug #4 (intermittent persistence issues)

### Recommended Testing Approach
1. Start with manual testing following the reproduction steps
2. Focus on edge cases and boundary conditions
3. Test during actual DST transition periods
4. Use automated scripts for rapid-fire operations to trigger race conditions
5. Verify data persistence across browser sessions

---

*This document is intended for QA testing purposes. The bugs documented here are intentionally subtle and designed to be challenging to discover through normal usage patterns.*
