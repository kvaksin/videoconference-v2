# Guest Access Test Script

## Manual Testing Steps

### 1. Test Ad-hoc Meeting Creation
1. Open http://localhost:3001/
2. Login with admin@example.com / admin123
3. Click "🚀 Start Meeting Now"
4. Verify you're redirected to meeting room
5. Note the meeting ID from URL

### 2. Test Guest Access
1. Copy the meeting ID from step 1
2. Open a new incognito/private browser window
3. Navigate to: http://localhost:3001/guest/join/MEETING_ID
4. Enter a guest name (e.g., "Test Guest")
5. Click "Join Meeting"
6. Verify redirect to guest meeting page

### 3. Test Guest Meeting Room
1. In guest window, verify you see:
   - Meeting title
   - Your name as "(Guest)"
   - Video/audio controls
   - Chat functionality
   - Permission button if media access denied

### 4. Test Multi-user Interaction
1. In authenticated user window:
   - Check browser console for "Guest joined" messages
   - Send a chat message
2. In guest window:
   - Enable camera/microphone if prompted
   - Send a chat message
   - Verify both users see each other's messages

### 5. Test Room Joining Logic
1. Check terminal output for:
   - Guest joining correct roomId
   - Socket events being emitted/received
   - No error messages

## Current Issues Fixed

### Issue 1: Room ID Mismatch ✅ FIXED
- **Problem**: Guests joined with meeting.id instead of meeting.roomId  
- **Solution**: Updated guest socket to use meetingInfo.roomId

### Issue 2: Missing Backend Handlers ✅ FIXED
- **Problem**: Backend didn't handle guest-joined/guest-left events
- **Solution**: Added socket event handlers in server/src/index.ts

### Issue 3: Async Loading Issue ✅ FIXED
- **Problem**: Socket initialized before meeting info loaded
- **Solution**: Made loadMeetingInfo async and wait for completion

### Issue 4: Event Listener Gaps ✅ FIXED
- **Problem**: MeetingPage didn't listen for guest events
- **Solution**: Added guest event listeners to authenticated user page

## Expected Behavior

### Terminal Output
```
User [USER_ID] joined room [ROOM_ID]
Guest [GUEST_NAME] joined meeting [ROOM_ID]
```

### Browser Console (Authenticated User)
```
Guest joined the meeting: {name: "Test Guest", isGuest: true, ...}
```

### Browser Console (Guest User)
```
Connected to server
User guest-[timestamp] joined room [ROOM_ID]
```

## Debugging Commands

### Check Socket Connections
```bash
# Monitor terminal for socket events
tail -f /dev/stdout

# Check if both users in same room
# Should see matching ROOM_ID in logs
```

### Browser Developer Tools
```javascript
// In guest browser console
sessionStorage.getItem('guestInfo')

// Check if socket connected
// Should see WebSocket connection in Network tab
```

## Success Criteria

- ✅ Guest can access meeting via link
- ✅ Guest appears in correct meeting room  
- ✅ Chat messages work between authenticated and guest users
- ✅ Socket events are properly handled on backend
- ✅ No console errors in either browser window
- ✅ Terminal shows guest joining correct room ID

## Next Steps

If issues persist:
1. Check browser permissions for camera/microphone
2. Verify WebSocket connection established
3. Compare room IDs in terminal logs
4. Test with simple text-only interaction first
5. Add more detailed logging for troubleshooting